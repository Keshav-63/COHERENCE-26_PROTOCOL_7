"""
Create Super Admin (Central Government Admin)
This script creates the first central government admin with highest permissions
"""

import asyncio
from app.core.database import connect_to_mongodb, close_mongodb_connection
from app.core.security import hash_password
from app.models.user import User

async def create_super_admin():
    """Create super admin user"""
    print("="*80)
    print("CREATE SUPER ADMIN - CENTRAL GOVERNMENT")
    print("="*80)

    await connect_to_mongodb()

    # Get admin details
    print("\nEnter Super Admin Details:")
    email = input("Email: ").strip()
    full_name = input("Full Name: ").strip()
    password = input("Password: ").strip()
    confirm_password = input("Confirm Password: ").strip()

    # Validate
    if not email or not password or not full_name:
        print("\n[ERROR] All fields are required!")
        await close_mongodb_connection()
        return

    if password != confirm_password:
        print("\n[ERROR] Passwords do not match!")
        await close_mongodb_connection()
        return

    if len(password) < 8:
        print("\n[ERROR] Password must be at least 8 characters!")
        await close_mongodb_connection()
        return

    # Check if user already exists
    existing_user = await User.find_one(User.email == email)
    if existing_user:
        print(f"\n[ERROR] User with email {email} already exists!")
        print(f"Current role: {existing_user.role}")

        # Ask if they want to upgrade to central_admin
        upgrade = input("\nUpgrade this user to central_admin? (yes/no): ").strip().lower()
        if upgrade == 'yes':
            existing_user.role = "central_admin"
            existing_user.is_active = True
            existing_user.is_verified = True
            await existing_user.save()
            print(f"\n[SUCCESS] User upgraded to central_admin!")
            print(f"  Email: {existing_user.email}")
            print(f"  Name: {existing_user.full_name}")
            print(f"  Role: {existing_user.role}")
        else:
            print("\n[CANCELLED] User not modified.")

        await close_mongodb_connection()
        return

    # Hash password
    hashed_password = hash_password(password)

    # Create super admin user
    super_admin = User(
        email=email,
        hashed_password=hashed_password,
        full_name=full_name,
        role="central_admin",
        is_active=True,
        is_verified=True
    )

    try:
        await super_admin.insert()
        print("\n" + "="*80)
        print("SUPER ADMIN CREATED SUCCESSFULLY!")
        print("="*80)
        print(f"\nAdmin Details:")
        print(f"  Email: {super_admin.email}")
        print(f"  Name: {super_admin.full_name}")
        print(f"  Role: {super_admin.role}")
        print(f"  Status: Active & Verified")
        print(f"  User ID: {super_admin.id}")
        print(f"\nPermissions:")
        print(f"  [OK] Full access to all budget data")
        print(f"  [OK] Manage all ministries and schemes")
        print(f"  [OK] View analytics and reports")
        print(f"  [OK] Manage users and permissions")
        print(f"  [OK] Access to anomaly detection")
        print(f"  [OK] Full CRUD operations")

        print(f"\nYou can now login with:")
        print(f"  Email: {super_admin.email}")
        print(f"  Password: [the password you entered]")

    except Exception as e:
        print(f"\n[ERROR] Failed to create super admin: {str(e)}")

    await close_mongodb_connection()
    print("\n" + "="*80)


async def create_default_super_admin():
    """Create default super admin without prompts (for automation)"""
    print("="*80)
    print("CREATE DEFAULT SUPER ADMIN")
    print("="*80)

    await connect_to_mongodb()

    # Default credentials
    email = "admin@gov.in"
    password = "Admin123"
    full_name = "Central Government Administrator"

    # Check if user already exists
    existing_user = await User.find_one(User.email == email)
    if existing_user:
        print(f"\n[INFO] Super admin already exists!")
        print(f"  Email: {existing_user.email}")
        print(f"  Name: {existing_user.full_name}")
        print(f"  Role: {existing_user.role}")

        if existing_user.role != "central_admin":
            existing_user.role = "central_admin"
            existing_user.is_active = True
            existing_user.is_verified = True
            await existing_user.save()
            print(f"\n[SUCCESS] User upgraded to central_admin!")

        await close_mongodb_connection()
        return

    # Hash password
    hashed_password = hash_password(password)

    # Create super admin user
    super_admin = User(
        email=email,
        hashed_password=hashed_password,
        full_name=full_name,
        role="central_admin",
        is_active=True,
        is_verified=True
    )

    try:
        await super_admin.insert()
        print("\n" + "="*80)
        print("DEFAULT SUPER ADMIN CREATED!")
        print("="*80)
        print(f"\nLogin Credentials:")
        print(f"  Email: {email}")
        print(f"  Password: {password}")
        print(f"\n[WARNING] IMPORTANT: Change the password after first login!")

    except Exception as e:
        print(f"\n[ERROR] Failed to create super admin: {str(e)}")

    await close_mongodb_connection()
    print("\n" + "="*80)


if __name__ == "__main__":
    import sys

    print("\nSuper Admin Creation Options:")
    print("1. Create with custom credentials (interactive)")
    print("2. Create with default credentials (admin@gov.in / Admin@12345)")

    choice = input("\nSelect option (1/2): ").strip()

    if choice == "1":
        asyncio.run(create_super_admin())
    elif choice == "2":
        asyncio.run(create_default_super_admin())
    else:
        print("\n[ERROR] Invalid choice!")
