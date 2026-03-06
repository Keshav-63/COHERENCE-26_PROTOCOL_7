"""
Database Configuration and Connection Management
Implements async MongoDB connection using Motor
"""

from typing import AsyncGenerator
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from beanie import init_beanie

from app.core.config import settings

# Global MongoDB client and database
mongodb_client: AsyncIOMotorClient = None
mongodb_database: AsyncIOMotorDatabase = None


async def get_db() -> AsyncIOMotorDatabase:
    """
    Dependency for getting MongoDB database instance

    Returns:
        AsyncIOMotorDatabase: MongoDB database instance

    Usage:
        @app.get("/users")
        async def get_users(db: AsyncIOMotorDatabase = Depends(get_db)):
            ...
    """
    return mongodb_database


async def connect_to_mongodb() -> None:
    """
    Connect to MongoDB database
    Creates client and initializes Beanie ODM
    """
    global mongodb_client, mongodb_database

    # Create MongoDB client
    mongodb_client = AsyncIOMotorClient(
        settings.MONGODB_URL,
        maxPoolSize=10,
        minPoolSize=1,
        serverSelectionTimeoutMS=5000,
    )

    # Get database
    mongodb_database = mongodb_client[settings.DATABASE_NAME]

    # Initialize Beanie with document models
    from app.models.user import User
    from app.security.models import Invitation, AdminSession

    await init_beanie(
        database=mongodb_database,
        document_models=[User, Invitation, AdminSession]
    )

    print(f"Connected to MongoDB: {settings.DATABASE_NAME}")


async def close_mongodb_connection() -> None:
    """Close MongoDB connection"""
    global mongodb_client

    if mongodb_client:
        mongodb_client.close()
        print("MongoDB connection closed")


# Alternative: Direct dependency without global state
async def get_database() -> AsyncGenerator[AsyncIOMotorDatabase, None]:
    """
    Dependency that yields database instance

    Yields:
        AsyncIOMotorDatabase: Database instance
    """
    yield mongodb_database
