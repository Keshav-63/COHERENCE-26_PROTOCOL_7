# import os
# from motor.motor_asyncio import AsyncIOMotorClient
# from dotenv import load_dotenv

# # Load variables from .env file
# load_dotenv()

# # MongoDB configuration
# # Use "mongodb://localhost:27017" if running locally
# MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
# DB_NAME = "aegis_fin_db"

# class Database:
#     client: AsyncIOMotorClient = None
#     db = None

# db = Database()

# async def connect_to_mongo():
#     """Create a new MongoDB client and connect to the server."""
#     db.client = AsyncIOMotorClient(MONGO_URL)
#     db.db = db.client[DB_NAME]
    
#     # Verify the connection with a ping
#     try:
#         await db.client.admin.command('ping')
#         print("✅ Aegis-FIN connected to MongoDB successfully!")
#     except Exception as e:
#         print(f"❌ Could not connect to MongoDB: {e}")

# async def close_mongo_connection():
#     """Close the MongoDB connection."""
#     if db.client:
#         db.client.close()
#         print("🔌 MongoDB connection closed.")

# def get_database():
#     """Dependency to get the active database instance."""
#     return db.db

import json
import os
from pathlib import Path

# Path to your crystal-perfect mock data
JSON_FILE_PATH = Path("test_anomalies.json")

class JSONDatabase:
    def __init__(self):
        self.data = []
        self.baselines = [
            {"item_category": "Infrastructure", "avg_annual_spend": 200000},
            {"item_category": "Medical Supplies", "avg_annual_spend": 50000}
        ]

    def load_records(self):
        """Fetches records from the local JSON file."""
        if not JSON_FILE_PATH.exists():
            print(f"❌ Error: {JSON_FILE_PATH} not found!")
            return []
        
        with open(JSON_FILE_PATH, "r") as f:
            self.data = json.load(f)
            print(f"✅ Aegis-FIN fetched {len(self.data)} records from JSON.")
            return self.data

    def get_baseline(self, category):
        """Mock lookup for the Price Padding logic."""
        return next((b for b in self.baselines if b["item_category"] == category), None)

# Initialize the mock DB
mock_db = JSONDatabase()

def get_database():
    """Simplified dependency to return our mock data handler."""
    return mock_db