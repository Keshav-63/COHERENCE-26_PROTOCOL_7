"""
Script to create a central admin user
Run this script to create the first central admin user for the system
"""

import asyncio
from app.core.database import init_db
from app.models.user import User
from app.core.security import hash_password


async def create_central_admin():
    """Create a central admin user"""

    # Initialize database
    await init_db()

    # Check if central admin already exists
    admin_email = "admin@gov.in"
    existing_admin = await User.find_one(User.email == admin_email)

    if existing_admin:
        print(f"Central admin user already exists: {admin_email}")
        print(f"Role: {existing_admin.role}")
        return

    # Create central admin
    admin_password = "Admin@123"  # Change this to a secure password
    hashed_password = hash_password(admin_password)

    admin_user = User(
        email=admin_email,
        hashed_password=hashed_password,
        full_name="Central Administrator",
        role="central_admin",
        is_active=True,
        is_verified=True
    )

    await admin_user.insert()

    print("\n" + "="*80)
    print("CENTRAL ADMIN USER CREATED SUCCESSFULLY!")
    print("="*80)
    print(f"Email: {admin_email}")
    print(f"Password: {admin_password}")
    print(f"Role: {admin_user.role}")
    print("\nIMPORTANT: Change the password after first login!")
    print("="*80 + "\n")


if __name__ == "__main__":
    asyncio.run(create_central_admin())
