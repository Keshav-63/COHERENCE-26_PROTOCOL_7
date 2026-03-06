"""
AegisWatcher — 7-Point Anomaly Detection Engine
Ported from sha branch and upgraded with MongoDB integration + Gemini AI.

Detection layers:
  1. Salami Slicing     – Structuring payments just under audit limits
  2. Ghost Vendor       – High-value payments to unknown entities
  3. March Rush         – Year-end panic spending (Indian FY ends March 31)
  4. Impossible Travel  – Geolocation velocity anomaly
  5. Circular Trading   – Graph-based collusion cycles
  6. Price Padding      – 2.5x+ variance from market baseline
  7. Spending Drift     – 50x jump vs historical average
  8. ML Isolation       – Isolation Forest statistical outlier
"""

import numpy as np
import networkx as nx
from datetime import datetime, timedelta
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)


class AegisWatcher:
    """
    Main 8-point anomaly audit engine.
    Works against live MongoDB (Motor async) OR mock data.
    """

    def __init__(self):
        self.collusion_graph = nx.DiGraph()

    async def audit(self, db, tx: dict) -> dict:
        """
        Run full 8-point anomaly audit on a single transaction.
        
        Args:
            db: Motor AsyncIOMotorDatabase instance
            tx: Transaction dict with keys:
                trans_id, dept_name, amount, vendor_id,
                item_category, latitude, longitude, timestamp
        
        Returns:
            dict with risk_score, anomaly_reason, status, metadata
        """
        risk_map: Dict[str, float] = {}
        logs: List[str] = []
        evidence: Dict[str, Any] = {}

        # Normalize timestamp
        if isinstance(tx.get("timestamp"), str):
            try:
                tx["timestamp"] = datetime.fromisoformat(
                    tx["timestamp"].replace("Z", "+00:00")
                )
            except Exception:
                tx["timestamp"] = datetime.utcnow()
        elif tx.get("timestamp") is None:
            tx["timestamp"] = datetime.utcnow()

        ts: datetime = tx["timestamp"]
        amount: float = float(tx.get("amount", 0))
        vendor_id: str = tx.get("vendor_id", "")
        dept_name: str = tx.get("dept_name", "")
        item_category: str = tx.get("item_category", "")

        # ── 1. SALAMI SLICING ──────────────────────────────────────────────
        window_start = ts - timedelta(days=3)
        salami_hits = await db["budget_transactions"].count_documents({
            "vendor_id": vendor_id,
            "amount": {"$gte": 480000, "$lt": 500000},
            "timestamp": {"$gte": window_start},
        })
        if salami_hits >= 1:
            risk_map["salami"] = 0.85
            logs.append("Salami Slicing: Sub-limit (₹4.8L–5L) structured payments detected.")
            evidence["salami"] = {"hits_in_3_days": salami_hits, "threshold": 500000}

        # ── 2. GHOST VENDOR ───────────────────────────────────────────────
        vendor_history = await db["budget_transactions"].count_documents(
            {"vendor_id": vendor_id}
        )
        if vendor_history == 0 and amount > 100000:
            risk_map["ghost"] = 0.90
            logs.append("Ghost Vendor: ₹1L+ payment to an entity with zero transaction history.")
            evidence["ghost"] = {"vendor_id": vendor_id, "amount": amount, "prior_txns": 0}

        # ── 3. MARCH RUSH ─────────────────────────────────────────────────
        if ts.month == 3 and ts.day > 24:
            risk_map["march"] = 0.70
            logs.append(f"March Rush: Year-end spending on March {ts.day} (Indian FY closes March 31).")
            evidence["march"] = {"day": ts.day, "month": ts.month}

        # ── 4. IMPOSSIBLE TRAVEL (Geolocation Velocity) ───────────────────
        prev_txn = await db["budget_transactions"].find_one(
            {"dept_name": dept_name, "timestamp": {"$lt": ts}},
            sort=[("timestamp", -1)],
        )
        if prev_txn:
            prev_lat = prev_txn.get("latitude", tx.get("latitude", 0))
            prev_lon = prev_txn.get("longitude", tx.get("longitude", 0))
            prev_ts = prev_txn.get("timestamp", ts)
            if isinstance(prev_ts, str):
                try:
                    prev_ts = datetime.fromisoformat(prev_ts.replace("Z", "+00:00"))
                except Exception:
                    prev_ts = ts

            dist_km = (
                np.sqrt(
                    (tx.get("latitude", 0) - prev_lat) ** 2
                    + (tx.get("longitude", 0) - prev_lon) ** 2
                )
                * 111
            )
            hours = max((ts - prev_ts).total_seconds() / 3600, 0.001)
            speed = dist_km / hours

            if speed > 120:
                risk_map["travel"] = 0.80
                logs.append(f"Impossible Travel: {int(speed)} km/h across departments — geolocation velocity breach.")
                evidence["travel"] = {
                    "speed_kmh": round(speed, 1),
                    "distance_km": round(dist_km, 1),
                    "hours": round(hours, 2),
                }

        # ── 5. CIRCULAR TRADING (Graph Collusion) ─────────────────────────
        self.collusion_graph.add_edge(dept_name, vendor_id)
        try:
            cycle = nx.find_cycle(self.collusion_graph)
            risk_map["circular"] = 1.0
            logs.append(f"Circular Trading: Collusion loop detected — {[e[0] for e in cycle]}.")
            evidence["circular"] = {"cycle_nodes": [e[0] for e in cycle]}
        except nx.NetworkXNoCycle:
            pass

        # ── 6. PRICE PADDING ──────────────────────────────────────────────
        baseline_doc = await db["spending_baselines"].find_one(
            {"item_category": item_category}
        )
        if baseline_doc is None:
            # Fallback: derive baseline from existing allocation data
            pipeline = [
                {"$match": {"scheme_code": {"$exists": True}}},
                {"$group": {
                    "_id": None,
                    "avg": {"$avg": "$budget_estimate"}
                }}
            ]
            try:
                agg = await db["budget_allocations"].aggregate(pipeline).to_list(1)
                if agg:
                    baseline_doc = {"avg_annual_spend": agg[0].get("avg", 0)}
            except Exception:
                pass

        if baseline_doc:
            baseline_avg = float(baseline_doc.get("avg_annual_spend", 0))
            if baseline_avg > 0 and amount > (baseline_avg * 2.5):
                ratio = round(amount / baseline_avg, 2)
                risk_map["price_padding"] = 0.95
                logs.append(f"Price Padding: ₹{amount:,.0f} is {ratio}x the baseline (₹{baseline_avg:,.0f}).")
                evidence["price_padding"] = {
                    "amount": amount,
                    "baseline": baseline_avg,
                    "ratio": ratio,
                }

        # ── 7. SPENDING DRIFT (50x Jump Logic) ────────────────────────────
        dept_baseline = await db["spending_baselines"].find_one(
            {"dept_name": dept_name}
        )
        if dept_baseline is None:
            # Derive from budget_allocations
            try:
                alloc = await db["budget_allocations"].find_one(
                    {"entity_name": {"$regex": dept_name, "$options": "i"}}
                )
                if alloc:
                    hist_avg = (
                        float(alloc.get("previous_year_actual") or 0) / 12
                    )  # Monthly
                    dept_baseline = {"avg_monthly_spend": hist_avg}
            except Exception:
                pass

        if dept_baseline:
            avg_spend = float(
                dept_baseline.get("avg_monthly_spend")
                or dept_baseline.get("avg_annual_spend", 0)
            )
            if avg_spend > 0:
                drift_ratio = amount / avg_spend
                if drift_ratio >= 50.0:
                    risk_map["drift"] = 1.0
                    logs.append(f"Spending Drift: {int(drift_ratio)}x jump vs department average — CRITICAL.")
                    evidence["drift"] = {"drift_ratio": round(drift_ratio, 1), "avg": avg_spend}
                elif drift_ratio >= 5.0:
                    risk_map["drift"] = 0.60
                    logs.append(f"Spending Drift: {round(drift_ratio,1)}x spike vs historical baseline.")
                    evidence["drift"] = {"drift_ratio": round(drift_ratio, 1), "avg": avg_spend}

        # ── 8. ML ISOLATION FOREST ────────────────────────────────────────
        ml_score, ml_reason = await self._run_isolation_forest(db, tx)
        if ml_score > 0.5:
            risk_map["ml_isolation"] = ml_score
            logs.append(ml_reason)
            evidence["ml_isolation"] = {"score": ml_score}

        # ── COMPOSITE SCORE ───────────────────────────────────────────────
        final_score = self._calculate_final(risk_map)
        status = (
            "CRITICAL" if final_score > 0.8
            else "FLAGGED" if final_score > 0.4
            else "SAFE"
        )

        return {
            "risk_score": round(final_score, 4),
            "anomaly_reason": " | ".join(logs) if logs else "No anomalies detected.",
            "status": status,
            "anomaly_flags": list(risk_map.keys()),
            "evidence": evidence,
            "metadata": {
                "flags": list(risk_map.keys()),
                "flag_scores": risk_map,
                "audited_at": datetime.utcnow().isoformat(),
            },
        }

    async def _run_isolation_forest(self, db, tx: dict):
        """Use sklearn IsolationForest on recent transactions for ML-based outlier detection."""
        try:
            from sklearn.ensemble import IsolationForest

            # Fetch last 200 transactions of same dept for peer comparison
            cursor = db["budget_transactions"].find(
                {"dept_name": tx.get("dept_name")},
                {"amount": 1, "_id": 0},
            ).sort("timestamp", -1).limit(200)
            recent = await cursor.to_list(200)

            if len(recent) < 10:
                return 0.2, "Insufficient peer data for ML comparison."

            amounts = np.array([[float(r["amount"])] for r in recent])
            iso = IsolationForest(contamination=0.05, random_state=42)
            iso.fit(amounts)

            pred = iso.predict([[float(tx.get("amount", 0))]])
            if pred[0] == -1:
                # Score it: anomaly distance from boundary
                raw = iso.score_samples([[float(tx.get("amount", 0))]])[0]
                ml_score = min(1.0, max(0.6, 0.8 - raw))
                return round(ml_score, 4), "ML Isolation Forest: Statistical outlier vs peer department transactions."

            return 0.0, "ML: Transaction within normal distribution."

        except Exception as e:
            logger.warning(f"Isolation Forest skipped: {e}")
            return 0.0, ""

    def _calculate_final(self, risks: Dict[str, float]) -> float:
        """
        Composite score: highest single risk + bonus per additional flag.
        Formula: max(flags) + 0.1 * (count - 1), capped at 1.0
        """
        if not risks:
            return 0.0
        return min(max(risks.values()) + (len(risks) - 1) * 0.1, 1.0)
