"""
Department Model
Represents departments under ministries
"""

from datetime import datetime
from typing import Optional
from beanie import Document, Indexed, Link
from pydantic import Field


class Department(Document):
    """
    Department under a Ministry

    Examples:
    - Department of Economic Affairs (under Ministry of Finance)
    - Department of Agriculture (under Ministry of Agriculture)
    """

    # Basic Information
    department_code: Indexed(str, unique=True)
    department_name: str
    department_short_name: Optional[str] = None

    # Ministry Reference
    ministry_id: str  # Reference to Ministry
    ministry_code: Indexed(str)
    ministry_name: str  # Denormalized for faster queries

    # Department Head Information
    head_name: Optional[str] = None
    head_designation: Optional[str] = None  # Secretary, Additional Secretary, etc.

    # Contact Information
    office_address: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    website_url: Optional[str] = None

    # Metadata
    is_active: bool = True
    description: Optional[str] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "departments"
        use_state_management = True
        validate_on_save = True
        indexes = [
            [("department_code", 1)],
            [("ministry_code", 1)],
            [("department_name", "text")],
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "department_code": "DEA-MF-001",
                "department_name": "Department of Economic Affairs",
                "department_short_name": "DEA",
                "ministry_code": "MF-CENTRAL-001",
                "ministry_name": "Ministry of Finance",
                "is_active": True
            }
        }

    def __repr__(self) -> str:
        return f"<Department(code={self.department_code}, name='{self.department_name}')>"

    def __str__(self) -> str:
        return self.department_name
