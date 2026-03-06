"""
User Pydantic Schemas
Request/Response validation and serialization schemas
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserBase(BaseModel):
    """Base user schema with common fields"""
    email: EmailStr
    full_name: Optional[str] = None
    profile_picture: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a new user"""
    google_id: str
    oauth_provider: str = "google"
    is_verified: bool = True


class UserResponse(UserBase):
    """Schema for user responses to frontend"""
    id: str  # MongoDB ObjectId as string
    is_active: bool
    is_verified: bool
    oauth_provider: str
    created_at: datetime
    last_login: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserInDB(UserResponse):
    """Schema for user data stored in database"""
    google_id: Optional[str] = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Schema for authentication token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Token expiration time in seconds")
    user: UserResponse


class GoogleAuthRequest(BaseModel):
    """Schema for Google OAuth authentication request"""
    code: str = Field(..., description="Authorization code from Google OAuth")
    redirect_uri: Optional[str] = Field(None, description="Optional redirect URI override")


class GoogleAuthResponse(BaseModel):
    """Schema for successful Google OAuth response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse
    message: str = "Authentication successful"


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request"""
    refresh_token: str = Field(..., description="Refresh token to exchange for new access token")


class GoogleUserInfo(BaseModel):
    """Schema for Google user information"""
    sub: str = Field(..., description="Google user ID")
    email: EmailStr
    email_verified: bool = False
    name: Optional[str] = None
    picture: Optional[str] = None
    given_name: Optional[str] = None
    family_name: Optional[str] = None
