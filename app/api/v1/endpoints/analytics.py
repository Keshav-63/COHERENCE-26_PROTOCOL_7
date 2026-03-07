from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_db
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.services.prediction_engine import PredictionEngine
import traceback

router = APIRouter()

@router.get("/dashboard", response_model=Dict[str, Any])
async def get_analytics_dashboard(
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Aggregates data for the Analytics Dashboard.
    Returns:
    - 10 District Performance Items
    - 5 State Benchmark Items
    - 5 Top Schemes Bar Chart Items
    """
    try:
        # --- 1. Top 5 Schemes ---
        cursor = db.budget_allocations.find({"is_mock": True, "entity_type": "scheme"})
        mock_schemes = await cursor.to_list(length=100)
        
        top_schemes = []
        for scheme in mock_schemes:
            alloc_id_str = str(scheme["_id"])
            # Get latest expenditure to simulate spending
            exp_cursor = db.expenditures.find({"allocation_id": alloc_id_str}).sort("month", -1)
            exps = await exp_cursor.to_list(1)
            spent = exps[0]["expenditure_amount"] if exps else 0
            
            top_schemes.append({
                "name": scheme["entity_name"],
                "allocation": scheme["budget_estimate"],
                "spent": spent,
                "utilization": round((spent / scheme["budget_estimate"]) * 100, 1) if scheme["budget_estimate"] > 0 else 0
            })
            
        # Top 5 highest allocation
        top_schemes.sort(key=lambda x: x["allocation"], reverse=True)
        top_schemes = top_schemes[:5]
        
        # --- 2. State Benchmarks ---
        cursor = db.budget_allocations.find({"is_mock": True, "entity_type": "state_aggregation"})
        mock_states = await cursor.to_list(length=100)
        
        state_benchmarks = []
        for state in mock_states:
            alloc_id_str = str(state["_id"])
            exp_cursor = db.expenditures.find({"allocation_id": alloc_id_str}).sort("month", -1)
            exps = await exp_cursor.to_list(1)
            spent = exps[0]["expenditure_amount"] if exps else 0
            
            state_benchmarks.append({
                "state": state["state_name"],
                "allocation": state["budget_estimate"],
                "spent": spent,
                "utilization": round((spent / state["budget_estimate"]) * 100, 1) if state["budget_estimate"] > 0 else 0
            })
            
        # Sort by utilization descending (Leaderboard)
        state_benchmarks.sort(key=lambda x: x["utilization"], reverse=True)
        
        # --- 3. District Performance (Top 10) ---
        cursor = db.departments.find({"is_mock_district": True})
        mock_districts = await cursor.to_list(length=100)
        
        districts_table = []
        for d in mock_districts:
            allocated = d.get("allocated_budget", 0) / 10000000 # converting back to original mock logic view size
            spent = d.get("utilized_budget", 0) / 10000000
            
            # Predict
            current_month = 6
            avg_monthly_spent = spent / current_month if current_month > 0 else 0
            recent = [avg_monthly_spent] * 3
            
            # Applying scheme sensitivity for general districts: assume typical linear spend
            pred = PredictionEngine.analyze_scheme(
                entity_id=d.get("dept_id", "D-00"),
                entity_name=d.get("district", "Unknown"),
                total_allocation=allocated,
                total_spent=spent,
                current_month=current_month,
                recent_spending=recent
            )
            
            if "error" not in pred:
                # Add anomaly counts randomly for UI pop
                import random
                anomaly_count = random.randint(0, 3) if pred["predictions"]["lapse_risk"] in ["High", "Medium"] else 0
                
                districts_table.append({
                     "id": pred["entity_id"],
                     "district": pred["entity_name"],
                     "utilization": pred["current_status"]["utilization_percent"],
                     "spent": pred["current_status"]["spent"],
                     "allocation": pred["current_status"]["allocation"],
                     "risk_level": pred["predictions"]["lapse_risk"],
                     "risk_score": pred["predictions"]["risk_score"],
                     "confidence": pred["predictions"]["forecast"]["confidence"],
                     "anomalies": anomaly_count
                })

        districts_table.sort(key=lambda x: x["allocation"], reverse=True)
        districts_table = districts_table[:10]
        
        return {
            "top_schemes": top_schemes,
            "state_benchmarks": state_benchmarks,
            "districts": districts_table
        }
        
    except Exception as e:
        print(f"Error serving analytics dashboard: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin-dashboard", response_model=Dict[str, Any])
async def get_admin_dashboard(
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Fetches the comprehensive data payload for the advanced Admin Command Center.
    """
    try:
        # 1. Ministrywise Data (using the "is_admin_mock" flag)
        alloc_cursor = db.budget_allocations.find({"is_admin_mock": True, "entity_type": "ministry"})
        ministries = await alloc_cursor.to_list(length=100)
        
        ministrywise = []
        total_allocation = 0
        total_spent = 0
        
        for m in ministries:
            alloc_id = str(m["_id"])
            exp_cursor = db.expenditures.find({"allocation_id": alloc_id}).sort("month", -1)
            exps = await exp_cursor.to_list(1)
            spent = exps[0]["cumulative_expenditure"] if exps else 0
            
            ministrywise.append({
                "ministry": m["entity_name"],
                "allocated": m.get("budget_estimate", 0),
                "spent": spent,
                "percentage": round((spent / m.get("budget_estimate", 1)) * 100, 1) if m.get("budget_estimate", 0) > 0 else 0
            })
            total_allocation += m.get("budget_estimate", 0)
            total_spent += spent
            
        # Optional: Add the national aggregate logic instead of summing, but summing is accurate here.
        # Fallback to the 50B if missing
        if total_allocation == 0:
            total_allocation = 50000000000
            
        # 2. Monthly Trend Data (from National Trend Aggregate)
        trend_cursor = db.expenditures.find({"entity_type": "national", "is_admin_mock": True}).sort("month", 1)
        trends = await trend_cursor.to_list(length=12)
        
        monthly_trend = []
        for t in trends:
            # Reconstruct the month string based on month_num
            months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            idx = t["month"] - 1
            month_str = months[idx] if 0 <= idx < 12 else str(t["month"])
            
            monthly_trend.append({
                "month": month_str,
                "allocated": t.get("monthly_budget", 0),
                "spent": t.get("expenditure_amount", 0),
                "forecast": t.get("expenditure_amount", 0) * 1.08 # mock forecast logic
            })
            
        # 3. Anomalies
        anm_cursor = db.anomaly_flags.find({"is_admin_mock": True}).sort("detected_at", -1)
        anomalies_raw = await anm_cursor.to_list(length=20)
        anomalies = []
        for a in anomalies_raw:
            anomalies.append({
                "id": a.get("trans_id", ""),
                "type": a.get("anomaly_type", "Anomaly"),
                "severity": a.get("severity", "FLAGGED"),
                "state": a.get("dept_name", ""),
                "ministry": a.get("ministry_code", ""),
                "description": a.get("description", ""),
                "amount": a.get("amount", 0)
            })
            
        # 4. Reallocation Feed
        txn_cursor = db.budget_transactions.find({"is_admin_mock": True}).sort("timestamp", -1)
        txns_raw = await txn_cursor.to_list(length=10)
        reallocations = []
        for txn in txns_raw:
            amt_cr = txn.get("amount", 0) / 10000000
            reallocations.append({
                "from": txn.get("from_department", ""),
                "to": txn.get("to_department", ""),
                "amount": f"₹{amt_cr:.1f} Cr",
                "time": txn.get("formatted_time", "just now")
            })
            
        # 5. Stress Heatmap
        stress_cursor = db.risk_scores.find({"is_admin_mock": True}).sort("score", -1)
        stress_raw = await stress_cursor.to_list(length=10)
        stressData = []
        for s in stress_raw:
            stressData.append({
                "name": s.get("department", ""),
                "score": s.get("score", 0)
            })
            
        return {
            "totalAllocation": total_allocation,
            "totalSpent": total_spent,
            "ministrywise": ministrywise,
            "monthlyTrend": monthly_trend,
            "anomalies": anomalies,
            "reallocations": reallocations,
            "stressData": stressData
        }
        
    except Exception as e:
        print(f"Error serving admin dashboard: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
