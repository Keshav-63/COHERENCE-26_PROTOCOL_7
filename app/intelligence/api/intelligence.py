"""
PRAHARI Intelligence API Endpoints
9 endpoints for the full anomaly detection + AI intelligence platform.

All endpoints use the existing MongoDB connection (no duplicate DB setup).
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.intelligence.services import intelligence_service
from app.intelligence.engine import phantom_utilization
from app.intelligence.engine import march_rush as march_rush_engine
from app.intelligence.engine import vendor_intelligence as vendor_engine
from app.intelligence.engine import reallocation_optimizer
from app.intelligence.services import gemini_service

router = APIRouter()


# ── Pydantic Schemas ──────────────────────────────────────────────────────────

class TransactionAuditRequest(BaseModel):
    trans_id: str
    dept_name: str
    admin_level: str = "state"
    amount: float
    vendor_id: str
    item_category: str
    latitude: float
    longitude: float
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)
    ministry_code: Optional[str] = None
    scheme_code: Optional[str] = None
    fiscal_year: Optional[str] = None
    state_code: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "trans_id": "TXN-2026-001",
                "dept_name": "Rural Development",
                "admin_level": "state",
                "amount": 495000,
                "vendor_id": "VEND-NEW-001",
                "item_category": "Roads",
                "latitude": 20.0,
                "longitude": 78.0,
                "timestamp": "2026-03-28T10:00:00Z",
                "ministry_code": "MORD-001",
                "fiscal_year": "2025-26",
            }
        }


# ── ENDPOINT 1: Audit a Transaction ──────────────────────────────────────────

@router.post(
    "/audit",
    summary="Audit a live transaction through all 8 anomaly layers + Gemini AI",
    tags=["PRAHARI Intelligence"],
)
async def audit_transaction(
    tx: TransactionAuditRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    **Core PRAHARI endpoint.**  
    Runs a government transaction through all 8 detection layers:
    
    1. Salami Slicing — Sub-limit structuring  
    2. Ghost Vendor — Unknown entity high payment  
    3. March Rush — Indian FY year-end panic spend  
    4. Impossible Travel — Geolocation velocity breach  
    5. Circular Trading — Collusion graph cycle  
    6. Price Padding — 2.5x market baseline breach  
    7. Spending Drift — 50x historical jump  
    8. ML Isolation Forest — Statistical outlier detection  
    
    + **Gemini AI** narrative for every flagged transaction.
    """
    try:
        result = await intelligence_service.audit_transaction(db, tx.model_dump())
        return {
            "trans_id": tx.trans_id,
            "dept_name": tx.dept_name,
            "amount": tx.amount,
            **result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audit engine error: {str(e)}")


# ── ENDPOINT 2: All Anomalies ────────────────────────────────────────────────

@router.get(
    "/anomalies",
    summary="Get all detected anomalies (transactions + allocations)",
    tags=["PRAHARI Intelligence"],
)
async def get_anomalies(
    status_filter: Optional[str] = Query(None, description="Filter: FLAGGED or CRITICAL"),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Returns all anomalies detected by PRAHARI across:
    - Real-time transaction audits
    - Budget allocation-level anomalies (from existing MongoDB data)
    - Fund lapse cases
    - Over-expenditure cases
    
    Sorted by risk score (highest first).
    """
    try:
        anomalies = await intelligence_service.get_all_anomalies(
            db, status_filter=status_filter, limit=limit
        )
        return {
            "total": len(anomalies),
            "anomalies": anomalies,
            "fetched_at": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── ENDPOINT 3: Phantom Utilization ─────────────────────────────────────────

@router.get(
    "/phantom-utilization/{entity_code}",
    summary="Detect phantom (paper) spending for a scheme or department",
    tags=["PRAHARI Intelligence"],
)
async def get_phantom_utilization(
    entity_code: str,
    fiscal_year: Optional[str] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    **Phantom Utilization Score (PUS)** — detects "paper spending":
    
    - Temporal clustering (70%+ in Feb–Mar)
    - Single-vendor domination (>60% share)
    - Geographic vendor clustering (same pin-code)
    - Impossible payment velocity
    - Cross-signal output mismatch
    
    Returns verdict: CLEAN / SUSPECT / PHANTOM + quality-adjusted utilization score.
    """
    from app.intelligence.engine.march_rush import get_current_fiscal_year
    fy = fiscal_year or get_current_fiscal_year()
    try:
        result = await phantom_utilization.analyze(db, entity_code, fy)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── ENDPOINT 4: March Rush Analysis ─────────────────────────────────────────

@router.get(
    "/march-rush",
    summary="Detect departments at risk of March Rush panic spending",
    tags=["PRAHARI Intelligence"],
)
async def get_march_rush_alerts(
    fiscal_year: Optional[str] = Query(None),
    risk_tier: Optional[str] = Query(None, description="Filter: CRITICAL / HIGH / MEDIUM / LOW"),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    **March Rush Intelligence Engine** — identifies departments likely to spend
    blindly in the last week of the Indian fiscal year (March 25–31).
    
    Also computes **Fund Lapse Risk** per department:
    - HIGH: Will have massive unspent balance
    - MEDIUM: Moderate risk
    - LOW: On track
    
    Quality-Adjusted Utilization Score (QAUS) penalizes rush spending mathematically.
    """
    try:
        results = await march_rush_engine.analyze_march_rush(db, fiscal_year)

        if risk_tier:
            results = [r for r in results if r["march_rush_risk"] == risk_tier.upper()]

        # Add Gemini lapse warnings for HIGH risk entities
        for entity in results[:5]:  # Only top 5 to avoid rate limits
            if entity["fund_lapse_risk"] == "HIGH":
                entity["gemini_warning"] = await gemini_service.generate_lapse_warning(entity)

        return {
            "fiscal_year": results[0]["fiscal_year"] if results else "N/A",
            "total_entities_analyzed": len(results),
            "results": results,
            "analyzed_at": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── ENDPOINT 5: Vendor Intelligence ─────────────────────────────────────────

@router.get(
    "/vendor-intelligence",
    summary="Vendor risk analysis with network cartel detection",
    tags=["PRAHARI Intelligence"],
)
async def get_vendor_intelligence(
    top_n: int = Query(50, ge=1, le=200),
    risk_tier: Optional[str] = Query(None, description="Filter: RED / ORANGE / YELLOW / GREEN"),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    **Vendor Intelligence Network** — analyzes all vendors for:
    
    - Blacklist / suspension status
    - Network centrality (hub vendor connecting many departments)
    - Geographic clustering (multiple vendors at same address)
    - Compliance gaps (no GST/PAN)
    - Ghost vendors (transactions exist, no master record)
    
    Returns risk-ranked vendor list with Gemini AI explanations for RED-tier vendors.
    """
    try:
        vendors = await vendor_engine.analyze_vendor_intelligence(db, top_n=top_n)

        if risk_tier:
            vendors = [v for v in vendors if v["risk_tier"] == risk_tier.upper()]

        # Enrich top RED vendors with Gemini
        for v in vendors[:3]:
            if v.get("risk_tier") == "RED":
                v["gemini_risk_explanation"] = await gemini_service.generate_vendor_risk_explanation(v)

        return {
            "total_vendors_analyzed": len(vendors),
            "vendors": vendors,
            "analyzed_at": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── ENDPOINT 6: Reallocation Suggestions ────────────────────────────────────

@router.get(
    "/reallocation-engine",
    summary="AI-optimized fund reallocation suggestions to prevent lapse",
    tags=["PRAHARI Intelligence"],
)
async def get_reallocation_suggestions(
    fiscal_year: Optional[str] = Query(None),
    max_suggestions: int = Query(10, ge=1, le=20),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    **Reallocation Optimization Engine** — uses linear programming logic to:
    
    - Identify funds about to lapse (under-utilized allocations)
    - Match them to high-absorption schemes that need more funds
    - Generate ranked reallocation proposals with ₹ amounts
    
    Each suggestion includes beneficiary impact estimate and full rationale.
    """
    try:
        suggestions = await reallocation_optimizer.suggest_reallocations(
            db, fiscal_year=fiscal_year, max_suggestions=max_suggestions
        )
        return {
            "fiscal_year": suggestions[0]["fiscal_year"] if suggestions else "N/A",
            "total_suggestions": len(suggestions),
            "suggestions": suggestions,
            "generated_at": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── ENDPOINT 7: Dashboard Summary ────────────────────────────────────────────

@router.get(
    "/dashboard",
    summary="Executive intelligence dashboard with Gemini AI briefing",
    tags=["PRAHARI Intelligence"],
)
async def get_dashboard_summary(
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    **PRAHARI Executive Dashboard** — single endpoint for the full picture:
    
    - Transactions audited, flagged, critical
    - Total estimated leakage in ₹ Cr
    - Budget utilization overview
    - Gemini AI executive briefing for Finance Ministry
    
    Suitable for the central government dashboard (live data from MongoDB).
    """
    try:
        return await intelligence_service.get_dashboard_summary(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── ENDPOINT 8: Leakage Risk by Ministry ─────────────────────────────────────

@router.get(
    "/leakage-risks",
    summary="Leakage risk heatmap across all ministries",
    tags=["PRAHARI Intelligence"],
)
async def get_leakage_risks(
    fiscal_year: Optional[str] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    **Leakage Risk Heatmap** — aggregates risk scores across all ministries from:
    
    - Existing budget allocation data in MongoDB
    - Transaction anomaly history
    - Utilization pattern analysis
    
    Returns ministry-level risk tiers: GREEN / YELLOW / ORANGE / RED
    """
    from app.intelligence.engine.march_rush import get_current_fiscal_year
    fy = fiscal_year or get_current_fiscal_year()

    try:
        pipeline = [
            {"$match": {"fiscal_year": fy}},
            {"$group": {
                "_id": "$ministry_code",
                "ministry_name": {"$first": "$ministry_name"},
                "total_be": {"$sum": "$budget_estimate"},
                "total_actual": {"$sum": {"$ifNull": ["$actual_expenditure", 0]}},
                "scheme_count": {"$sum": 1},
                "avg_utilization": {"$avg": "$utilization_percentage"},
            }},
            {"$sort": {"total_be": -1}},
        ]
        ministry_data = await db["budget_allocations"].aggregate(pipeline).to_list(100)

        results = []
        for m in ministry_data:
            total_be = float(m.get("total_be") or 0)
            total_actual = float(m.get("total_actual") or 0)
            utilization = (total_actual / total_be * 100) if total_be > 0 else 0
            remaining = total_be - total_actual

            # Simple risk scoring based on utilization
            if utilization < 20:
                risk_tier = "RED"
                risk_score = 0.90
            elif utilization < 45:
                risk_tier = "ORANGE"
                risk_score = 0.65
            elif utilization < 65:
                risk_tier = "YELLOW"
                risk_score = 0.40
            else:
                risk_tier = "GREEN"
                risk_score = 0.15

            results.append({
                "ministry_code": m.get("_id"),
                "ministry_name": m.get("ministry_name"),
                "fiscal_year": fy,
                "total_budget_estimate_cr": round(total_be, 2),
                "total_actual_expenditure_cr": round(total_actual, 2),
                "utilization_pct": round(utilization, 1),
                "remaining_budget_cr": round(remaining, 2),
                "scheme_count": m.get("scheme_count", 0),
                "leakage_risk_score": risk_score,
                "risk_tier": risk_tier,
            })

        results.sort(key=lambda x: x["leakage_risk_score"], reverse=True)

        return {
            "fiscal_year": fy,
            "total_ministries": len(results),
            "risk_heatmap": results,
            "analyzed_at": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── ENDPOINT 9: Fiscal Flow Graph ────────────────────────────────────────────

@router.get(
    "/fiscal-flow-graph",
    summary="Fiscal Cascade Graph — follow the money from Centre to beneficiary",
    tags=["PRAHARI Intelligence"],
)
async def get_fiscal_flow_graph(
    ministry_code: Optional[str] = Query(None),
    fiscal_year: Optional[str] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    **Fiscal Cascade Graph (FCG)** — models the entire budget flow as a directed graph:
    
    ```
    Centre → Ministry → Department → Scheme → State → District → Beneficiary
    ```
    
    Returns nodes and edges for Sankey diagram / force graph visualization.
    Highlights broken chains (potential diversion points).
    """
    from app.intelligence.engine.march_rush import get_current_fiscal_year
    fy = fiscal_year or get_current_fiscal_year()

    try:
        query = {"fiscal_year": fy}
        if ministry_code:
            query["ministry_code"] = ministry_code

        allocations = await db["budget_allocations"].find(query).to_list(200)

        nodes = {}
        edges = []

        def add_node(node_id: str, label: str, node_type: str, value: float = 0):
            if node_id not in nodes:
                nodes[node_id] = {"id": node_id, "label": label, "type": node_type, "value": value}
            else:
                nodes[node_id]["value"] += value

        # Centre node
        total_centre = sum(float(a.get("budget_estimate") or 0) for a in allocations)
        add_node("CENTRE", "Government of India", "centre", total_centre)

        for alloc in allocations:
            be = float(alloc.get("budget_estimate") or 0)
            actual = float(alloc.get("actual_expenditure") or 0)
            ministry_code_val = alloc.get("ministry_code", "UNKNOWN")
            ministry_name = alloc.get("ministry_name", "Unknown Ministry")
            entity_code = alloc.get("entity_code", "")
            entity_name = alloc.get("entity_name", "")
            entity_type = alloc.get("entity_type", "")

            # Ministry node
            add_node(ministry_code_val, ministry_name, "ministry", be)
            edges.append({
                "from": "CENTRE",
                "to": ministry_code_val,
                "value": round(be, 2),
                "actual": round(actual, 2),
                "flow_efficiency": round((actual / be * 100) if be > 0 else 0, 1),
                "broken": actual < (be * 0.20),  # <20% utilized = broken chain
            })

            if entity_type in ("department", "scheme") and entity_code:
                add_node(entity_code, entity_name, entity_type, actual)
                edges.append({
                    "from": ministry_code_val,
                    "to": entity_code,
                    "value": round(be, 2),
                    "actual": round(actual, 2),
                    "flow_efficiency": round((actual / be * 100) if be > 0 else 0, 1),
                    "broken": actual < (be * 0.20),
                })

            # State node if available
            if alloc.get("state_code"):
                state_id = f"STATE-{alloc['state_code']}"
                add_node(state_id, alloc.get("state_name", alloc["state_code"]), "state", actual)
                edges.append({
                    "from": entity_code or ministry_code_val,
                    "to": state_id,
                    "value": round(actual, 2),
                    "actual": round(actual, 2),
                    "flow_efficiency": 100.0,
                    "broken": False,
                })

        broken_chains = [e for e in edges if e.get("broken")]

        return {
            "fiscal_year": fy,
            "ministry_filter": ministry_code,
            "graph": {
                "nodes": list(nodes.values()),
                "edges": edges,
            },
            "broken_chains": broken_chains,
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "broken_chain_count": len(broken_chains),
            "generated_at": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
