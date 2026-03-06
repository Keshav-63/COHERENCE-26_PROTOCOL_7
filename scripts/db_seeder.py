import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def seed():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["aegis_fin_db"]
    
    # Set market baselines
    baselines = [
        {"item_category": "Infrastructure", "avg_annual_spend": 200000},
        {"item_category": "Medical Supplies", "avg_annual_spend": 50000}
    ]
    
    await db["baselines"].delete_many({})
    await db["baselines"].insert_many(baselines)
    print("✅ System Baselines Seeded. Aegis-FIN is ready.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())