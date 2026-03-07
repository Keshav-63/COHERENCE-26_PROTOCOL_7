"""
Transaction Logger Service
Logs reallocation transactions to MongoDB
"""

from datetime import datetime
from typing import List, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.reallocation.models import ReallocationTransaction


async def log_transaction(
    db: AsyncIOMotorDatabase,
    receiver_id: str,
    receiver_name: str,
    donors: List[Dict[str, Any]],
    amount: float
) -> ReallocationTransaction:
    """
    Log a reallocation transaction to the database

    Args:
        db: MongoDB database instance
        receiver_id: Department ID receiving the funds
        receiver_name: Department name receiving the funds
        donors: List of donor departments with contributions
        amount: Total amount reallocated

    Returns:
        ReallocationTransaction: Created transaction record
    """
    transaction = ReallocationTransaction(
        receiver_dept_id=receiver_id,
        receiver_dept_name=receiver_name,
        donors=donors,
        total_amount=amount,
        transaction_status="completed",
        timestamp=datetime.utcnow(),
    )

    await transaction.insert()
    return transaction
