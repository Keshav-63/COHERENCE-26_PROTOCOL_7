"""
Admin Service
Business logic for admin session management
"""

from datetime import datetime
from typing import Optional
from beanie import PydanticObjectId

from app.security.models import AdminSession


class AdminService:
    """Service for admin session management"""

    @staticmethod
    async def create_or_update_session(
        email: str,
        tenant_code: str,
        tenant_name: str,
        tenant_type: str,
        public_key: str,
        public_key_fingerprint: str
    ) -> AdminSession:
        """
        Create or update admin session

        Args:
            email: Admin email
            tenant_code: Tenant code
            tenant_name: Tenant name
            tenant_type: Tenant type
            public_key: Public key
            public_key_fingerprint: Public key fingerprint

        Returns:
            AdminSession object
        """
        # Check if session exists
        session = await AdminSession.find_one(
            AdminSession.email == email,
            AdminSession.tenant_code == tenant_code
        )

        if session:
            # Update existing session
            session.public_key = public_key
            session.public_key_fingerprint = public_key_fingerprint
            session.last_authenticated_at = datetime.utcnow()
            session.updated_at = datetime.utcnow()
            await session.save()
        else:
            # Create new session
            session = AdminSession(
                email=email,
                tenant_code=tenant_code,
                tenant_name=tenant_name,
                tenant_type=tenant_type,
                public_key=public_key,
                public_key_fingerprint=public_key_fingerprint
            )
            await session.insert()

        return session

    @staticmethod
    async def get_session_by_email(email: str) -> Optional[AdminSession]:
        """Get admin session by email"""
        return await AdminSession.find_one(
            AdminSession.email == email,
            AdminSession.is_active == True
        )

    @staticmethod
    async def get_session_by_tenant(tenant_code: str) -> Optional[AdminSession]:
        """Get admin session by tenant code"""
        return await AdminSession.find_one(
            AdminSession.tenant_code == tenant_code,
            AdminSession.is_active == True
        )

    @staticmethod
    async def update_last_request(session_id: str) -> None:
        """Update last request timestamp"""
        session = await AdminSession.get(PydanticObjectId(session_id))
        if session:
            session.last_request_at = datetime.utcnow()
            session.request_count += 1
            session.updated_at = datetime.utcnow()
            await session.save()

    @staticmethod
    async def increment_failed_signature(session_id: str) -> int:
        """
        Increment failed signature attempts

        Args:
            session_id: Session ID

        Returns:
            New failed attempt count
        """
        session = await AdminSession.get(PydanticObjectId(session_id))
        if session:
            session.failed_signature_attempts += 1
            session.updated_at = datetime.utcnow()

            # Lock account after 5 failed attempts
            if session.failed_signature_attempts >= 5:
                session.is_locked = True
                session.locked_at = datetime.utcnow()
                session.locked_reason = "Too many failed signature verification attempts"

            await session.save()
            return session.failed_signature_attempts

        return 0

    @staticmethod
    async def reset_failed_signature(session_id: str) -> None:
        """Reset failed signature attempts"""
        session = await AdminSession.get(PydanticObjectId(session_id))
        if session:
            session.failed_signature_attempts = 0
            session.updated_at = datetime.utcnow()
            await session.save()

    @staticmethod
    async def lock_session(session_id: str, reason: str) -> None:
        """Lock admin session"""
        session = await AdminSession.get(PydanticObjectId(session_id))
        if session:
            session.is_locked = True
            session.locked_at = datetime.utcnow()
            session.locked_reason = reason
            session.updated_at = datetime.utcnow()
            await session.save()

    @staticmethod
    async def unlock_session(session_id: str) -> None:
        """Unlock admin session"""
        session = await AdminSession.get(PydanticObjectId(session_id))
        if session:
            session.is_locked = False
            session.locked_at = None
            session.locked_reason = None
            session.failed_signature_attempts = 0
            session.updated_at = datetime.utcnow()
            await session.save()

    @staticmethod
    async def deactivate_session(session_id: str) -> None:
        """Deactivate admin session"""
        session = await AdminSession.get(PydanticObjectId(session_id))
        if session:
            session.is_active = False
            session.updated_at = datetime.utcnow()
            await session.save()


# Singleton instance
admin_service = AdminService()
