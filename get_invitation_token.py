"""
Get invitation token for manual registration
"""

import asyncio
from app.core.database import connect_to_mongodb, close_mongodb_connection
from app.security.models.invitation import Invitation

async def get_invitation():
    """Get the invitation token"""
    print("="*80)
    print("GETTING INVITATION TOKEN")
    print("="*80)

    await connect_to_mongodb()

    # Get the most recent invitation
    invitation = await Invitation.find(
        Invitation.email == "keshavdv241@gmail.com"
    ).sort("-created_at").first_or_none()

    if invitation:
        print(f"\n[SUCCESS] Invitation Found!")
        print(f"\nInvitation Details:")
        print(f"  Email: {invitation.email}")
        print(f"  Invitation Hash: {invitation.invitation_hash}")
        print(f"  Tenant Type: {invitation.tenant_type}")
        print(f"  Tenant Name: {invitation.tenant_name}")
        print(f"  Tenant Code: {invitation.tenant_code}")
        print(f"  Status: {invitation.status}")
        print(f"  Invited By: {invitation.invited_by}")
        print(f"  Expires At: {invitation.expires_at}")
        print(f"  Is First Login: {invitation.is_first_login}")

        print(f"\n{'='*80}")
        print("REGISTRATION/LOGIN URL")
        print("="*80)

        # Dashboard URL with invitation hash
        dashboard_url = f"http://localhost:5173/dashboard?token={invitation.invitation_hash}"
        print(f"\nDashboard URL:")
        print(f"{dashboard_url}")

        print(f"\n{'='*80}")
        print("HOW TO LOGIN")
        print("="*80)
        print(f"\n1. The invitation was created for: {invitation.email}")
        print(f"2. Use the invitation hash as access token")
        print(f"3. The system is using temporary password authentication")

        print(f"\n{'='*80}")
        print("IMPORTANT")
        print("="*80)
        print(f"\nThis system uses invitation_hash for authentication, not email/password.")
        print(f"The frontend should accept the invitation hash and authenticate with it.")

    else:
        print(f"\n[ERROR] No invitation found for keshavdv241@gmail.com")

    await close_mongodb_connection()
    print("\n" + "="*80)

if __name__ == "__main__":
    asyncio.run(get_invitation())
