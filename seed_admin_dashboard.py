import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import datetime

# Same connection string seen in insert_mockup_data.py
MONGO_URL = "mongodb+srv://keshav_db_user:FUkpMqCcFKd0Byeq@cluster0.psx87pm.mongodb.net/?appName=Cluster0"
DB_NAME = "coherence_db"

async def seed_admin_dashboard():
    print("Initiating Database Seed for Admin Dashboard...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    # --- Clear Old Admin Dashboard Mock Data ---
    # We use a special flag `is_admin_mock: True` to identify these records easily
    await db.budget_allocations.delete_many({"is_admin_mock": True})
    await db.expenditures.delete_many({"is_admin_mock": True})
    await db.anomaly_flags.delete_many({"is_admin_mock": True})
    await db.budget_transactions.delete_many({"is_admin_mock": True})
    await db.risk_scores.delete_many({"is_admin_mock": True})
    print("Cleaned up existing admin mock data.")

    now = datetime.datetime.utcnow()

    # --- 1. Total Budget & Ministry Allocations ---
    # From frontend mockData BUDGET_DATA.ministrywise
    ministries_data = [
        {"ministry": "Education", "allocated": 8000000000, "spent": 7600000000},
        {"ministry": "Health & Family Welfare", "allocated": 6500000000, "spent": 5800000000},
        {"ministry": "Infrastructure", "allocated": 9000000000, "spent": 7200000000},
        {"ministry": "Agriculture", "allocated": 5000000000, "spent": 4200000000},
        {"ministry": "Defense", "allocated": 7000000000, "spent": 6800000000},
        {"ministry": "Home Affairs", "allocated": 5500000000, "spent": 5100000000},
        {"ministry": "Social Justice", "allocated": 3000000000, "spent": 2700000000},
        {"ministry": "Environment", "allocated": 2000000000, "spent": 1400000000},
    ]

    for m in ministries_data:
        alloc_code = f"ADMIN-ALLOC-{str(m['ministry']).replace(' ', '').replace('&', '')}"
        alloc_doc = {
            "allocation_code": alloc_code,
            "fiscal_year": "2024-25",
            "allocation_status": "allocated",
            "entity_type": "ministry",
            "entity_code": f"MIN-{str(m['ministry'])[:3].upper()}",
            "entity_name": str(m['ministry']),
            "ministry_code": f"MIN-{str(m['ministry'])[:3].upper()}",
            "ministry_name": str(m['ministry']),
            "budget_type": "revenue",
            "budget_estimate": m["allocated"],
            "created_at": now,
            "updated_at": now,
            "is_admin_mock": True
        }
        res = await db.budget_allocations.insert_one(alloc_doc)
        
        # Insert actual expenditure to match the `spent` amount
        exp_doc = {
            "expenditure_code": f"ADMIN-EXP-{str(m['ministry']).replace(' ', '').replace('&', '')}",
            "fiscal_year": "2024-25",
            "month": 12,
            "quarter": 4,
            "allocation_id": str(res.inserted_id),
            "entity_type": "ministry",
            "entity_code": f"MIN-{str(m['ministry'])[:3].upper()}",
            "entity_name": str(m['ministry']),
            "ministry_code": f"MIN-{str(m['ministry'])[:3].upper()}",
            "expenditure_amount": m["spent"],
            "cumulative_expenditure": m["spent"],
            "recorded_at": now,
            "created_at": now,
            "is_admin_mock": True
        }
        await db.expenditures.insert_one(exp_doc)

    print("Seeded Ministry Allocations and Expenditures.")

    # --- 2. Monthly Trend Data ---
    # Store aggregated trend data. We'll simulate this by adding a "national_trend" allocation
    # and populating monthly expenditures against it, or we can just fetch it differently. 
    # For now, let's just create a special aggregate document since the schema focuses on individual entities.
    monthly_trend = [
        {"month": "Jan", "month_num": 1, "spent": 2500000000, "allocated": 4167000000},
        {"month": "Feb", "month_num": 2, "spent": 2700000000, "allocated": 4167000000},
        {"month": "Mar", "month_num": 3, "spent": 3000000000, "allocated": 4167000000},
        {"month": "Apr", "month_num": 4, "spent": 3200000000, "allocated": 4167000000},
        {"month": "May", "month_num": 5, "spent": 3500000000, "allocated": 4167000000},
        {"month": "Jun", "month_num": 6, "spent": 3800000000, "allocated": 4167000000},
        {"month": "Jul", "month_num": 7, "spent": 4100000000, "allocated": 4167000000},
        {"month": "Aug", "month_num": 8, "spent": 4300000000, "allocated": 4167000000},
        {"month": "Sep", "month_num": 9, "spent": 4600000000, "allocated": 4167000000},
        {"month": "Oct", "month_num": 10, "spent": 4900000000, "allocated": 4167000000},
        {"month": "Nov", "month_num": 11, "spent": 5100000000, "allocated": 4167000000},
        {"month": "Dec", "month_num": 12, "spent": 5600000000, "allocated": 4167000000},
    ]
    
    # We will create one "National" budget allocation to hang these monthly expenditures on.
    nat_alloc = {
        "allocation_code": "ADMIN-ALLOC-NATIONAL",
        "fiscal_year": "2024-25",
        "allocation_status": "allocated",
        "entity_type": "national",
        "entity_code": "NAT",
        "entity_name": "National Trend Aggregate",
        "ministry_code": "NAT",
        "ministry_name": "National",
        "budget_type": "revenue",
        "budget_estimate": 50000000000, # 50 billion matches frontend
        "created_at": now,
        "updated_at": now,
        "is_admin_mock": True
    }
    nat_res = await db.budget_allocations.insert_one(nat_alloc)

    for trend in monthly_trend:
         exp_doc = {
            "expenditure_code": f"ADMIN-EXP-NAT-{str(trend['month'])}",
            "fiscal_year": "2024-25",
            "month": int(trend["month_num"]),
            "quarter": (int(trend["month_num"]) - 1) // 3 + 1,
            "allocation_id": str(nat_res.inserted_id),
            "entity_type": "national",
            "entity_code": "NAT",
            "entity_name": "National Trend Aggregate",
            "ministry_code": "NAT",
            "expenditure_amount": trend["spent"],
            "monthly_budget": trend["allocated"],
            "cumulative_expenditure": trend["spent"],
            "recorded_at": now,
            "created_at": now,
            "is_admin_mock": True
        }
         await db.expenditures.insert_one(exp_doc)

    print("Seeded National Trends.")

    # --- 3. Anomalies ---
    # From frontend mockData ANOMALIES
    anomalies_data = [
        {"id": "ANM001", "type": "Unusual Spending Pattern", "severity": "high", "state": "Punjab", "ministry": "Infrastructure", "amount": 450000000, "threshold": 300000000, "description": "Expenditure exceeded budget by 50% in Q3", "date": "2024-03-10", "status": "flagged"},
        {"id": "ANM002", "type": "Underspend Detection", "severity": "medium", "state": "Rajasthan", "ministry": "Education", "amount": 250000000, "threshold": 500000000, "description": "Budget utilization only 50% despite allocation", "date": "2024-03-08", "status": "investigating"},
        {"id": "ANM003", "type": "Irregular Transaction", "severity": "high", "state": "Uttar Pradesh", "ministry": "Health & Family Welfare", "amount": 120000000, "threshold": 50000000, "description": "Large fund transfer detected without prior notice", "date": "2024-03-05", "status": "resolved"},
        {"id": "ANM004", "type": "Potential Leakage", "severity": "critical", "state": "Bihar", "ministry": "Agriculture", "amount": 200000000, "threshold": 100000000, "description": "Discrepancy between allocation and actual disbursement", "date": "2024-03-02", "status": "flagged"},
    ]

    for anm in anomalies_data:
        flag = {
            "trans_id": str(anm["id"]),
            "dept_name": str(anm["state"]),
            "ministry_code": str(anm["ministry"]),
            "anomaly_type": str(anm["type"]),
            "severity": str(anm["severity"]).upper(),
            "risk_score": 0.9 if str(anm["severity"]).lower() == "critical" else (0.75 if str(anm["severity"]).lower() == "high" else 0.5),
            "description": str(anm["description"]),
            "status": "open" if str(anm["status"]) == "flagged" else ("under_review" if str(anm["status"]) == "investigating" else "resolved"),
            "amount": float(anm["amount"]),
            "detected_at": now,
            "is_admin_mock": True
        }
        await db.anomaly_flags.insert_one(flag)

    print("Seeded Anomalies.")

    # --- 4. Reallocation Feed (AI Recommendations) ---
    txn_data = [
        { "from": "Health - Nashik", "to": "Health - Mumbai", "amount": 42.0, "time": "2 mins ago" },
        { "from": "Education - Pune", "to": "Education - Nagpur", "amount": 21.5, "time": "9 mins ago" },
        { "from": "Infra - Thane", "to": "Infra - Mumbai", "amount": 13.2, "time": "15 mins ago" },
        { "from": "Agri - Nashik", "to": "Agri - Pune", "amount": 18.4, "time": "23 mins ago" },
    ]

    for txn in txn_data:
        t = {
            "transaction_id": f"REALLOC-AI-{float(txn['amount'])}",
            "from_department": str(txn["from"]),
            "to_department": str(txn["to"]),
            "amount": float(txn["amount"]) * 10000000, # Converting back from Cr to actual
            "timestamp": now,
            "status": "recommended",
            "is_ai_generated": True,
            "formatted_time": str(txn["time"]), # Storing this directly to match UI
            "is_admin_mock": True
        }
        await db.budget_transactions.insert_one(t)

    print("Seeded Budget Reallocation Feed.")

    # --- 5. Stress Data (Heatmap) ---
    stress_data = [
        { "name": "Infrastructure", "score": 88 },
        { "name": "Agriculture", "score": 61 },
        { "name": "Health", "score": 43 },
        { "name": "Education", "score": 31 },
        { "name": "Home Affairs", "score": 24 },
    ]

    for s in stress_data:
        r = {
            "department": s["name"],
            "score": s["score"],
            "timestamp": now,
            "is_admin_mock": True
        }
        await db.risk_scores.insert_one(r)

    print("Seeded Stress Heatmap Data.")

    client.close()
    print("Database Seed for Admin Dashboard Complete!")

if __name__ == "__main__":
    asyncio.run(seed_admin_dashboard())
