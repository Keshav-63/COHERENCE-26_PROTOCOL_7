"""
Admin Authentication Endpoints
API endpoints for state/minister admin login and public key management
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status

from app.security.schemas import (
    InvitationLogin,
    PublicKeyUpload,
    PublicKeyResponse,
    AdminLoginResponse,
    AdminProfile,
    SignatureVerificationRequest,
    SignatureVerificationResponse
)
from app.security.services import invitation_service, admin_service
from app.security.middleware import get_admin_from_token
from app.security.utils import verify_signature
from app.core.security import create_access_token, create_refresh_token
from app.core.config import settings


router = APIRouter(prefix="/admin", tags=["Admin Authentication"])


@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(
    login_data: InvitationLogin
) -> AdminLoginResponse:
    """
    Admin login with temporary password

    **First-time login flow:**
    1. Admin receives email with dashboard URL (contains hash)
    2. Opens URL in browser
    3. Enters email and temporary password
    4. Receives JWT tokens
    5. Must upload public key before accessing data

    **Request:**
    - email: Admin email address
    - temporary_password: Password from invitation email
    - invitation_hash: (Optional) Hash from URL query parameter

    **Response:**
    - JWT access and refresh tokens
    - Tenant information
    - Flag indicating if public key upload is required

    **Security:**
    - Temporary password is single-use
    - Invitation must not be expired or revoked
    - After login, admin must upload public key
    - invitation_hash is optional for subsequent logins
    """
    try:
        # Verify credentials
        invitation = await invitation_service.verify_login(
            email=login_data.email,
            temporary_password=login_data.temporary_password,
            invitation_hash=login_data.invitation_hash
        )

        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials or invitation expired"
            )

        # Mark invitation as accepted if first login
        if invitation.status.value == "pending":
            invitation = await invitation_service.mark_as_accepted(str(invitation.id))

        # Create JWT tokens
        access_token = create_access_token(
            data={
                "sub": str(invitation.id),
                "email": invitation.email,
                "tenant_code": invitation.tenant_code,
                "type": "admin"
            }
        )

        refresh_token = create_refresh_token(
            data={
                "sub": str(invitation.id),
                "email": invitation.email
            }
        )

        # Build response
        return AdminLoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            tenant_code=invitation.tenant_code,
            tenant_name=invitation.tenant_name,
            tenant_type=invitation.tenant_type.value,
            requires_public_key=not invitation.public_key_uploaded,
            message="Login successful. Please upload your public key to access the system."
                    if not invitation.public_key_uploaded
                    else "Login successful."
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.post("/upload-public-key", response_model=PublicKeyResponse)
async def upload_public_key(
    key_data: PublicKeyUpload,
    admin_info: dict = Depends(get_admin_from_token)
) -> PublicKeyResponse:
    """
    Upload SSH public key

    **Requirements:**
    - Must be logged in (valid JWT token)
    - Public key must be valid SSH format (RSA, Ed25519, etc.)
    - Key is validated and fingerprint is calculated

    **SSH Key Generation:**
    ```bash
    # Ed25519 (recommended - modern, secure, fast)
    ssh-keygen -t ed25519 -C "your_email@example.com"

    # RSA (traditional, widely supported)
    ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
    ```

    **Upload the PUBLIC key** (file ending with .pub):
    - Ed25519: `~/.ssh/id_ed25519.pub`
    - RSA: `~/.ssh/id_rsa.pub`

    **⚠️ NEVER upload your private key!**

    **Response:**
    - Success status
    - Key fingerprint (SHA-256 hash)
    - Upload timestamp

    **After upload:**
    - All API requests must include X-Signature header
    - Signature created by signing request with private key
    """
    try:
        email = admin_info.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        # Get invitation
        invitation = await invitation_service.get_invitation_by_email(email)
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found"
            )

        # Upload public key
        invitation, fingerprint = await invitation_service.upload_public_key(
            invitation_id=str(invitation.id),
            public_key=key_data.public_key
        )

        # Create or update admin session
        await admin_service.create_or_update_session(
            email=invitation.email,
            tenant_code=invitation.tenant_code,
            tenant_name=invitation.tenant_name,
            tenant_type=invitation.tenant_type.value,
            public_key=key_data.public_key,
            public_key_fingerprint=fingerprint
        )

        return PublicKeyResponse(
            success=True,
            fingerprint=fingerprint,
            message="Public key uploaded successfully. You can now make signed requests.",
            uploaded_at=invitation.public_key_uploaded_at
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload public key: {str(e)}"
        )


@router.get("/profile", response_model=AdminProfile)
async def get_admin_profile(
    admin_info: dict = Depends(get_admin_from_token)
) -> AdminProfile:
    """
    Get admin profile information

    **Returns:**
    - Email
    - Tenant information
    - Public key status
    - Last authentication time

    **Use this to:**
    - Check if public key is uploaded
    - Get tenant details
    - Verify authentication status
    """
    try:
        email = admin_info.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        # Get session
        session = await admin_service.get_session_by_email(email)
        if not session:
            # Try to get from invitation
            invitation = await invitation_service.get_invitation_by_email(email)
            if not invitation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Admin not found"
                )

            return AdminProfile(
                email=invitation.email,
                tenant_code=invitation.tenant_code,
                tenant_name=invitation.tenant_name,
                tenant_type=invitation.tenant_type.value,
                public_key_uploaded=invitation.public_key_uploaded,
                public_key_fingerprint=invitation.public_key_fingerprint,
                is_active=invitation.status.value == "accepted",
                created_at=invitation.created_at,
                last_authenticated_at=invitation.accepted_at or invitation.created_at
            )

        return AdminProfile(
            email=session.email,
            tenant_code=session.tenant_code,
            tenant_name=session.tenant_name,
            tenant_type=session.tenant_type,
            public_key_uploaded=True,
            public_key_fingerprint=session.public_key_fingerprint,
            is_active=session.is_active,
            created_at=session.created_at,
            last_authenticated_at=session.last_authenticated_at
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch profile: {str(e)}"
        )


@router.post("/test-signature", response_model=SignatureVerificationResponse)
async def test_signature_verification(
    request_data: SignatureVerificationRequest,
    admin_info: dict = Depends(get_admin_from_token)
) -> SignatureVerificationResponse:
    """
    Test signature verification

    **Use this endpoint to test if your request signing is working correctly.**

    **Process:**
    1. Sign a test message with your private key
    2. Send message and signature to this endpoint
    3. Backend verifies using your uploaded public key

    **Example (using OpenSSL):**
    ```bash
    # Sign a message
    echo -n "test message" | openssl dgst -sha256 -sign ~/.ssh/id_rsa | base64

    # For Ed25519 (requires newer OpenSSL)
    echo -n "test message" | openssl pkeyutl -sign -inkey ~/.ssh/id_ed25519 | base64
    ```

    **Request:**
    - message: Original message that was signed
    - signature: Base64-encoded signature

    **Response:**
    - verified: Boolean indicating if signature is valid
    - fingerprint: Your public key fingerprint
    - message: Status message
    """
    try:
        email = admin_info.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        # Get session
        session = await admin_service.get_session_by_email(email)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No public key uploaded. Please upload your public key first."
            )

        # Verify signature
        is_valid = verify_signature(
            public_key_pem=session.public_key,
            message=request_data.message,
            signature_b64=request_data.signature
        )

        return SignatureVerificationResponse(
            verified=is_valid,
            message="Signature verified successfully!" if is_valid else "Signature verification failed",
            fingerprint=session.public_key_fingerprint if is_valid else None
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify signature: {str(e)}"
        )
