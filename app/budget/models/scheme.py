"""
Scheme and SubScheme Models
Represents government schemes and programs
"""

from datetime import datetime
from typing import Optional, List
from beanie import Document, Indexed
from pydantic import Field
from enum import Enum


class SchemeType(str, Enum):
    """Scheme type enumeration"""
    CENTRAL_SECTOR = "central_sector"
    CENTRALLY_SPONSORED = "centrally_sponsored"
    STATE = "state"


class SchemeStatus(str, Enum):
    """Scheme status enumeration"""
    ACTIVE = "active"
    COMPLETED = "completed"
    UNDER_REVISION = "under_revision"
    DISCONTINUED = "discontinued"


class Scheme(Document):
    """
    Government Scheme/Program

    Examples:
    - PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)
    - MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act)
    - Ayushman Bharat
    """

    # Basic Information
    scheme_code: Indexed(str, unique=True)
    scheme_name: str
    scheme_short_name: Optional[str] = None
    scheme_type: str  # SchemeType enum stored as string
    scheme_status: str = "active"  # SchemeStatus enum stored as string

    # Ministry/Department Reference
    ministry_id: str
    ministry_code: Indexed(str)
    ministry_name: str  # Denormalized

    department_id: Optional[str] = None
    department_code: Optional[str] = None
    department_name: Optional[str] = None

    # Scheme Details
    description: Optional[str] = None
    objectives: Optional[List[str]] = []
    beneficiary_category: Optional[List[str]] = []  # Farmers, Women, SC/ST, etc.
    coverage_area: Optional[str] = None  # National, State-specific, etc.

    # Financial Details
    total_outlay: Optional[float] = None  # Total scheme budget in crores
    duration_years: Optional[int] = None

    # Timeline
    launch_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

    # Related Documents
    document_urls: Optional[List[str]] = []
    guidelines_url: Optional[str] = None
    portal_url: Optional[str] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "schemes"
        use_state_management = True
        validate_on_save = True
        indexes = [
            [("scheme_code", 1)],
            [("ministry_code", 1)],
            [("scheme_type", 1), ("scheme_status", 1)],
            [("scheme_name", "text"), ("description", "text")],
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "scheme_code": "PM-KISAN-2019",
                "scheme_name": "Pradhan Mantri Kisan Samman Nidhi",
                "scheme_short_name": "PM-KISAN",
                "scheme_type": "central_sector",
                "scheme_status": "active",
                "ministry_code": "MOAFW-001",
                "ministry_name": "Ministry of Agriculture and Farmers Welfare",
                "total_outlay": 75000.00,
                "beneficiary_category": ["Farmers", "Small & Marginal Farmers"]
            }
        }


class SubScheme(Document):
    """
    Sub-scheme or component under a main scheme

    Examples:
    - Sub-schemes under National Health Mission
    - Components under Smart Cities Mission
    """

    # Basic Information
    subscheme_code: Indexed(str, unique=True)
    subscheme_name: str
    subscheme_short_name: Optional[str] = None

    # Parent Scheme Reference
    parent_scheme_id: str
    parent_scheme_code: Indexed(str)
    parent_scheme_name: str  # Denormalized

    # Ministry/Department Reference (inherited from parent)
    ministry_code: str
    department_code: Optional[str] = None

    # Sub-scheme Details
    description: Optional[str] = None
    objectives: Optional[List[str]] = []

    # Financial Allocation (in crores)
    allocated_budget: Optional[float] = None

    # Status
    is_active: bool = True

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "subschemes"
        use_state_management = True
        validate_on_save = True
        indexes = [
            [("subscheme_code", 1)],
            [("parent_scheme_code", 1)],
            [("ministry_code", 1)],
        ]
