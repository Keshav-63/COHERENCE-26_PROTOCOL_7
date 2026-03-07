"""
Fund Flow Edge Model
Directed edge representing money moving from one node to another.
"""

from datetime import datetime
from typing import Optional, List
from beanie import Document
from pydantic import Field
from enum import Enum


class EdgeType(str, Enum):
    BUDGET_ALLOCATION  = "budget_allocation"   # Central budget granted to Ministry
    SCHEME_RELEASE     = "scheme_release"       # Ministry releases to Scheme
    STATE_TRANSFER     = "state_transfer"       # Central/Scheme → State
    DEPT_ALLOCATION    = "dept_allocation"      # Ministry/State → Department
    DISTRICT_RELEASE   = "district_release"     # State/Dept → District
    CONTRACT_PAYMENT   = "contract_payment"     # Dept/District → Vendor
    GRANT              = "grant"                # Direct grant (non-scheme)


class FlowEdge(Document):
    """
    A directed edge in the Fund Flow Knowledge Graph.
    Represents money moving from `from_node` → `to_node`.
    """

    edge_id: str          # Unique identifier

    # Endpoints
    from_node_id: str
    to_node_id: str
    from_node_type: str
    to_node_type: str
    from_node_name: str
    to_node_name: str

    # Classification
    edge_type: str        # EdgeType value
    fiscal_year: str = "2025-26"

    # Financial (₹ Crores)
    allocated_cr: float = 0.0   # Sanctioned / planned
    actual_cr: float = 0.0      # Actually transferred
    flow_efficiency: float = 0.0  # (actual / allocated) * 100

    # Context
    scheme_code: Optional[str] = None
    ministry_code: Optional[str] = None
    state_code: Optional[str] = None
    department_code: Optional[str] = None

    # Traceability (IDs of source DB documents)
    source_doc_ids: List[str] = Field(default_factory=list)

    # Risk
    anomaly_count: int = 0
    is_flagged: bool = False

    # Timestamps
    last_synced: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "fund_flow_edges"
        indexes = [
            [("from_node_id", 1), ("fiscal_year", 1)],
            [("to_node_id", 1), ("fiscal_year", 1)],
            [("from_node_id", 1), ("to_node_id", 1), ("fiscal_year", 1)],
            [("fiscal_year", 1)],
            [("edge_type", 1)],
        ]
