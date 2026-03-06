"""
User Service
Business logic for user operations with MongoDB
"""

from datetime import datetime
from typing import Optional
from beanie import PydanticObjectId

from app.models.user import User
from app.schemas.user import UserCreate


class UserService:
    """Service for user-related database operations with MongoDB"""

    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[User]:
        """
        Get user by ID

        Args:
            user_id: User ID (MongoDB ObjectId as string)

        Returns:
            User object or None if not found
        """
        try:
            return await User.get(PydanticObjectId(user_id))
        except Exception:
            return None

    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]:
        """
        Get user by email address

        Args:
            email: User email address

        Returns:
            User object or None if not found
        """
        return await User.find_one(User.email == email)

    @staticmethod
    async def get_user_by_google_id(google_id: str) -> Optional[User]:
        """
        Get user by Google ID

        Args:
            google_id: Google user ID

        Returns:
            User object or None if not found
        """
        return await User.find_one(User.google_id == google_id)

    @staticmethod
    async def create_user(user_data: UserCreate) -> User:
        """
        Create a new user

        Args:
            user_data: User creation data

        Returns:
            Created User object
        """
        user = User(
            email=user_data.email,
            full_name=user_data.full_name,
            profile_picture=user_data.profile_picture,
            google_id=user_data.google_id,
            oauth_provider=user_data.oauth_provider,
            is_verified=user_data.is_verified,
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        await user.insert()
        return user

    @staticmethod
    async def update_last_login(user_id: str) -> None:
        """
        Update user's last login timestamp

        Args:
            user_id: User ID (MongoDB ObjectId as string)
        """
        try:
            user = await User.get(PydanticObjectId(user_id))
            if user:
                user.last_login = datetime.utcnow()
                user.updated_at = datetime.utcnow()
                await user.save()
        except Exception:
            pass

    @staticmethod
    async def get_or_create_user(
        google_id: str,
        email: str,
        full_name: Optional[str] = None,
        profile_picture: Optional[str] = None
    ) -> tuple[User, bool]:
        """
        Get existing user or create new one

        Args:
            google_id: Google user ID
            email: User email
            full_name: Optional full name
            profile_picture: Optional profile picture URL

        Returns:
            Tuple of (User object, is_created boolean)
        """
        # Try to find existing user by Google ID
        user = await UserService.get_user_by_google_id(google_id)

        if user:
            # Update last login
            user.last_login = datetime.utcnow()
            user.updated_at = datetime.utcnow()
            await user.save()
            return user, False

        # Try to find by email (in case user exists from different OAuth)
        user = await UserService.get_user_by_email(email)

        if user:
            # Update Google ID and last login
            user.google_id = google_id
            user.last_login = datetime.utcnow()
            user.updated_at = datetime.utcnow()
            await user.save()
            return user, False

        # Create new user
        user_data = UserCreate(
            email=email,
            full_name=full_name,
            profile_picture=profile_picture,
            google_id=google_id,
            oauth_provider="google",
            is_verified=True
        )

        new_user = await UserService.create_user(user_data)

        # Update last login for new user
        new_user.last_login = datetime.utcnow()
        await new_user.save()

        return new_user, True


# Singleton instance
user_service = UserService()
