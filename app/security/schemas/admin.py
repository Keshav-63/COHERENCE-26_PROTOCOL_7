"""
Admin Schemas
Request/Response validation schemas for admin management
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class AdminLoginResponse(BaseModel):
    """Schema for admin login response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    tenant_code: str
    tenant_name: str
    tenant_type: str
    requires_public_key: bool
    message: str


class AdminProfile(BaseModel):
    """Schema for admin profile"""
    email: EmailStr
    tenant_code: str
    tenant_name: str
    tenant_type: str
    public_key_uploaded: bool
    public_key_fingerprint: Optional[str] = None
    is_active: bool
    created_at: datetime
    last_authenticated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SignatureVerificationRequest(BaseModel):
    """Schema for testing signature verification"""
    message: str = Field(..., description="Message that was signed")
    signature: str = Field(..., description="Base64 encoded signature")


class SignatureVerificationResponse(BaseModel):
    """Schema for signature verification response"""
    verified: bool
    message: str
    fingerprint: Optional[str] = None
