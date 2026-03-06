"""
Signature Verification Middleware
Verifies request signatures using admin's public key
"""

from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

from app.security.services import admin_service
from app.security.utils import verify_signature
from app.core.security import verify_token


security = HTTPBearer()


async def verify_request_signature(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Dependency to verify request signature

    This middleware:
    1. Extracts JWT token from Authorization header
    2. Gets admin session and public key
    3. Extracts signature from X-Signature header
    4. Verifies signature matches request body

    Args:
        request: FastAPI request object
        credentials: HTTP Bearer credentials

    Returns:
        Admin info dict with email, tenant_code, session_id

    Raises:
        HTTPException: If signature verification fails
    """
    # Get JWT token
    token = credentials.credentials

    # Verify JWT token
    payload = verify_token(token, token_type="access")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Get admin email from token
    email = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    # Get admin session
    session = await admin_service.get_session_by_email(email)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No active session found. Please upload your public key first."
        )

    # Check if session is locked
    if session.is_locked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account locked: {session.locked_reason}"
        )

    # Get signature from header
    signature = request.headers.get("X-Signature")
    if not signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing X-Signature header. All requests must be signed with your private key."
        )

    # Get request body
    body = await request.body()
    message = body.decode('utf-8') if body else ""

    # For GET requests, use query params as message
    if request.method == "GET":
        message = str(request.url.query) if request.url.query else request.url.path

    # Verify signature
    is_valid = verify_signature(
        public_key_pem=session.public_key,
        message=message,
        signature_b64=signature
    )

    if not is_valid:
        # Increment failed attempts
        failed_count = await admin_service.increment_failed_signature(str(session.id))

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid signature. Failed attempts: {failed_count}/5"
        )

    # Reset failed attempts on successful verification
    await admin_service.reset_failed_signature(str(session.id))

    # Update last request timestamp
    await admin_service.update_last_request(str(session.id))

    # Return admin info
    return {
        "email": session.email,
        "tenant_code": session.tenant_code,
        "tenant_name": session.tenant_name,
        "tenant_type": session.tenant_type,
        "session_id": str(session.id),
        "fingerprint": session.public_key_fingerprint
    }


async def get_admin_from_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Simpler dependency that only verifies JWT token
    Use this for endpoints that don't require signature verification

    Args:
        credentials: HTTP Bearer credentials

    Returns:
        Token payload dict

    Raises:
        HTTPException: If token is invalid
    """
    token = credentials.credentials

    payload = verify_token(token, token_type="access")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return payload
