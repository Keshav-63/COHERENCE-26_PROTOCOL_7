"""
User Service
Business logic for user operations with MongoDB
"""

from datetime import datetime
from typing import Optional
from beanie import PydanticObjectId

from app.models.user import User
from app.schemas.user import UserCreate, UserRegister
from app.core.security import hash_password, verify_password


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
            hashed_password=user_data.hashed_password,
            is_verified=user_data.is_verified,
            role=user_data.role,
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        await user.insert()
        return user

    @staticmethod
    async def register_user(user_data: UserRegister) -> User:
        """
        Register a new user with email and password

        Args:
            user_data: User registration data

        Returns:
            Created User object
        """
        # Hash password
        hashed_pwd = hash_password(user_data.password)

        # Create user
        user_create = UserCreate(
            email=user_data.email,
            full_name=user_data.full_name,
            hashed_password=hashed_pwd,
            is_verified=False,
            role="user"
        )

        return await UserService.create_user(user_create)

    @staticmethod
    async def authenticate_user(email: str, password: str) -> Optional[User]:
        """
        Authenticate user with email and password

        Args:
            email: User email
            password: Plain text password

        Returns:
            User object if authentication successful, None otherwise
        """
        user = await UserService.get_user_by_email(email)

        if not user:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        # Update last login
        user.last_login = datetime.utcnow()
        user.updated_at = datetime.utcnow()
        await user.save()

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


# Singleton instance
user_service = UserService()
