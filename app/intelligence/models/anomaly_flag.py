"""
AnomalyFlag Model
Stores detected anomalies with full audit trail and Gemini AI reasoning.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from beanie import Document, Indexed
from pydantic import Field


class AnomalyFlag(Document):
    """
    A detected anomaly flag from the PRAHARI engine.
    Each flag represents a single anomaly type triggered on a transaction.
    """

    # Transaction reference
    trans_id: Indexed(str)
    dept_name: Indexed(str)
    ministry_code: Optional[str] = None
    scheme_code: Optional[str] = None
    fiscal_year: Optional[str] = None

    # Anomaly Classification
    anomaly_type: Indexed(str)  # salami, ghost_vendor, march_rush, impossible_travel, circular_trading, price_padding, spending_drift, isolation_forest
    severity: str  # CRITICAL / HIGH / MEDIUM / LOW
    risk_score: float  # 0.0 to 1.0

    # Evidence
    description: str  # Human-readable anomaly description
    evidence: Dict[str, Any] = Field(default_factory=dict)  # Raw evidence data

    # Gemini AI Narrative
    gemini_narrative: Optional[str] = None  # Full AI analysis
    gemini_recommendation: Optional[str] = None  # Suggested action
    gemini_similar_cases: Optional[str] = None  # Historical similar patterns

    # Status
    status: str = "open"  # open / under_review / resolved / false_positive
    reviewed_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolution_note: Optional[str] = None

    # Financial Impact
    amount: float
    estimated_leakage: Optional[float] = None  # Estimated amount at risk

    detected_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "anomaly_flags"
        indexes = [
            [("trans_id", 1)],
            [("anomaly_type", 1)],
            [("severity", 1), ("detected_at", -1)],
            [("risk_score", -1)],
            [("dept_name", 1)],
            [("status", 1)],
        ]
