"""
Reset invitation temporary password
"""

import asyncio
from app.core.database import connect_to_mongodb, close_mongodb_connection
from app.security.models.invitation import Invitation
from app.core.security import hash_password

async def reset_password():
    """Reset temporary password for invitation"""
    print("="*80)
    print("RESET INVITATION PASSWORD")
    print("="*80)

    await connect_to_mongodb()

    # Get the invitation
    invitation = await Invitation.find(
        Invitation.email == "keshavdv241@gmail.com"
    ).sort("-created_at").first_or_none()

    if not invitation:
        print("\n[ERROR] Invitation not found!")
        await close_mongodb_connection()
        return

    # New temporary password
    new_password = "TempPass123"

    # Hash it
    hashed = hash_password(new_password)

    # Update invitation
    invitation.temporary_password = hashed
    await invitation.save()

    print(f"\n[SUCCESS] Temporary password reset!")
    print(f"\n{'='*80}")
    print("NEW LOGIN CREDENTIALS")
    print("="*80)
    print(f"\nEmail: {invitation.email}")
    print(f"Temporary Password: {new_password}")
    print(f"Invitation Hash: {invitation.invitation_hash}")

    print(f"\n{'='*80}")
    print("LOGIN URL")
    print("="*80)
    print(f"\nhttp://localhost:5173/admin/login?hash={invitation.invitation_hash}")

    print(f"\n{'='*80}")
    print("API REQUEST")
    print("="*80)
    print(f"\nPOST http://localhost:8000/api/v1/security/admin/login")
    print(f"\nRequest Body:")
    print(f"{{")
    print(f'  "email": "{invitation.email}",')
    print(f'  "temporary_password": "{new_password}",')
    print(f'  "invitation_hash": "{invitation.invitation_hash}"')
    print(f"}}")

    print(f"\n{'='*80}")
    print("NEXT STEPS")
    print("="*80)
    print(f"\n1. Login with the credentials above")
    print(f"2. You'll receive JWT access and refresh tokens")
    print(f"3. Upload your SSH public key")
    print(f"4. Start making authenticated requests")

    await close_mongodb_connection()
    print("\n" + "="*80)

if __name__ == "__main__":
    asyncio.run(reset_password())
