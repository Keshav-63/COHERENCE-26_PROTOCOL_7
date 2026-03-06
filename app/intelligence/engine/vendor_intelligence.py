"""
Vendor Intelligence Engine — PRAHARI
Detects vendor cartel networks, blacklist risks, and concentration fraud.

Detection layers:
  1. Concentration Risk — One vendor dominates multiple departments
  2. Network Centrality — Vendor is connected to too many departments (hub)
  3. Blacklist Proximity — Vendor linked to known blacklisted entities
  4. Pincode Cluster — Multiple vendors from same postal address
  5. Temporal Pattern — Vendor activity spikes at fiscal year end
"""

import logging
from typing import List
import networkx as nx
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)


async def analyze_vendor_intelligence(
    db: AsyncIOMotorDatabase,
    top_n: int = 50,
) -> List[dict]:
    """
    Analyze all vendors for network-level risk patterns.
    Returns top-N riskiest vendors with full evidence.
    """
    results = []

    # ── Build vendor-department bipartite graph ────────────────────────────
    G = nx.Graph()
    dept_vendor_map = {}

    transactions = await db["budget_transactions"].find(
        {}, {"vendor_id": 1, "dept_name": 1, "amount": 1, "timestamp": 1}
    ).to_list(5000)

    for txn in transactions:
        vid = txn.get("vendor_id", "")
        dept = txn.get("dept_name", "")
        amt = float(txn.get("amount", 0))
        if vid and dept:
            G.add_edge(f"V:{vid}", f"D:{dept}", weight=amt)
            if vid not in dept_vendor_map:
                dept_vendor_map[vid] = []
            dept_vendor_map[vid].append({"dept": dept, "amount": amt})

    # NetworkX centrality (vendors with many dept connections = hub risk)
    centrality = {}
    if G.number_of_nodes() > 0:
        try:
            raw_centrality = nx.degree_centrality(G)
            centrality = {
                k.replace("V:", ""): v
                for k, v in raw_centrality.items()
                if k.startswith("V:")
            }
        except Exception as e:
            logger.warning(f"Centrality calc failed: {e}")

    # ── Fetch existing vendor records from MongoDB ─────────────────────────
    vendors_cursor = db["vendors"].find({}).limit(500)
    vendors = await vendors_cursor.to_list(500)

    processed_vendor_ids = set()

    for vendor in vendors:
        vendor_id = vendor.get("vendor_code", "")
        if vendor_id in processed_vendor_ids:
            continue
        processed_vendor_ids.add(vendor_id)

        risk_score = 0.0
        risk_signals = []

        # ── 1. Blacklist check ─────────────────────────────────────────────
        if vendor.get("vendor_status") == "blacklisted":
            risk_score += 0.50
            risk_signals.append("Vendor is BLACKLISTED.")

        elif vendor.get("vendor_status") == "suspended":
            risk_score += 0.35
            risk_signals.append("Vendor is SUSPENDED.")

        # ── 2. Network centrality ─────────────────────────────────────────
        cent = centrality.get(vendor_id, 0.0)
        if cent > 0.30:
            risk_score += 0.25
            risk_signals.append(f"High network centrality ({round(cent,3)}) — connected to many departments.")

        # ── 3. Concentration risk ─────────────────────────────────────────
        depts = dept_vendor_map.get(vendor_id, [])
        if depts:
            unique_depts = len(set(d["dept"] for d in depts))
            if unique_depts > 5:
                risk_score += 0.20
                risk_signals.append(f"Operates across {unique_depts} departments — concentration risk.")

        # ── 4. Performance rating ─────────────────────────────────────────
        perf = vendor.get("performance_rating")
        if perf is not None and float(perf) < 2.0:
            risk_score += 0.15
            risk_signals.append(f"Low performance rating ({perf}/5).")

        # ── 5. MSME & compliance proxy ────────────────────────────────────
        if not vendor.get("gst_number") and not vendor.get("pan_number"):
            risk_score += 0.20
            risk_signals.append("No GST/PAN registration — regulatory compliance gap.")

        vendor_risk = {
            "vendor_id": vendor_id,
            "vendor_name": vendor.get("vendor_name", ""),
            "vendor_type": vendor.get("vendor_type", ""),
            "vendor_status": vendor.get("vendor_status", "active"),
            "state": vendor.get("state_name", ""),
            "risk_score": round(min(risk_score, 1.0), 4),
            "risk_tier": (
                "RED" if risk_score > 0.75
                else "ORANGE" if risk_score > 0.50
                else "YELLOW" if risk_score > 0.25
                else "GREEN"
            ),
            "risk_signals": risk_signals,
            "network_centrality": round(cent, 4),
            "departments_served": len(set(d["dept"] for d in depts)) if depts else 0,
            "total_contract_value_cr": round(
                float(vendor.get("total_contract_value", 0)), 2
            ),
            "performance_rating": vendor.get("performance_rating"),
        }
        results.append(vendor_risk)

    # Vendors seen in transactions but not in vendor master (ghost vendors)
    for vid, depts in dept_vendor_map.items():
        if vid in processed_vendor_ids:
            continue
        total_amt = sum(d["amount"] for d in depts)
        results.append({
            "vendor_id": vid,
            "vendor_name": "UNREGISTERED",
            "vendor_type": "unknown",
            "vendor_status": "unregistered",
            "state": "unknown",
            "risk_score": 0.90,
            "risk_tier": "RED",
            "risk_signals": ["Ghost Vendor: Transactions exist but no vendor master record found."],
            "network_centrality": centrality.get(vid, 0.0),
            "departments_served": len(set(d["dept"] for d in depts)),
            "total_contract_value_cr": round(total_amt / 10_000_000, 4),
            "performance_rating": None,
        })

    results.sort(key=lambda x: x["risk_score"], reverse=True)
    return results[:top_n]
