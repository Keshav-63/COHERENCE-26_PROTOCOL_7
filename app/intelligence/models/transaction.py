"""
BudgetTransaction Model
Tracks real-time financial transactions for anomaly detection.
All amounts in INR (Rupees).
"""

from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import Field


class BudgetTransaction(Document):
    """
    Real-time transaction record for PRAHARI anomaly analysis.
    Mirrors data format from the shah branch's AegisWatcher engine,
    connected to actual MongoDB.
    """

    trans_id: str
    dept_name: str
    admin_level: str  # "central", "state", "district"
    amount: float  # in INR
    vendor_id: str
    item_category: str
    latitude: float
    longitude: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Optional linkages to existing budget models
    ministry_code: Optional[str] = None
    scheme_code: Optional[str] = None
    fiscal_year: Optional[str] = None
    state_code: Optional[str] = None

    # Audit result (filled after analysis)
    risk_score: Optional[float] = None
    anomaly_reason: Optional[str] = None
    status: Optional[str] = None  # SAFE / FLAGGED / CRITICAL
    anomaly_flags: Optional[list] = Field(default_factory=list)
    gemini_analysis: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "budget_transactions"
        indexes = [
            [("trans_id", 1)],
            [("vendor_id", 1), ("timestamp", -1)],
            [("dept_name", 1), ("timestamp", -1)],
            [("risk_score", -1)],
            [("status", 1)],
            [("timestamp", -1)],
        ]
