# Email Setup Guide - Gmail SMTP Configuration

## Current Issue

The email service is failing with error:
```
Error sending email: (535, '5.7.8 Username and Password not accepted...')
```

This means Gmail is rejecting the authentication credentials.

---

## Why Gmail Blocks Regular Passwords

Since May 2022, Gmail **no longer accepts regular account passwords** for SMTP authentication. You must use **App Passwords** instead.

---

## ✅ How to Fix - Gmail App Password Setup

### Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** (left sidebar)
3. Scroll to **Signing in to Google**
4. Click **2-Step Verification**
5. Follow the prompts to enable it (you'll need your phone)

### Step 2: Generate an App Password

1. After enabling 2-Step Verification, go to: https://myaccount.google.com/apppasswords
2. You may need to sign in again
3. Select app: **Mail**
4. Select device: **Other (Custom name)**
5. Enter name: **Budget Intelligence Platform**
6. Click **Generate**

7. **Google will show you a 16-character password** like:
   ```
   abcd efgh ijkl mnop
   ```

8. **COPY THIS PASSWORD** - you can't see it again!

### Step 3: Update .env File

Open your `.env` file and update the SMTP password:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=govgenie.info@gmail.com
SMTP_PASSWORD=abcdefghijklmnop   # <-- Paste the 16-char App Password HERE (no spaces)
FROM_EMAIL=govgenie.info@gmail.com
FROM_NAME=Budget Intelligence Platform
```

**Important:** Remove all spaces from the App Password!

### Step 4: Restart the Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
python run.py
```

### Step 5: Test Email Sending

Try creating a new invitation from the frontend, or run:

```bash
# This will show detailed logs of what's happening
python -c "from app.security.services.email_service import email_service; import asyncio; asyncio.run(email_service._send_email('test@example.com', 'Test', '<h1>Test</h1>', 'Test'))"
```

---

## 📋 Current Configuration

Your current `.env` file has:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=govgenie.info@gmail.com
SMTP_PASSWORD=aach whsw wsdr ixsl   # <-- This might be invalid or expired
FROM_EMAIL=govgenie.info@gmail.com
FROM_NAME=GovGenie Team
```

**Issues:**
1. The App Password might be invalid or expired
2. App Passwords with spaces need to be cleaned (we now auto-remove spaces in the code)

---

## 🔍 New Detailed Logging

The email service now includes comprehensive logging. You'll see:

### On Email Service Initialization:
```
================================================================================
EMAIL SERVICE CONFIGURATION
================================================================================
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: govgenie.info@gmail.com
SMTP Password: ****************
From Email: govgenie.info@gmail.com
From Name: Budget Intelligence Platform
================================================================================
```

### When Sending Email:
```
================================================================================
SENDING EMAIL
================================================================================
To: keshavdv241@gmail.com
Subject: Invitation to Budget Intelligence Platform - Maharstra gov
Creating email message...
Connecting to SMTP server: smtp.gmail.com:587
Authenticating as: govgenie.info@gmail.com
Using STARTTLS for secure connection
Password length: 16 characters
✅ Email sent successfully!
================================================================================
```

### On Authentication Error:
```
================================================================================
SMTP ERROR
================================================================================
Error Type: SMTPAuthenticationError
Error Message: (535, '5.7.8 Username and Password not accepted...')
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: govgenie.info@gmail.com

🔴 AUTHENTICATION FAILED - Possible causes:
  1. Incorrect Gmail password or App Password
  2. Gmail 'Less secure app access' is disabled
  3. 2-Step Verification not enabled (required for App Passwords)

📝 TO FIX:
  1. Enable 2-Step Verification on your Google Account
  2. Generate an App Password at: https://myaccount.google.com/apppasswords
  3. Use the App Password (16 characters) in .env file
  4. Update SMTP_PASSWORD in .env with the App Password
================================================================================
```

---

## 🔄 Alternative: Use a Different Email Service

If Gmail App Passwords don't work, consider these alternatives:

### Option 1: SendGrid (Free tier: 100 emails/day)

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
FROM_EMAIL=your_verified_email@yourdomain.com
FROM_NAME=Budget Intelligence Platform
```

1. Sign up at: https://sendgrid.com/
2. Verify your email
3. Create an API key
4. Use `apikey` as username and your API key as password

### Option 2: Mailgun (Free tier: 5,000 emails/month)

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your_domain.mailgun.org
SMTP_PASSWORD=your_mailgun_password
FROM_EMAIL=noreply@your_domain.mailgun.org
FROM_NAME=Budget Intelligence Platform
```

1. Sign up at: https://www.mailgun.com/
2. Add and verify your domain
3. Get SMTP credentials from dashboard

### Option 3: Dev Mode (No SMTP - Console Only)

For development, you can disable SMTP entirely:

```env
# Comment out or remove SMTP settings
# SMTP_HOST=
# SMTP_PORT=
# SMTP_USER=
# SMTP_PASSWORD=
```

The system will automatically print emails to the console instead of sending them.

---

## 🧪 Testing Email Configuration

### Test Script

Save this as `test_email.py`:

```python
import asyncio
from datetime import datetime, timedelta
from app.security.services.email_service import email_service

async def test_email():
    """Test email sending"""
    result = await email_service.send_invitation_email(
        to_email="your_test_email@gmail.com",
        tenant_name="Test Tenant",
        tenant_type="state_government",
        dashboard_url="http://localhost:5173/dashboard?hash=test",
        temporary_password="TestPass123",
        expires_at=datetime.utcnow() + timedelta(days=7)
    )

    if result:
        print("\n✅ Email sent successfully!")
    else:
        print("\n❌ Email failed to send. Check logs above.")

if __name__ == "__main__":
    asyncio.run(test_email())
```

Run it:
```bash
python test_email.py
```

---

## 📊 Checklist

- [ ] 2-Step Verification enabled on Google Account
- [ ] App Password generated
- [ ] App Password copied (16 characters, no spaces)
- [ ] `.env` file updated with new App Password
- [ ] Spaces removed from password
- [ ] Server restarted
- [ ] Email test successful

---

## 🆘 Still Not Working?

1. **Check the detailed logs** in your terminal when sending invitations
2. **Verify the App Password** is exactly 16 characters
3. **Try generating a new App Password**
4. **Check Gmail security settings** at https://myaccount.google.com/security
5. **Make sure the Gmail account isn't locked or restricted**

---

## Summary

The email system now has **detailed logging** that will show exactly what's happening. After you:

1. ✅ Generate a new Gmail App Password
2. ✅ Update `.env` with the password (no spaces)
3. ✅ Restart the server

You should see **detailed logs** showing either:
- ✅ Success message when email sends
- ❌ Clear error message with instructions if it fails

The logging will help you diagnose any remaining issues!
