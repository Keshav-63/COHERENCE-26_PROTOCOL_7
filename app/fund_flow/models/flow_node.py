"""
Fund Flow Node Model
Each node represents a fund entity in the knowledge graph:
  CENTRAL_GOVT → MINISTRY → SCHEME/DEPT → STATE → DISTRICT → VENDOR
"""

from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import Field
from enum import Enum


class NodeType(str, Enum):
    CENTRAL_GOVT = "central_govt"   # Root: Government of India
    MINISTRY     = "ministry"        # Central ministry (MoHFW, MoF, etc.)
    SCHEME       = "scheme"          # Central scheme (PM-KISAN, MGNREGA, etc.)
    DEPARTMENT   = "department"      # Implementing department
    STATE        = "state"           # State government
    DISTRICT     = "district"        # District-level implementation
    SECTOR       = "sector"          # Thematic sector (Health, Roads, etc.)
    VENDOR       = "vendor"          # Terminal: contractor / vendor


class FlowNode(Document):
    """
    A node in the National Fund Flow Knowledge Graph.
    Tracks every entity money passes through, with live financial aggregates.
    """

    # Identity
    node_id: str           # Unique: "MINISTRY:MOHFW", "STATE:MH", "VENDOR:V001"
    node_type: str         # NodeType value
    node_name: str
    node_code: str
    fiscal_year: str = "2025-26"

    # Hierarchy
    parent_node_id: Optional[str] = None   # Direct parent in the flow chain
    depth: int = 0                          # 0=central, 1=ministry, 2=state/scheme, 3=dept, 4=district, 5=vendor

    # Financial aggregates (in ₹ Crores, recomputed on each graph sync)
    total_inflow_cr: float = 0.0     # Total funds received from parent(s)
    total_outflow_cr: float = 0.0    # Total funds disbursed to children
    total_allocated_cr: float = 0.0  # Budgeted / sanctioned amount
    total_spent_cr: float = 0.0      # Actual expenditure
    absorption_rate: float = 0.0     # (total_spent / total_allocated) * 100
    unspent_cr: float = 0.0          # Funds yet to flow downstream (lapse risk)

    # Risk (populated from PRAHARI AegisWatcher results)
    anomaly_count: int = 0
    anomaly_score: float = 0.0       # 0.0–1.0
    risk_tier: str = "GREEN"         # GREEN / YELLOW / ORANGE / RED

    # Geography (for heatmap overlays)
    state_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # Metadata
    is_active: bool = True
    last_synced: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "fund_flow_nodes"
        indexes = [
            [("node_id", 1)],
            [("node_type", 1), ("fiscal_year", 1)],
            [("fiscal_year", 1)],
            [("state_code", 1)],
            [("risk_tier", 1)],
            [("parent_node_id", 1)],
        ]
