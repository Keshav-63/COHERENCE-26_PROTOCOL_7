# from fastapi import FastAPI, Depends
# from app.core.database import connect_to_mongo, close_mongo_connection, get_database
# from app.schemas.audit_schema import TransactionCreate, TransactionResponse
# from app.services.risk_manager import AegisWatcher
# from motor.motor_asyncio import AsyncIOMotorDatabase

# app = FastAPI(title="Aegis-FIN: Total Vigilance")
# watcher = AegisWatcher()

# @app.on_event("startup")
# async def startup(): await connect_to_mongo()

# @app.on_event("shutdown")
# async def shutdown(): await close_mongo_connection()

# @app.post("/api/audit", response_model=TransactionResponse)
# async def run_audit(tx: TransactionCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
#     data = tx.model_dump()
#     # Execute the 7-Point Audit
#     result = await watcher.audit(db, data)
#     data.update(result)
    
#     # Save & Return
#     db_res = await db["transactions"].insert_one(data)
#     data["_id"] = str(db_res.inserted_id)
#     return data

# @app.get("/api/alerts")
# async def get_alerts(db: AsyncIOMotorDatabase = Depends(get_database)):
#     # Returns only FLAGGED/CRITICAL for the heatmap
#     cursor = db["transactions"].find({"risk_score": {"$gt": 0.4}}).sort("timestamp", -1)
#     return [ {**d, "_id": str(d["_id"])} async for d in cursor ]|

import json
from fastapi import FastAPI, Depends, HTTPException
from app.core.database import get_database  # This now gets our JSON handler
from app.schemas.audit_schema import TransactionCreate, TransactionResponse
from app.services.risk_manager import AegisWatcher

app = FastAPI(title="Aegis-FIN: JSON Mock Edition")
watcher = AegisWatcher()

# Load the JSON records into memory once when the app starts
mock_db = get_database()
mock_db.load_records()

@app.get("/")
def home():
    return {"message": "Aegis-FIN is running in JSON Mock Mode."}

@app.post("/api/audit", response_model=TransactionResponse)
async def run_audit(tx: TransactionCreate):
    """
    In JSON mode, we audit the incoming request against 
    the local mock baselines.
    """
    data = tx.model_dump()
    
    # Run the 7-Point Audit (using our mock_db for baselines)
    result = await watcher.audit(mock_db, data)
    data.update(result)
    
    # Since we have no MongoDB, we generate a fake ID for the response
    data["_id"] = f"mock_{data['trans_id']}"
    
    return data

@app.get("/api/all-records")
def get_all_records():
    """Fetch everything currently in your test_anomalies.json"""
    return mock_db.data