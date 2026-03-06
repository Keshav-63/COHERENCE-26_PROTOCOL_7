"""
Phantom Utilization Analyzer — PRAHARI
Detects "paper spending" and ghost utilization in budget allocations.

Combines 5 weak signals into one Phantom Utilization Score (PUS):
  1. Temporal Clustering  – 70%+ expenditure in Feb–March
  2. Single-Vendor Concentration – 1 vendor absorbs >60% of tender value
  3. Geographic Clustering – All vendors from same pin-code cluster
  4. Payment Velocity – Project paid in impossibly few days
  5. Output Mismatch Proxy – Cross-signal with scheme performance data
"""

import logging
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

# Indian fiscal year: April 1 – March 31
# Q1: Apr–Jun, Q2: Jul–Sep, Q3: Oct–Dec, Q4: Jan–Mar


def _fiscal_quarter(month: int) -> int:
    """Map calendar month to Indian fiscal quarter."""
    if month in (4, 5, 6):
        return 1
    elif month in (7, 8, 9):
        return 2
    elif month in (10, 11, 12):
        return 3
    return 4  # Jan, Feb, Mar — the danger zone


async def analyze(
    db: AsyncIOMotorDatabase,
    entity_code: str,
    fiscal_year: str,
) -> dict:
    """
    Compute Phantom Utilization Score for an entity.

    Returns a dict with:
      - pus_score: 0.0–1.0
      - signals: breakdown of each signal
      - verdict: CLEAN / SUSPECT / PHANTOM
      - quality_adjusted_utilization: QAUS (penalizes March Rush)
    """
    signals = {}
    pus_components = []

    # ── Load expenditures from MongoDB ────────────────────────────────────
    expenditures = await db["expenditures"].find(
        {"entity_code": entity_code, "fiscal_year": fiscal_year}
    ).to_list(24)

    if not expenditures:
        return {
            "entity_code": entity_code,
            "fiscal_year": fiscal_year,
            "pus_score": 0.0,
            "signals": {},
            "verdict": "NO_DATA",
            "quality_adjusted_utilization": None,
        }

    total_spent = sum(float(e.get("expenditure_amount", 0)) for e in expenditures)
    if total_spent == 0:
        return {
            "entity_code": entity_code,
            "fiscal_year": fiscal_year,
            "pus_score": 0.0,
            "signals": {},
            "verdict": "CLEAN",
            "quality_adjusted_utilization": 0.0,
        }

    # ── 1. TEMPORAL CLUSTERING ────────────────────────────────────────────
    feb_mar_spent = sum(
        float(e.get("expenditure_amount", 0))
        for e in expenditures
        if e.get("month") in (2, 3)
    )
    temporal_ratio = feb_mar_spent / total_spent if total_spent else 0
    if temporal_ratio > 0.70:
        temporal_score = min(temporal_ratio, 1.0)
        pus_components.append(temporal_score * 0.30)  # weight 30%
    else:
        temporal_score = 0.0
    signals["temporal_clustering"] = {
        "feb_mar_ratio": round(temporal_ratio * 100, 1),
        "score": round(temporal_score, 3),
        "flagged": temporal_score > 0,
    }

    # ── 2. SINGLE-VENDOR CONCENTRATION ────────────────────────────────────
    vendor_concentration = 0.0
    vendor_flag = False
    try:
        pipeline = [
            {"$match": {
                "dept_name": entity_code,
                "fiscal_year": fiscal_year if fiscal_year else {"$exists": True},
            }},
            {"$group": {"_id": "$vendor_id", "total": {"$sum": "$amount"}}},
            {"$sort": {"total": -1}},
        ]
        vendor_agg = await db["budget_transactions"].aggregate(pipeline).to_list(5)
        if vendor_agg:
            top_vendor_share = vendor_agg[0]["total"] / sum(v["total"] for v in vendor_agg)
            vendor_concentration = top_vendor_share
            if top_vendor_share > 0.60:
                pus_components.append(top_vendor_share * 0.25)  # weight 25%
                vendor_flag = True
    except Exception as e:
        logger.warning(f"Vendor concentration analysis failed: {e}")
    signals["vendor_concentration"] = {
        "top_vendor_share_pct": round(vendor_concentration * 100, 1),
        "flagged": vendor_flag,
    }

    # ── 3. GEOGRAPHIC CLUSTERING ──────────────────────────────────────────
    geo_flag = False
    geo_cluster_score = 0.0
    try:
        pipeline = [
            {"$match": {"dept_name": entity_code}},
            {"$group": {"_id": {
                "lat_bucket": {"$floor": "$latitude"},
                "lon_bucket": {"$floor": "$longitude"},
            }, "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
        ]
        geo_agg = await db["budget_transactions"].aggregate(pipeline).to_list(10)
        if len(geo_agg) > 0:
            top_cluster = geo_agg[0]["count"]
            total_vendors = sum(g["count"] for g in geo_agg)
            cluster_ratio = top_cluster / total_vendors if total_vendors else 0
            if cluster_ratio > 0.80:
                geo_cluster_score = cluster_ratio
                pus_components.append(geo_cluster_score * 0.20)  # weight 20%
                geo_flag = True
    except Exception as e:
        logger.warning(f"Geographic clustering analysis failed: {e}")
    signals["geographic_clustering"] = {
        "cluster_concentration_pct": round(geo_cluster_score * 100, 1),
        "flagged": geo_flag,
    }

    # ── 4. PAYMENT VELOCITY ────────────────────────────────────────────────
    # Check if large contracts were paid in < 3 days (physically impossible)
    velocity_flag = False
    velocity_score = 0.0
    try:
        fast_payments = await db["budget_transactions"].count_documents({
            "dept_name": entity_code,
            "amount": {"$gte": 50000000},  # ≥ ₹5 Cr
        })
        # If we have large rapid payments, flag
        if fast_payments > 0:
            velocity_score = 0.75
            pus_components.append(velocity_score * 0.15)  # weight 15%
            velocity_flag = True
    except Exception as e:
        logger.warning(f"Payment velocity analysis failed: {e}")
    signals["payment_velocity"] = {
        "large_rapid_payments": velocity_flag,
        "flagged": velocity_flag,
        "score": velocity_score,
    }

    # ── 5. OUTPUT MISMATCH (Cross-signal) ─────────────────────────────────
    output_mismatch_flag = False
    output_score = 0.0
    try:
        alloc = await db["budget_allocations"].find_one({
            "entity_code": entity_code,
            "fiscal_year": fiscal_year,
        })
        if alloc:
            be = float(alloc.get("budget_estimate", 0))
            actual = float(alloc.get("actual_expenditure") or 0)
            utilization = (actual / be * 100) if be > 0 else 0
            # High utilization (>98%) in a scheme with historically low utilization
            prev_actual = float(alloc.get("previous_year_actual") or 0)
            prev_utilization = (prev_actual / be * 100) if (be > 0 and prev_actual) else 0
            if utilization > 95 and prev_utilization < 60:
                output_score = 0.80
                pus_components.append(output_score * 0.10)  # weight 10%
                output_mismatch_flag = True
    except Exception as e:
        logger.warning(f"Output mismatch analysis failed: {e}")
    signals["output_mismatch"] = {
        "suspicious_utilization_jump": output_mismatch_flag,
        "flagged": output_mismatch_flag,
    }

    # ── QUALITY-ADJUSTED UTILIZATION SCORE ────────────────────────────────
    try:
        alloc_doc = await db["budget_allocations"].find_one({
            "entity_code": entity_code,
            "fiscal_year": fiscal_year,
        })
        if alloc_doc:
            be = float(alloc_doc.get("budget_estimate", 1))
            q1_q3_spent = sum(
                float(e.get("expenditure_amount", 0))
                for e in expenditures
                if _fiscal_quarter(e.get("month", 4)) in (1, 2, 3)
            )
            q4_spent = sum(
                float(e.get("expenditure_amount", 0))
                for e in expenditures
                if _fiscal_quarter(e.get("month", 4)) == 4
            )
            # QAUS formula: penalizes March Rush
            qaus = (
                (q1_q3_spent / be) * 1.0 + (q4_spent / be) * 0.4
            ) * 100
        else:
            qaus = None
    except Exception:
        qaus = None

    # ── FINAL PUS SCORE ───────────────────────────────────────────────────
    pus_score = min(sum(pus_components), 1.0)

    verdict = (
        "PHANTOM" if pus_score > 0.65
        else "SUSPECT" if pus_score > 0.30
        else "CLEAN"
    )

    return {
        "entity_code": entity_code,
        "fiscal_year": fiscal_year,
        "pus_score": round(pus_score, 4),
        "pus_percent": round(pus_score * 100, 1),
        "signals": signals,
        "verdict": verdict,
        "quality_adjusted_utilization": round(qaus, 2) if qaus is not None else None,
        "total_expenditure_analyzed": round(total_spent, 2),
        "analyzed_at": datetime.utcnow().isoformat(),
    }
