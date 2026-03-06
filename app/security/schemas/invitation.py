"""
Invitation Schemas
Request/Response validation schemas for invitation management
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.security.models.invitation import InvitationStatus, TenantType


class InvitationCreate(BaseModel):
    """Schema for creating a new invitation"""
    email: EmailStr
    tenant_type: TenantType
    tenant_name: str = Field(..., min_length=2, max_length=200)
    tenant_code: str = Field(..., min_length=2, max_length=50, description="Unique tenant code")
    description: Optional[str] = Field(None, max_length=500)
    metadata: Optional[dict] = None
    expires_in_days: int = Field(default=7, ge=1, le=30, description="Invitation validity in days")


class InvitationResponse(BaseModel):
    """Schema for invitation response"""
    id: str
    email: EmailStr
    tenant_type: TenantType
    tenant_name: str
    tenant_code: str
    invitation_hash: str
    dashboard_url: str = Field(..., description="Full dashboard URL with hash")
    status: InvitationStatus
    is_first_login: bool
    public_key_uploaded: bool
    invited_at: datetime
    expires_at: datetime
    accepted_at: Optional[datetime] = None
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class InvitationListResponse(BaseModel):
    """Schema for listing invitations"""
    id: str
    email: EmailStr
    tenant_name: str
    tenant_code: str
    status: InvitationStatus
    public_key_uploaded: bool
    invited_at: datetime
    expires_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InvitationLogin(BaseModel):
    """Schema for initial login with temporary password"""
    email: EmailStr
    temporary_password: str = Field(..., min_length=8)
    invitation_hash: str = Field(..., description="Hash from invitation URL")


class PublicKeyUpload(BaseModel):
    """Schema for uploading public key"""
    public_key: str = Field(..., description="SSH public key (RSA, ED25519, etc.)")


class PublicKeyResponse(BaseModel):
    """Schema for public key upload response"""
    success: bool
    fingerprint: str
    message: str
    uploaded_at: datetime


class InvitationStats(BaseModel):
    """Schema for invitation statistics"""
    total_invitations: int
    pending_invitations: int
    accepted_invitations: int
    expired_invitations: int
    active_admins: int
