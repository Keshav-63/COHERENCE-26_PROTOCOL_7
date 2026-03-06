from pymongo import MongoClient
import datetime
import random

# Connect to MongoDB
client = MongoClient('mongodb+srv://keshav_db_user:FUkpMqCcFKd0Byeq@cluster0.psx87pm.mongodb.net/?appName=Cluster0')
db = client['coherence_db']

def insert_mockup_data():
    print("Seeding mockup data for Analytics Dashboard...")

    # 1. Clear previous specific mock data if we want a clean slate (optional, but let's just insert/upsert)
    
    # --- SCHEMES (For Bar Chart) ---
    schemes_data = [
        {"entity_code": "SCH-MOCK-01", "entity_name": "MGNREGA", "budget_estimate": 86000.0, "actual_spent": 72000.0},
        {"entity_code": "SCH-MOCK-02", "entity_name": "PM-KISAN", "budget_estimate": 60000.0, "actual_spent": 58000.0},
        {"entity_code": "SCH-MOCK-03", "entity_name": "PMAY (Urban & Rural)", "budget_estimate": 54000.0, "actual_spent": 38000.0},
        {"entity_code": "SCH-MOCK-04", "entity_name": "Swachh Bharat Mission", "budget_estimate": 12000.0, "actual_spent": 8500.0},
        {"entity_code": "SCH-MOCK-05", "entity_name": "Ayushman Bharat", "budget_estimate": 7500.0,  "actual_spent": 4200.0}
    ]
    
    for s in schemes_data:
        # Check if exists
        if not db.budget_allocations.find_one({"entity_code": s["entity_code"]}):
             payload = {
                 "allocation_code": f"ALLOC-25-26-{s['entity_code']}",
                 "fiscal_year": "2025-26",
                 "allocation_status": "allocated",
                 "entity_type": "scheme",
                 "entity_code": s["entity_code"],
                 "entity_name": s["entity_name"],
                 "ministry_name": "Mock Ministry",
                 "budget_estimate": s["budget_estimate"],
                 "created_at": datetime.datetime.utcnow(),
                 "updated_at": datetime.datetime.utcnow(),
                 "is_mock": True
             }
             res = db.budget_allocations.insert_one(payload)
             
             # Also insert some mock expenditures for these schemes to generate the 'Total Spent'
             db.expenditures.insert_one({
                 "allocation_id": str(res.inserted_id),
                 "month": 6,
                 "expenditure_amount": s["actual_spent"],
                 "is_mock": True
             })
             
    # --- STATES (For State Benchmarking) ---
    states_data = [
        {"state_name": "Tamil Nadu", "budget": 10000.0, "spent": 8600.0},
        {"state_name": "Gujarat", "budget": 12000.0, "spent": 9000.0},
        {"state_name": "Maharashtra", "budget": 15000.0, "spent": 10500.0},
        {"state_name": "Uttar Pradesh", "budget": 20000.0, "spent": 11000.0},
        {"state_name": "Bihar", "budget": 8000.0, "spent": 2880.0} # ~36%
    ]
    
    for st in states_data:
         if not db.budget_allocations.find_one({"state_name": st["state_name"], "is_mock": True}):
             db.budget_allocations.insert_one({
                 "allocation_code": f"ALLOC-STATE-{st['state_name'].replace(' ', '')}",
                 "fiscal_year": "2025-26",
                 "allocation_status": "allocated",
                 "entity_type": "state_aggregation",
                 "state_name": st["state_name"],
                 "budget_estimate": st["budget"],
                 "created_at": datetime.datetime.utcnow(),
                 "is_mock": True
             })
             # We can just store a specialized document or use our endpoint to calculate it.
             # To make the endpoint easier, let's inject a dummy expenditure record
             alloc_doc = db.budget_allocations.find_one({"allocation_code": f"ALLOC-STATE-{st['state_name'].replace(' ', '')}"})
             db.expenditures.insert_one({
                 "allocation_id": str(alloc_doc["_id"]),
                 "month": 6,
                 "expenditure_amount": st["spent"],
                 "is_mock": True
             })

    # --- DISTRICTS (For District Performance Table) ---
    districts_data = [
        {"district": "Indore", "budget": 500.0, "spent": 450.0},
        {"district": "Ernakulam", "budget": 350.0, "spent": 290.0},
        {"district": "Ahmedabad", "budget": 800.0, "spent": 600.0},
        {"district": "Lucknow", "budget": 450.0, "spent": 300.0},
        {"district": "Patna", "budget": 300.0, "spent": 120.0},
        {"district": "Bhopal", "budget": 400.0, "spent": 180.0},
        {"district": "Jaipur", "budget": 600.0, "spent": 400.0},
        {"district": "Surat", "budget": 750.0, "spent": 610.0},
        {"district": "Kanpur", "budget": 380.0, "spent": 150.0},
        {"district": "Varanasi", "budget": 250.0, "spent": 80.0}
    ]
    
    for d in districts_data:
        if not db.departments.find_one({"district": d["district"], "is_mock_district": True}):
             db.departments.insert_one({
                 "dept_id": f"DIST-{d['district'].upper()}",
                 "dept_name": f"{d['district']} Administration",
                 "district": d["district"],
                 "allocated_budget": d["budget"] * 10000000, # Converting to raw numbers to match previous scale
                 "utilized_budget": d["spent"] * 10000000,
                 "is_mock_district": True
             })
             
    print("Mockup data seeded successfully!")

if __name__ == "__main__":
    insert_mockup_data()
