"""
Admin Session Model
Tracks authenticated admin sessions with public key verification
"""

from datetime import datetime
from typing import Optional
from beanie import Document, Indexed
from pydantic import EmailStr, Field


class AdminSession(Document):
    """Admin session document for tracking authenticated state/minister admins"""

    # Admin details
    email: Indexed(EmailStr)
    tenant_code: Indexed(str)
    tenant_name: str
    tenant_type: str

    # Public key details
    public_key: str = Field(..., description="Public key for signature verification")
    public_key_fingerprint: str = Field(..., description="Fingerprint of public key")

    # Session tracking
    last_authenticated_at: datetime = Field(default_factory=datetime.utcnow)
    last_request_at: Optional[datetime] = None
    request_count: int = 0
    failed_signature_attempts: int = 0

    # Status
    is_active: bool = True
    is_locked: bool = False
    locked_reason: Optional[str] = None
    locked_at: Optional[datetime] = None

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "admin_sessions"
        use_state_management = True
        validate_on_save = True
        indexes = [
            "email",
            "tenant_code",
            "public_key_fingerprint",
            "is_active"
        ]

    def __repr__(self) -> str:
        return f"<AdminSession(email='{self.email}', tenant='{self.tenant_code}')>"
