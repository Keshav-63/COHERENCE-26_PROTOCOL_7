"""
Authentication Endpoints
Email/Password authentication routes for frontend integration
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, verify_token
from app.schemas.user import (
    UserRegister,
    UserLogin,
    TokenResponse,
    UserResponse,
    RefreshTokenRequest
)
from app.services.user import user_service
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister) -> TokenResponse:
    """
    Register a new user with email and password

    **Frontend Integration:**
    1. Collect user email, password, and optional full name
    2. Send registration request to this endpoint
    3. Receive access_token, refresh_token, and user data
    4. Store tokens securely (httpOnly cookies recommended)

    Args:
        user_data: User registration data (email, password, full_name)

    Returns:
        JWT tokens and user information
    """
    # Check if user already exists
    existing_user = await user_service.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    try:
        user = await user_service.register_user(user_data)

        # Create JWT tokens
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role}
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
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin) -> TokenResponse:
    """
    Login with email and password

    **Frontend Integration:**
    1. Collect user email and password
    2. Send login request to this endpoint
    3. Receive access_token, refresh_token, and user data
    4. Store tokens securely (httpOnly cookies recommended)

    Args:
        credentials: User login credentials (email, password)

    Returns:
        JWT tokens and user information
    """
    # Authenticate user
    user = await user_service.authenticate_user(
        email=credentials.email,
        password=credentials.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Create JWT tokens
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role}
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
        data={"sub": str(user.id), "email": user.email, "role": user.role}
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
