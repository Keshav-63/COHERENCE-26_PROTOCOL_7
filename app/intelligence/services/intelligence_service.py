"""
Intelligence Orchestration Service — PRAHARI
Main service layer that coordinates all engines + Gemini AI.
"""

import logging
from datetime import datetime
from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.intelligence.engine.aegis_watcher import AegisWatcher
from app.intelligence.services import gemini_service
from app.intelligence.models.transaction import BudgetTransaction
from app.intelligence.models.anomaly_flag import AnomalyFlag

logger = logging.getLogger(__name__)

# Singleton AegisWatcher (holds collusion graph state)
_watcher = AegisWatcher()


async def audit_transaction(
    db: AsyncIOMotorDatabase,
    tx_data: dict,
    save_to_db: bool = True,
) -> dict:
    """
    Full pipeline: Audit a transaction through all 8 anomaly layers + Gemini AI.
    """
    # Run the 7-layer + ML engine
    result = await _watcher.audit(db, tx_data)

    # Enrich with Gemini narrative if flagged
    ai_analysis = {}
    if result["status"] != "SAFE":
        ai_analysis = await gemini_service.analyze_transaction_anomaly(tx_data, result)

    result["gemini_analysis"] = ai_analysis.get("narrative")
    result["gemini_recommendation"] = ai_analysis.get("recommendation")

    # Save transaction to MongoDB
    if save_to_db:
        try:
            txn = BudgetTransaction(
                trans_id=tx_data.get("trans_id", f"TXN-{datetime.utcnow().timestamp()}"),
                dept_name=tx_data.get("dept_name", ""),
                admin_level=tx_data.get("admin_level", "state"),
                amount=float(tx_data.get("amount", 0)),
                vendor_id=tx_data.get("vendor_id", ""),
                item_category=tx_data.get("item_category", ""),
                latitude=float(tx_data.get("latitude", 0)),
                longitude=float(tx_data.get("longitude", 0)),
                timestamp=(
                    tx_data.get("timestamp")
                    if isinstance(tx_data.get("timestamp"), datetime)
                    else datetime.utcnow()
                ),
                ministry_code=tx_data.get("ministry_code"),
                scheme_code=tx_data.get("scheme_code"),
                fiscal_year=tx_data.get("fiscal_year"),
                state_code=tx_data.get("state_code"),
                risk_score=result["risk_score"],
                anomaly_reason=result["anomaly_reason"],
                status=result["status"],
                anomaly_flags=result["anomaly_flags"],
                gemini_analysis=result.get("gemini_analysis"),
            )
            await txn.insert()

            # Save individual anomaly flags
            for flag_key in result.get("anomaly_flags", []):
                flag = AnomalyFlag(
                    trans_id=txn.trans_id,
                    dept_name=tx_data.get("dept_name", ""),
                    ministry_code=tx_data.get("ministry_code"),
                    scheme_code=tx_data.get("scheme_code"),
                    fiscal_year=tx_data.get("fiscal_year"),
                    anomaly_type=flag_key,
                    severity=(
                        "CRITICAL" if result["risk_score"] > 0.8
                        else "HIGH" if result["risk_score"] > 0.6
                        else "MEDIUM"
                    ),
                    risk_score=result["risk_score"],
                    description=result["anomaly_reason"],
                    evidence=result.get("evidence", {}).get(flag_key, {}),
                    gemini_narrative=result.get("gemini_analysis"),
                    gemini_recommendation=result.get("gemini_recommendation"),
                    amount=float(tx_data.get("amount", 0)),
                    estimated_leakage=float(tx_data.get("amount", 0)) * result["risk_score"],
                )
                await flag.insert()

        except Exception as e:
            logger.error(f"Failed to save transaction/flags to DB: {e}")

    return result


