"""
User Document Model
Beanie (MongoDB ODM) model for storing user information
"""

from datetime import datetime
from typing import Optional
from beanie import Document, Indexed
from pydantic import EmailStr, Field


class User(Document):
    """User document model for storing user authentication data in MongoDB"""

    email: Indexed(EmailStr, unique=True)
    hashed_password: str
    full_name: Optional[str] = None
    profile_picture: Optional[str] = None

    # Account status
    is_active: bool = True
    is_verified: bool = False

    # Role for central admin identification
    role: str = "user"  # "user" or "central_admin"

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

    class Settings:
        name = "users"  # Collection name
        use_state_management = True
        validate_on_save = True

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "full_name": "John Doe",
                "hashed_password": "$2b$12$...",
                "is_active": True,
                "is_verified": True,
                "role": "user"
            }
        }

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"

    def __str__(self) -> str:
        return self.email
