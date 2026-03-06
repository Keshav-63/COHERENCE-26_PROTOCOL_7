"""
Invitation Service
Business logic for managing invitations
"""

from datetime import datetime, timedelta
from typing import Optional, List, Tuple
from beanie import PydanticObjectId

from app.security.models import Invitation, InvitationStatus, TenantType
from app.security.schemas import InvitationCreate, InvitationStats
from app.security.utils import (
    generate_invitation_hash,
    generate_temporary_password,
    hash_password,
    verify_password_hash,
    get_public_key_fingerprint,
    validate_ssh_public_key
)
from app.security.services.email_service import email_service
from app.core.config import settings


class InvitationService:
    """Service for invitation management"""

    @staticmethod
    async def create_invitation(
        invitation_data: InvitationCreate,
        invited_by: str
    ) -> Tuple[Invitation, str]:
        """
        Create a new invitation and send email

        Args:
            invitation_data: Invitation creation data
            invited_by: User ID of central admin creating invitation

        Returns:
            Tuple of (Invitation object, temporary_password)
        """
        # Check if invitation already exists for this email
        existing = await Invitation.find_one(Invitation.email == invitation_data.email)
        if existing and existing.status != InvitationStatus.EXPIRED:
            raise ValueError(f"Active invitation already exists for {invitation_data.email}")

        # Generate invitation hash and temporary password
        invitation_hash = generate_invitation_hash()
        temp_password = generate_temporary_password()
        temp_password_hash = hash_password(temp_password)

        # Calculate expiry
        expires_at = datetime.utcnow() + timedelta(days=invitation_data.expires_in_days)

        # Create invitation
        invitation = Invitation(
            email=invitation_data.email,
            tenant_type=invitation_data.tenant_type,
            tenant_name=invitation_data.tenant_name,
            tenant_code=invitation_data.tenant_code,
            invitation_hash=invitation_hash,
            temporary_password=temp_password_hash,
            invited_by=invited_by,
            expires_at=expires_at,
            description=invitation_data.description,
            metadata=invitation_data.metadata
        )

        await invitation.insert()

        # Generate dashboard URL
        frontend_url = settings.FRONTEND_URL
        dashboard_url = f"{frontend_url}/admin/login?hash={invitation_hash}"

        # Send invitation email
        email_sent = await email_service.send_invitation_email(
            to_email=invitation_data.email,
            tenant_name=invitation_data.tenant_name,
            tenant_type=invitation_data.tenant_type.value,
            dashboard_url=dashboard_url,
            temporary_password=temp_password,
            expires_at=expires_at
        )

        if not email_sent:
            print(f"Warning: Failed to send invitation email to {invitation_data.email}")

        return invitation, temp_password

    @staticmethod
    async def get_invitation_by_hash(invitation_hash: str) -> Optional[Invitation]:
        """Get invitation by hash"""
        return await Invitation.find_one(Invitation.invitation_hash == invitation_hash)

    @staticmethod
    async def get_invitation_by_email(email: str) -> Optional[Invitation]:
        """Get invitation by email"""
        return await Invitation.find_one(Invitation.email == email)

    @staticmethod
    async def verify_login(
        email: str,
        temporary_password: str,
        invitation_hash: Optional[str] = None
    ) -> Optional[Invitation]:
        """
        Verify login credentials

        Args:
            email: User email
            temporary_password: Temporary password
            invitation_hash: Invitation hash (optional)

        Returns:
            Invitation if valid, None otherwise
        """
        # Get invitation - with or without hash
        if invitation_hash:
            invitation = await Invitation.find_one(
                Invitation.email == email,
                Invitation.invitation_hash == invitation_hash
            )
        else:
            invitation = await Invitation.find_one(Invitation.email == email)

        if not invitation:
            return None

        # Check if expired
        if invitation.expires_at < datetime.utcnow():
            invitation.status = InvitationStatus.EXPIRED
            await invitation.save()
            return None

        # Check if revoked
        if invitation.status == InvitationStatus.REVOKED:
            return None

        # Verify password
        if not verify_password_hash(temporary_password, invitation.temporary_password):
            return None

        return invitation

    @staticmethod
    async def mark_as_accepted(invitation_id: str) -> Invitation:
        """Mark invitation as accepted"""
        invitation = await Invitation.get(PydanticObjectId(invitation_id))
        if not invitation:
            raise ValueError("Invitation not found")

        invitation.status = InvitationStatus.ACCEPTED
        invitation.accepted_at = datetime.utcnow()
        invitation.updated_at = datetime.utcnow()
        await invitation.save()

        return invitation

    @staticmethod
    async def upload_public_key(invitation_id: str, public_key: str) -> Tuple[Invitation, str]:
        """
        Upload and validate public key

        Args:
            invitation_id: Invitation ID
            public_key: SSH public key

        Returns:
            Tuple of (Invitation, fingerprint)
        """
        invitation = await Invitation.get(PydanticObjectId(invitation_id))
        if not invitation:
            raise ValueError("Invitation not found")

        # Validate public key
        is_valid, error_msg = validate_ssh_public_key(public_key)
        if not is_valid:
            raise ValueError(error_msg)

        # Get fingerprint
        fingerprint = get_public_key_fingerprint(public_key)

        # Update invitation
        invitation.public_key = public_key
        invitation.public_key_uploaded = True
        invitation.public_key_uploaded_at = datetime.utcnow()
        invitation.public_key_fingerprint = fingerprint
        invitation.is_first_login = False
        invitation.updated_at = datetime.utcnow()

        await invitation.save()

        return invitation, fingerprint

    @staticmethod
    async def get_all_invitations(
        status: Optional[InvitationStatus] = None,
        tenant_type: Optional[TenantType] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Invitation]:
        """
        Get all invitations with optional filters

        Args:
            status: Filter by status
            tenant_type: Filter by tenant type
            skip: Number of records to skip
            limit: Maximum number of records

        Returns:
            List of invitations
        """
        query = {}

        if status:
            query['status'] = status

        if tenant_type:
            query['tenant_type'] = tenant_type

        invitations = await Invitation.find(query).skip(skip).limit(limit).to_list()
        return invitations

    @staticmethod
    async def get_invitation_stats() -> InvitationStats:
        """Get invitation statistics"""
        all_invitations = await Invitation.find_all().to_list()

        total = len(all_invitations)
        pending = len([i for i in all_invitations if i.status == InvitationStatus.PENDING])
        accepted = len([i for i in all_invitations if i.status == InvitationStatus.ACCEPTED])
        expired = len([i for i in all_invitations if i.status == InvitationStatus.EXPIRED])
        active_admins = len([i for i in all_invitations if i.public_key_uploaded])

        return InvitationStats(
            total_invitations=total,
            pending_invitations=pending,
            accepted_invitations=accepted,
            expired_invitations=expired,
            active_admins=active_admins
        )

    @staticmethod
    async def revoke_invitation(invitation_id: str) -> Invitation:
        """Revoke an invitation"""
        invitation = await Invitation.get(PydanticObjectId(invitation_id))
        if not invitation:
            raise ValueError("Invitation not found")

        invitation.status = InvitationStatus.REVOKED
        invitation.updated_at = datetime.utcnow()
        await invitation.save()

        return invitation

    @staticmethod
    async def cleanup_expired_invitations() -> int:
        """Mark expired invitations as expired"""
        now = datetime.utcnow()

        expired_invitations = await Invitation.find(
            Invitation.expires_at < now,
            Invitation.status == InvitationStatus.PENDING
        ).to_list()

        count = 0
        for invitation in expired_invitations:
            invitation.status = InvitationStatus.EXPIRED
            invitation.updated_at = now
            await invitation.save()
            count += 1

        return count


# Singleton instance
invitation_service = InvitationService()