async def get_all_anomalies(
    db: AsyncIOMotorDatabase,
    status_filter: Optional[str] = None,
    limit: int = 100,
) -> List[dict]:
    """Fetch all detected anomalies from MongoDB, enriched with context."""
    query = {}
    if status_filter:
        query["status"] = status_filter.upper()

    # Get from budget_transactions
    cursor = db["budget_transactions"].find(
        {"risk_score": {"$gt": 0.4}, **query}
    ).sort("risk_score", -1).limit(limit)
    transactions = await cursor.to_list(limit)

    # Also get from budget_allocations for scheme-level anomalies
    alloc_cursor = db["budget_allocations"].find(
        {"utilization_percentage": {"$exists": True}}
    ).sort("utilization_percentage", 1).limit(50)
    allocations = await alloc_cursor.to_list(50)

    anomalies = []
    for t in transactions:
        anomalies.append({
            "source": "transaction",
            "trans_id": t.get("trans_id"),
            "dept_name": t.get("dept_name"),
            "amount": t.get("amount"),
            "risk_score": t.get("risk_score", 0),
            "status": t.get("status", "UNKNOWN"),
            "anomaly_flags": t.get("anomaly_flags", []),
            "anomaly_reason": t.get("anomaly_reason"),
            "gemini_analysis": t.get("gemini_analysis"),
            "timestamp": t.get("timestamp"),
        })

    # Add allocation-level anomalies (very low or very high utilization)
    for a in allocations:
        util = float(a.get("utilization_percentage") or 0)
        be = float(a.get("budget_estimate") or 0)
        actual = float(a.get("actual_expenditure") or 0)
        if be == 0:
            continue

        # Flag extreme utilization cases
        if util < 10 and be > 100:
            risk = 0.75
            reason = f"Extremely low utilization ({util:.1f}%) on ₹{be:.0f} Cr allocation — fund lapse risk."
        elif util > 110:
            risk = 0.80
            reason = f"Over-expenditure ({util:.1f}% of BE) — excess of ₹{(actual-be):.0f} Cr."
        else:
            continue

        anomalies.append({
            "source": "allocation",
            "trans_id": a.get("allocation_code"),
            "dept_name": a.get("entity_name"),
            "amount": actual,
            "risk_score": risk,
            "status": "FLAGGED" if risk < 0.8 else "CRITICAL",
            "anomaly_flags": ["fund_lapse" if util < 10 else "over_expenditure"],
            "anomaly_reason": reason,
            "gemini_analysis": None,
            "timestamp": a.get("updated_at"),
        })

    anomalies.sort(key=lambda x: x.get("risk_score", 0), reverse=True)
    return anomalies


async def get_dashboard_summary(db: AsyncIOMotorDatabase) -> dict:
    """Compute executive dashboard summary with Gemini briefing."""
    from app.intelligence.engine.march_rush import get_current_fiscal_year
    fiscal_year = get_current_fiscal_year()

    # Core stats from transactions
    total_txns = await db["budget_transactions"].count_documents({})
    flagged_txns = await db["budget_transactions"].count_documents(
        {"risk_score": {"$gt": 0.4}}
    )
    critical_txns = await db["budget_transactions"].count_documents(
        {"risk_score": {"$gt": 0.8}}
    )

    # Leakage estimate from anomaly_flags
    pipeline = [
        {"$group": {"_id": None, "total": {"$sum": "$estimated_leakage"}}}
    ]
    agg = await db["anomaly_flags"].aggregate(pipeline).to_list(1)
    total_leakage = float(agg[0]["total"]) if agg else 0.0

    # Allocation stats from existing budget data
    alloc_pipeline = [
        {"$group": {
            "_id": None,
            "total_be": {"$sum": "$budget_estimate"},
            "total_actual": {"$sum": {"$ifNull": ["$actual_expenditure", 0]}},
            "count": {"$sum": 1},
        }}
    ]
    alloc_agg = await db["budget_allocations"].aggregate(alloc_pipeline).to_list(1)
    total_be = 0
    total_actual = 0
    alloc_count = 0
    if alloc_agg:
        total_be = float(alloc_agg[0].get("total_be", 0))
        total_actual = float(alloc_agg[0].get("total_actual", 0))
        alloc_count = int(alloc_agg[0].get("count", 0))

    flagged_pct = (flagged_txns / total_txns * 100) if total_txns > 0 else 0

    summary_stats = {
        "total_transactions": total_txns,
        "flagged": flagged_txns,
        "critical": critical_txns,
        "flagged_pct": round(flagged_pct, 1),
        "estimated_leakage_cr": round(total_leakage / 10_000_000, 2),
        "total_allocations_analyzed": alloc_count,
        "total_budget_estimate_cr": round(total_be, 2),
        "total_actual_expenditure_cr": round(total_actual, 2),
        "overall_utilization_pct": round(
            (total_actual / total_be * 100) if total_be > 0 else 0, 1
        ),
        "fiscal_year": fiscal_year,
    }

    # Gemini executive briefing
    top_anomalies = await get_all_anomalies(db, limit=3)
    briefing = await gemini_service.generate_executive_briefing(
        summary_stats, top_anomalies, fiscal_year
    )

    return {
        **summary_stats,
        "gemini_executive_briefing": briefing,
        "generated_at": datetime.utcnow().isoformat(),
    }
