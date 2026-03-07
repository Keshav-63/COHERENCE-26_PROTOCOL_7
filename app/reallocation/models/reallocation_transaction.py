"""
Reallocation Transaction Model
Stores fund reallocation transactions between departments
"""

from datetime import datetime
from typing import List, Dict, Any
from beanie import Document
from pydantic import Field


class DonorContribution(Dict[str, Any]):
    """Single donor department contribution"""
    pass


class ReallocationTransaction(Document):
    """
    Records budget reallocation transactions

    Tracks when funds are reallocated from donor departments
    to a receiver department that needs additional budget
    """

    # Receiver Information
    receiver_dept_id: str
    receiver_dept_name: str

    # Donors Information (list of contributions)
    donors: List[Dict[str, Any]] = Field(
        description="List of donor departments with their contributions"
    )
    # Each donor dict contains: dept_id, dept_name, amount

    # Transaction Details
    total_amount: float = Field(description="Total amount reallocated")

    # Metadata
    transaction_status: str = Field(
        default="completed",
        description="Transaction status: pending, completed, failed"
    )

    # Timestamps
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "reallocation_transactions"
        use_state_management = True
        validate_on_save = True
        indexes = [
            [("receiver_dept_id", 1)],
            [("timestamp", -1)],
            [("created_at", -1)],
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "receiver_dept_id": "DPT-01",
                "receiver_dept_name": "Mumbai Health Dept",
                "donors": [
                    {
                        "dept_id": "DPT-02",
                        "dept_name": "Delhi Education Dept",
                        "amount": 4000000
                    },
                    {
                        "dept_id": "DPT-03",
                        "dept_name": "Chennai Infrastructure Dept",
                        "amount": 3000000
                    }
                ],
                "total_amount": 7000000,
                "transaction_status": "completed"
            }
        }

    def __repr__(self) -> str:
        return f"<ReallocationTransaction(receiver={self.receiver_dept_id}, amount={self.total_amount})>"

    def __str__(self) -> str:
        return f"Reallocation to {self.receiver_dept_name}: ₹{self.total_amount:,.2f}"
