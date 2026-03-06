"""
Central Admin Endpoints
API endpoints for central government admin to manage invitations
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.security.schemas import (
    InvitationCreate,
    InvitationResponse,
    InvitationListResponse,
    InvitationStats
)
from app.security.services import invitation_service
from app.security.models import InvitationStatus, TenantType
from app.api.deps import get_current_user
from app.models.user import User
from app.core.config import settings


router = APIRouter(prefix="/central/invitations", tags=["Central Admin - Invitations"])


@router.post("/", response_model=InvitationResponse, status_code=status.HTTP_201_CREATED)
async def create_invitation(
    invitation_data: InvitationCreate,
    current_user: User = Depends(get_current_user)
) -> InvitationResponse:
    """
    Create and send invitation to state/minister admin

    **Requirements:**
    - Only central government users can create invitations
    - Email must be unique and valid
    - Tenant code must be unique

    **Process:**
    1. Creates invitation record
    2. Generates unique hash for dashboard URL
    3. Generates temporary password
    4. Sends email with login credentials

    **Response includes:**
    - Dashboard URL with hash
    - Temporary password (also sent via email)
    - Invitation details
    """
    try:
        # Create invitation
        invitation, temp_password = await invitation_service.create_invitation(
            invitation_data=invitation_data,
            invited_by=str(current_user.id)
        )

        # Generate dashboard URL
        dashboard_url = f"{settings.FRONTEND_URL}/admin/login?hash={invitation.invitation_hash}"

        # Build response
        return InvitationResponse(
            id=str(invitation.id),
            email=invitation.email,
            tenant_type=invitation.tenant_type,
            tenant_name=invitation.tenant_name,
            tenant_code=invitation.tenant_code,
            invitation_hash=invitation.invitation_hash,
            dashboard_url=dashboard_url,
            status=invitation.status,
            is_first_login=invitation.is_first_login,
            public_key_uploaded=invitation.public_key_uploaded,
            invited_at=invitation.invited_at,
            expires_at=invitation.expires_at,
            accepted_at=invitation.accepted_at,
            description=invitation.description
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create invitation: {str(e)}"
        )


@router.get("/", response_model=List[InvitationListResponse])
async def list_invitations(
    status_filter: InvitationStatus = Query(None, description="Filter by status"),
    tenant_type: TenantType = Query(None, description="Filter by tenant type"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum records to return"),
    current_user: User = Depends(get_current_user)
) -> List[InvitationListResponse]:
    """
    List all invitations with optional filters

    **Filters:**
    - status: pending, accepted, expired, revoked
    - tenant_type: state_government, minister, department
    - Pagination: skip and limit

    **Returns:**
    List of invitations with basic information
    """
    try:
        invitations = await invitation_service.get_all_invitations(
            status=status_filter,
            tenant_type=tenant_type,
            skip=skip,
            limit=limit
        )

        return [
            InvitationListResponse(
                id=str(inv.id),
                email=inv.email,
                tenant_name=inv.tenant_name,
                tenant_code=inv.tenant_code,
                status=inv.status,
                public_key_uploaded=inv.public_key_uploaded,
                invited_at=inv.invited_at,
                expires_at=inv.expires_at
            )
            for inv in invitations
        ]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch invitations: {str(e)}"
        )


@router.get("/stats", response_model=InvitationStats)
async def get_invitation_stats(
    current_user: User = Depends(get_current_user)
) -> InvitationStats:
    """
    Get invitation statistics

    **Returns:**
    - Total invitations
    - Pending invitations
    - Accepted invitations
    - Expired invitations
    - Active admins (with public key uploaded)
    """
    try:
        return await invitation_service.get_invitation_stats()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch stats: {str(e)}"
        )


@router.get("/{invitation_id}", response_model=InvitationResponse)
async def get_invitation_details(
    invitation_id: str,
    current_user: User = Depends(get_current_user)
) -> InvitationResponse:
    """
    Get detailed information about a specific invitation

    **Returns:**
    Complete invitation details including:
    - Dashboard URL
    - Public key status
    - Acceptance status
    - Timestamps
    """
    try:
        from beanie import PydanticObjectId
        invitation = await invitation_service.get_invitation_by_email("")  # Will update this
        # For now, using a simple query
        from app.security.models import Invitation
        invitation = await Invitation.get(PydanticObjectId(invitation_id))

        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found"
            )

        dashboard_url = f"{settings.FRONTEND_URL}/admin/login?hash={invitation.invitation_hash}"

        return InvitationResponse(
            id=str(invitation.id),
            email=invitation.email,
            tenant_type=invitation.tenant_type,
            tenant_name=invitation.tenant_name,
            tenant_code=invitation.tenant_code,
            invitation_hash=invitation.invitation_hash,
            dashboard_url=dashboard_url,
            status=invitation.status,
            is_first_login=invitation.is_first_login,
            public_key_uploaded=invitation.public_key_uploaded,
            invited_at=invitation.invited_at,
            expires_at=invitation.expires_at,
            accepted_at=invitation.accepted_at,
            description=invitation.description
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch invitation: {str(e)}"
        )


@router.post("/{invitation_id}/revoke", response_model=Dict[str, Any])
async def revoke_invitation(
    invitation_id: str,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Revoke an invitation

    **Effect:**
    - Changes invitation status to 'revoked'
    - Admin can no longer use this invitation to login
    - Public key (if uploaded) remains in database for audit

    **Returns:**
    Success message with revoked invitation details
    """
    try:
        invitation = await invitation_service.revoke_invitation(invitation_id)

        return {
            "message": "Invitation revoked successfully",
            "invitation_id": str(invitation.id),
            "email": invitation.email,
            "tenant_code": invitation.tenant_code,
            "revoked_at": invitation.updated_at.isoformat()
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to revoke invitation: {str(e)}"
        )


@router.post("/cleanup-expired", response_model=Dict[str, Any])
async def cleanup_expired_invitations(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Mark all expired invitations as 'expired'

    **Process:**
    - Finds all pending invitations past expiry date
    - Updates their status to 'expired'

    **Returns:**
    Number of invitations marked as expired
    """
    try:
        count = await invitation_service.cleanup_expired_invitations()

        return {
            "message": "Expired invitations cleaned up",
            "count": count
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cleanup invitations: {str(e)}"
        )
