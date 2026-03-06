"""
Get temporary password for invitation
"""

import asyncio
from app.core.database import connect_to_mongodb, close_mongodb_connection
from app.security.models.invitation import Invitation
from app.core.security import verify_password

async def get_temp_password():
    """Get the temporary password"""
    print("="*80)
    print("INVITATION LOGIN CREDENTIALS")
    print("="*80)

    await connect_to_mongodb()

    # Get the invitation
    invitation = await Invitation.find(
        Invitation.email == "keshavdv241@gmail.com"
    ).sort("-created_at").first_or_none()

    if invitation:
        print(f"\n[SUCCESS] Invitation Found!")
        print(f"\nLogin URL:")
        print(f"http://localhost:5173/admin/login?hash={invitation.invitation_hash}")

        print(f"\n{'='*80}")
        print("CREDENTIALS FOR FRONTEND LOGIN")
        print("="*80)
        print(f"\nEmail: {invitation.email}")
        print(f"Invitation Hash: {invitation.invitation_hash}")
        print(f"\n⚠️ Temporary Password: [HASHED IN DATABASE]")
        print(f"\nThe temporary password is hashed and stored as:")
        print(f"{invitation.temporary_password[:50]}...")

        print(f"\n{'='*80}")
        print("API LOGIN REQUEST")
        print("="*80)
        print(f"\nPOST /api/v1/security/admin/login")
        print(f"\nRequest Body:")
        print(f"{{")
        print(f'  "email": "{invitation.email}",')
        print(f'  "temporary_password": "[CHECK INVITATION EMAIL OR LOGS]",')
        print(f'  "invitation_hash": "{invitation.invitation_hash}"')
        print(f"}}")

        print(f"\n{'='*80}")
        print("IMPORTANT NOTES")
        print("="*80)
        print(f"\n1. The temporary password was displayed when the invitation was created")
        print(f"2. It should have been in the server logs or shown in the UI")
        print(f"3. The password is hashed in database, so we can't retrieve the plain text")
        print(f"4. If you don't have the password, you need to create a new invitation")

        print(f"\n{'='*80}")
        print("AUTHENTICATION FLOW")
        print("="*80)
        print(f"\n1. POST /api/v1/security/admin/login with credentials")
        print(f"2. Receive JWT access token and refresh token")
        print(f"3. Upload SSH public key: POST /api/v1/security/admin/upload-public-key")
        print(f"4. Access secured endpoints with X-Signature header")

    else:
        print(f"\n[ERROR] No invitation found!")

    await close_mongodb_connection()
    print("\n" + "="*80)

if __name__ == "__main__":
    asyncio.run(get_temp_password())
