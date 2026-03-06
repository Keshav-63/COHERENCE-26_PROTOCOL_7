"""
RiskScore Model
Aggregate risk scores per entity (ministry / department / vendor / scheme).
Updated on each transaction audit.
"""

from datetime import datetime
from typing import Optional, Dict, List
from beanie import Document
from pydantic import Field


class RiskScore(Document):
    """
    Rolling risk profile for government entities tracked by PRAHARI.
    """

    entity_type: str  # "ministry" / "department" / "vendor" / "scheme"
    entity_id: str
    entity_name: str

    # Composite Risk Score (0–100)
    composite_score: float = 0.0

    # Individual component scores (0–1 each)
    salami_score: float = 0.0
    ghost_vendor_score: float = 0.0
    march_rush_score: float = 0.0
    travel_anomaly_score: float = 0.0
    circular_trading_score: float = 0.0
    price_padding_score: float = 0.0
    spending_drift_score: float = 0.0
    ml_isolation_score: float = 0.0

    # Counts
    total_transactions: int = 0
    flagged_transactions: int = 0
    critical_flags: int = 0

    # Financial summary
    total_amount_audited: float = 0.0
    estimated_leakage: float = 0.0

    # Risk tier
    risk_tier: str = "GREEN"  # GREEN / YELLOW / ORANGE / RED

    # Gemini summary
    gemini_risk_profile: Optional[str] = None

    # Historical trend (last 12 months scores)
    monthly_scores: List[Dict] = Field(default_factory=list)

    last_updated: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "risk_scores"
        indexes = [
            [("entity_type", 1), ("entity_id", 1)],
            [("composite_score", -1)],
            [("risk_tier", 1)],
        ]

    @property
    def risk_tier_label(self) -> str:
        if self.composite_score >= 80:
            return "RED"
        elif self.composite_score >= 55:
            return "ORANGE"
        elif self.composite_score >= 30:
            return "YELLOW"
        return "GREEN"
