"""
Test Email Sending
Quick test to verify SMTP configuration is working
"""

import asyncio
from datetime import datetime, timedelta
import logging

# Setup logging to see detailed output
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

from app.security.services.email_service import email_service

async def test_email():
    """Test email sending with detailed logging"""
    print("\n" + "="*80)
    print("TESTING EMAIL CONFIGURATION")
    print("="*80)

    # Test email details
    test_email_address = input("\nEnter email address to test with: ").strip()

    if not test_email_address:
        test_email_address = "keshavdv241@gmail.com"
        print(f"Using default: {test_email_address}")

    print(f"\nSending test invitation email to: {test_email_address}")
    print("This will test your SMTP configuration...")
    print("")

    # Send test email
    result = await email_service.send_invitation_email(
        to_email=test_email_address,
        tenant_name="Test State Government",
        tenant_type="state_government",
        dashboard_url="http://localhost:5173/dashboard?hash=test-hash-123",
        temporary_password="TestPassword123",
        expires_at=datetime.utcnow() + timedelta(days=7)
    )

    print("\n" + "="*80)
    if result:
        print("✅ EMAIL SENT SUCCESSFULLY!")
        print("="*80)
        print(f"\nCheck {test_email_address} for the invitation email.")
        print("If you don't see it, check your spam folder.")
    else:
        print("❌ EMAIL FAILED TO SEND!")
        print("="*80)
        print("\nCheck the error logs above for details.")
        print("\nCommon issues:")
        print("  1. Invalid Gmail App Password")
        print("  2. 2-Step Verification not enabled")
        print("  3. SMTP credentials not configured")
        print("\nSee EMAIL_SETUP_GUIDE.md for detailed instructions.")

    print("\n" + "="*80)

if __name__ == "__main__":
    asyncio.run(test_email())
