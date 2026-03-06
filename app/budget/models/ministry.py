"""
Ministry Model
Represents a Government Ministry at Central or State level
"""

from datetime import datetime
from typing import Optional, List
from beanie import Document, Indexed
from pydantic import Field
from enum import Enum


class GovernmentLevel(str, Enum):
    """Government level enumeration"""
    CENTRAL = "central"
    STATE = "state"
    UNION_TERRITORY = "union_territory"


class Ministry(Document):
    """
    Ministry/Department at Central or State Government level

    Examples:
    - Ministry of Finance (Central)
    - Ministry of Agriculture and Farmers Welfare (Central)
    - Maharashtra Finance Department (State)
    """

    # Basic Information
    ministry_code: Indexed(str, unique=True)
    ministry_name: str
    ministry_short_name: Optional[str] = None
    government_level: str  # GovernmentLevel enum stored as string

    # For State/UT level ministries
    state_code: Optional[str] = None  # ISO code or custom code
    state_name: Optional[str] = None

    # Minister Information
    minister_name: Optional[str] = None
    minister_designation: Optional[str] = None  # Minister, State Minister, etc.
    secretary_name: Optional[str] = None

    # Contact Information
    office_address: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    website_url: Optional[str] = None

    # Metadata
    established_date: Optional[datetime] = None
    is_active: bool = True
    description: Optional[str] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "ministries"
        use_state_management = True
        validate_on_save = True
        indexes = [
            [("ministry_code", 1)],
            [("government_level", 1), ("state_code", 1)],
            [("ministry_name", "text")],
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "ministry_code": "MF-CENTRAL-001",
                "ministry_name": "Ministry of Finance",
                "ministry_short_name": "MoF",
                "government_level": "central",
                "minister_name": "Nirmala Sitharaman",
                "minister_designation": "Minister of Finance",
                "is_active": True
            }
        }

    def __repr__(self) -> str:
        return f"<Ministry(code={self.ministry_code}, name='{self.ministry_name}')>"

    def __str__(self) -> str:
        return self.ministry_name
