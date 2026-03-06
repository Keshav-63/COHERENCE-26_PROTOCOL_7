"""
Verify if super admin was created
"""

import asyncio
from app.core.database import connect_to_mongodb, close_mongodb_connection
from app.models.user import User

async def verify_admin():
    """Verify admin exists"""
    print("="*80)
    print("VERIFYING SUPER ADMIN")
    print("="*80)

    await connect_to_mongodb()

    # Find admin
    admin = await User.find_one(User.email == "admin@gov.in")

    if admin:
        print("\n[SUCCESS] Super Admin Found!")
        print(f"\nDetails:")
        print(f"  Email: {admin.email}")
        print(f"  Name: {admin.full_name}")
        print(f"  Role: {admin.role}")
        print(f"  Active: {admin.is_active}")
        print(f"  Verified: {admin.is_verified}")
        print(f"  User ID: {admin.id}")
        print(f"\nLogin Credentials:")
        print(f"  Email: admin@gov.in")
        print(f"  Password: Admin123")
    else:
        print("\n[ERROR] Super Admin not found!")
        print("Run: python create_super_admin.py")

    await close_mongodb_connection()
    print("\n" + "="*80)

if __name__ == "__main__":
    asyncio.run(verify_admin())
