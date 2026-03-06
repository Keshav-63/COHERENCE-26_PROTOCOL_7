"""
Invitation Model
Tracks invitations sent by central government to state/minister admins
"""

from datetime import datetime
from typing import Optional
from enum import Enum
from beanie import Document, Indexed
from pydantic import EmailStr, Field


class InvitationStatus(str, Enum):
    """Status of invitation"""
    PENDING = "pending"
    ACCEPTED = "accepted"
    EXPIRED = "expired"
    REVOKED = "revoked"


class TenantType(str, Enum):
    """Type of tenant"""
    CENTRAL_GOVT = "central_government"
    STATE_GOVT = "state_government"
    MINISTER = "minister"
    DEPARTMENT = "department"


class Invitation(Document):
    """Invitation document model for multi-tenancy access"""

    # Invitation details
    email: Indexed(EmailStr, unique=True)
    tenant_type: TenantType
    tenant_name: str = Field(..., description="Name of state/ministry/department")
    tenant_code: Indexed(str, unique=True) = Field(..., description="Unique code for tenant")

    # Security
    invitation_hash: Indexed(str, unique=True) = Field(..., description="Unique hash for dashboard URL")
    temporary_password: str = Field(..., description="Hashed temporary password")

    # Status tracking
    status: InvitationStatus = InvitationStatus.PENDING
    is_first_login: bool = True
    public_key_uploaded: bool = False

    # Metadata
    invited_by: str = Field(..., description="User ID of central admin who sent invitation")
    invited_at: datetime = Field(default_factory=datetime.utcnow)
    accepted_at: Optional[datetime] = None
    expires_at: datetime = Field(..., description="Invitation expiry time")

    # Public key info
    public_key: Optional[str] = None
    public_key_uploaded_at: Optional[datetime] = None
    public_key_fingerprint: Optional[str] = None

    # Additional metadata
    description: Optional[str] = None
    metadata: Optional[dict] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "invitations"
        use_state_management = True
        validate_on_save = True
        indexes = [
            "email",
            "tenant_code",
            "invitation_hash",
            "status"
        ]

    def __repr__(self) -> str:
        return f"<Invitation(email='{self.email}', tenant='{self.tenant_name}', status='{self.status}')>"
