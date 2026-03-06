"""
Authentication Endpoints
Google OAuth2 authentication routes for frontend integration
"""

from datetime import timedelta
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, verify_token
from app.schemas.user import (
    GoogleAuthRequest,
    TokenResponse,
    UserResponse,
    RefreshTokenRequest
)
from app.services.oauth import google_oauth_service
from app.services.user import user_service
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/google/login")
async def google_login(
    redirect_uri: str = Query(None, description="Optional redirect URI override")
) -> Dict[str, str]:
    """
    Generate Google OAuth2 login URL

    **Frontend Integration:**
    1. Call this endpoint to get the authorization URL
    2. Redirect user to the returned URL
    3. User will authenticate with Google
    4. Google will redirect back to your callback endpoint

    Returns:
        Dictionary containing authorization_url
    """
    auth_url = google_oauth_service.get_authorization_url()

    return {
        "authorization_url": auth_url,
        "message": "Redirect user to this URL for Google authentication"
    }


@router.post("/google/callback", response_model=TokenResponse)
async def google_callback(
    auth_request: GoogleAuthRequest
) -> TokenResponse:
    """
    Handle Google OAuth2 callback and exchange code for tokens

    **Frontend Integration:**
    1. After Google redirects back, extract the 'code' from URL query params
    2. Send the code to this endpoint
    3. Receive access_token, refresh_token, and user data
    4. Store tokens securely (httpOnly cookies recommended)

    Args:
        auth_request: Contains authorization code from Google

    Returns:
        JWT tokens and user information
    """
    try:
        # Exchange authorization code for Google tokens
        token_data = await google_oauth_service.exchange_code_for_token(
            code=auth_request.code,
            redirect_uri=auth_request.redirect_uri
        )

        # Get user info from Google
        google_user = await google_oauth_service.get_user_info(
            access_token=token_data["access_token"]
        )

        # Get or create user in database
        user, is_new = await user_service.get_or_create_user(
            google_id=google_user.sub,
            email=google_user.email,
            full_name=google_user.name,
            profile_picture=google_user.picture
        )

        # Create JWT tokens
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email}
        )
        refresh_token = create_refresh_token(
            data={"sub": str(user.id)}
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Authentication failed: {str(e)}"
        )


@router.post("/refresh", response_model=Dict[str, Any])
async def refresh_access_token(
    refresh_request: RefreshTokenRequest
) -> Dict[str, Any]:
    """
    Refresh access token using refresh token

    **Frontend Integration:**
    1. When access_token expires (401 Unauthorized)
    2. Send refresh_token to this endpoint
    3. Receive new access_token
    4. Update stored access_token

    Args:
        refresh_request: Contains refresh token

    Returns:
        New access token and expiration info
    """
    # Verify refresh token
    payload = verify_token(refresh_request.refresh_token, token_type="refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    # Verify user exists and is active
    user = await user_service.get_user_by_id(user_id=user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    # Create new access token
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
) -> UserResponse:
    """
    Get current authenticated user information

    **Frontend Integration:**
    1. Include access_token in Authorization header: "Bearer {access_token}"
    2. Call this endpoint to get user profile
    3. Use for displaying user info, checking auth status, etc.

    Returns:
        Current user information
    """
    return UserResponse.model_validate(current_user)


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Logout current user

    **Frontend Integration:**
    1. Call this endpoint with access_token
    2. Clear all stored tokens (access_token, refresh_token)
    3. Redirect to login page

    Note: This is a client-side logout. Clear tokens on frontend.
    For enhanced security, implement token blacklisting.

    Returns:
        Logout confirmation message
    """
    return {
        "message": "Successfully logged out",
        "detail": "Please clear tokens from client storage"
    }
