# Complete Testing Guide - Budget Intelligence Platform

Step-by-step guide to test all functionality of the application.

---

## 🚀 Step 1: Start the Application

```bash
# Make sure you're in the project directory
cd C:\Users\Keshav suthar\Desktop\Coherence-project

# Activate virtual environment
.\venv\Scripts\Activate

# Start the server
python run.py
```

**Expected Output:**
```
INFO:     Will watch for changes in these directories: ['C:\\Users\\Keshav suthar\\Desktop\\Coherence-project']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
Connected to MongoDB: coherence_db
```

**Important URLs:**
- API Root: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 📊 Step 2: Explore Swagger UI

Open your browser and go to: **http://localhost:8000/docs**

You'll see all API endpoints organized by tags:
- **Root** - Health checks
- **Authentication** - Google OAuth
- **Central Admin - Invitations** - Invitation management
- **Admin Authentication** - State/minister admin login

---

## 🔐 Step 3: Test Google OAuth (Central Admin Access)

### Option A: Using Browser (Recommended)

1. **Get Login URL**
   - Go to Swagger UI: http://localhost:8000/docs
   - Find `GET /api/v1/auth/google/login`
   - Click "Try it out" → "Execute"
   - Copy the `authorization_url` from response

2. **Login with Google**
   - Paste the URL in browser
   - Sign in with your Google account
   - You'll be redirected back with a code in URL

3. **Exchange Code for Tokens**
   - In Swagger UI, find `POST /api/v1/auth/google/callback`
   - Click "Try it out"
   - Paste the `code` from URL
   - Click "Execute"
   - **SAVE THE TOKENS!** Copy `access_token` and `refresh_token`

### Option B: Using cURL

```bash
# 1. Get authorization URL
curl http://localhost:8000/api/v1/auth/google/login

# 2. Open the URL in browser, sign in, get code from redirect

# 3. Exchange code for tokens
curl -X POST "http://localhost:8000/api/v1/auth/google/callback" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "YOUR_CODE_FROM_GOOGLE"
  }'
```

**Response (Save These!):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "your-email@gmail.com",
    "full_name": "Your Name",
    ...
  }
}
```

---

## 👨‍💼 Step 4: Test Central Admin - Create Invitation

Now that you're authenticated as a central admin, you can create invitations.

### Using Swagger UI:

1. **Authorize in Swagger**
   - Click the green 🔓 "Authorize" button at top
   - Paste your `access_token`
   - Click "Authorize"

2. **Create Invitation**
   - Find `POST /api/v1/security/central/invitations/`
   - Click "Try it out"
   - Edit the request body:

```json
{
  "email": "maharashtra.admin@gov.in",
  "tenant_type": "state_government",
  "tenant_name": "Maharashtra State Government",
  "tenant_code": "MH-GOV-2024",
  "description": "Maharashtra state budget administrator",
  "expires_in_days": 7
}
```

3. Click "Execute"

**Expected Response:**
```json
{
  "id": "507f1f77bcf86cd799439012",
  "email": "maharashtra.admin@gov.in",
  "tenant_name": "Maharashtra State Government",
  "tenant_code": "MH-GOV-2024",
  "dashboard_url": "http://localhost:3000/admin/login?hash=a1b2c3d4e5f6789...",
  "status": "pending",
  "invited_at": "2024-03-06T10:30:00Z",
  "expires_at": "2024-03-13T10:30:00Z",
  "public_key_uploaded": false
}
```

**Check Console Output:**
Since SMTP is not configured, you'll see the email printed in console:
```
================================================================================
📧 EMAIL (SMTP NOT CONFIGURED - DEV MODE)
================================================================================
To: maharashtra.admin@gov.in
Subject: Invitation to Budget Intelligence Platform - Maharashtra State Government
--------------------------------------------------------------------------------
Welcome, Maharashtra State Government!

Email: maharashtra.admin@gov.in
Temporary Password: Xj9#kL2@pQ4$mN7%
Dashboard URL: http://localhost:3000/admin/login?hash=a1b2c3d4e5f6789...
...
================================================================================
```

**SAVE THESE:**
- ✅ `dashboard_url` (contains invitation hash)
- ✅ Temporary password from console
- ✅ Email address

### Using cURL:

```bash
curl -X POST "http://localhost:8000/api/v1/security/central/invitations/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maharashtra.admin@gov.in",
    "tenant_type": "state_government",
    "tenant_name": "Maharashtra State Government",
    "tenant_code": "MH-GOV-2024",
    "description": "Maharashtra state budget administrator",
    "expires_in_days": 7
  }'
```

---

## 📋 Step 5: Test Other Central Admin Endpoints

### List All Invitations

**Swagger UI:**
- `GET /api/v1/security/central/invitations/`
- Click "Try it out" → "Execute"

**cURL:**
```bash
curl "http://localhost:8000/api/v1/security/central/invitations/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Invitation Statistics

**Swagger UI:**
- `GET /api/v1/security/central/invitations/stats`
- Click "Try it out" → "Execute"

**cURL:**
```bash
curl "http://localhost:8000/api/v1/security/central/invitations/stats" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "total_invitations": 1,
  "pending_invitations": 1,
  "accepted_invitations": 0,
  "expired_invitations": 0,
  "active_admins": 0
}
```

---

## 🔑 Step 6: Test State Admin Login (First Time)

Now simulate the state admin receiving the invitation and logging in.

### Login with Temporary Password

Extract from invitation:
- `email`: maharashtra.admin@gov.in
- `temporary_password`: From console (e.g., "Xj9#kL2@pQ4$mN7%")
- `invitation_hash`: From dashboard_url (the part after `hash=`)

**Swagger UI:**
- Scroll to **Admin Authentication** section
- Find `POST /api/v1/security/admin/login`
- Click "Try it out"
- Enter:

```json
{
  "email": "maharashtra.admin@gov.in",
  "temporary_password": "Xj9#kL2@pQ4$mN7%",
  "invitation_hash": "a1b2c3d4e5f6789..."
}
```

- Click "Execute"

**Response (Save Admin Tokens!):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800,
  "tenant_code": "MH-GOV-2024",
  "tenant_name": "Maharashtra State Government",
  "tenant_type": "state_government",
  "requires_public_key": true,
  "message": "Login successful. Please upload your public key to access the system."
}
```

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/security/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maharashtra.admin@gov.in",
    "temporary_password": "Xj9#kL2@pQ4$mN7%",
    "invitation_hash": "a1b2c3d4e5f6789..."
  }'
```

---

## 🔐 Step 7: Generate SSH Keys (State Admin)

The state admin needs to generate SSH keys for signing requests.

**Open a new terminal/PowerShell:**

```bash
# Generate Ed25519 key (recommended)
ssh-keygen -t ed25519 -C "maharashtra.admin@gov.in"

# Press Enter for default location (~/.ssh/id_ed25519)
# Press Enter twice for no passphrase (for testing)
```

**Output:**
```
Generating public/private ed25519 key pair.
Enter file in which to save the key (C:\Users\YOUR_NAME/.ssh/id_ed25519):
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in C:\Users\YOUR_NAME/.ssh/id_ed25519
Your public key has been saved in C:\Users\YOUR_NAME/.ssh/id_ed25519.pub
```

**Get your PUBLIC key:**
```bash
# Windows PowerShell
cat ~/.ssh/id_ed25519.pub

# Or
type C:\Users\YOUR_NAME\.ssh\id_ed25519.pub
```

**Copy the entire output** (looks like):
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILx... maharashtra.admin@gov.in
```

---

## 📤 Step 8: Upload Public Key

**Swagger UI:**
- Re-authorize with **admin access_token** (from Step 6)
- Click 🔓 Authorize, paste admin token
- Find `POST /api/v1/security/admin/upload-public-key`
- Click "Try it out"
- Paste your public key:

```json
{
  "public_key": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILx... maharashtra.admin@gov.in"
}
```

- Click "Execute"

**Response:**
```json
{
  "success": true,
  "fingerprint": "SHA256:7d:3e:9f:1a:2b:4c:5d:6e:7f:8a:9b:0c:1d:2e:3f:4a",
  "message": "Public key uploaded successfully. You can now make signed requests.",
  "uploaded_at": "2024-03-06T11:15:00Z"
}
```

**cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/security/admin/upload-public-key" \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "public_key": "ssh-ed25519 AAAAC3Nza... maharashtra.admin@gov.in"
  }'
```

---

## ✍️ Step 9: Test Request Signature

Now test if signature verification works.

### Create Test Signature

**PowerShell:**
```powershell
# Set message
$MESSAGE = "test message"

# Sign it (replace path with your actual key path)
$SIGNATURE = echo -n "$MESSAGE" | openssl dgst -sha256 -sign "$HOME\.ssh\id_ed25519" | openssl base64 -A

# For Windows, if above doesn't work, use Git Bash or WSL
```

**Git Bash / WSL:**
```bash
MESSAGE="test message"
SIGNATURE=$(echo -n "$MESSAGE" | openssl dgst -sha256 -sign ~/.ssh/id_ed25519 | base64 -w 0)
echo $SIGNATURE
```

### Test Signature Endpoint

**Swagger UI:**
- Find `POST /api/v1/security/admin/test-signature`
- Click "Try it out"
- Enter:

```json
{
  "message": "test message",
  "signature": "PASTE_YOUR_SIGNATURE_HERE"
}
```

- Click "Execute"

**Expected Response:**
```json
{
  "verified": true,
  "message": "Signature verified successfully!",
  "fingerprint": "SHA256:7d:3e:9f:1a:2b:4c:5d:6e:7f:8a:9b:0c:1d:2e:3f:4a"
}
```

---

## 📊 Step 10: Check Admin Profile

**Swagger UI:**
- Find `GET /api/v1/security/admin/profile`
- Click "Try it out" → "Execute"

**Response:**
```json
{
  "email": "maharashtra.admin@gov.in",
  "tenant_code": "MH-GOV-2024",
  "tenant_name": "Maharashtra State Government",
  "tenant_type": "state_government",
  "public_key_uploaded": true,
  "public_key_fingerprint": "SHA256:7d:3e:9f:1a:2b...",
  "is_active": true,
  "created_at": "2024-03-06T11:15:00Z",
  "last_authenticated_at": "2024-03-06T11:15:00Z"
}
```

---

## 🧪 Step 11: Test Protected Endpoints with Signature

For future endpoints that require signature verification, here's how to call them:

### Python Example

```python
import base64
import json
import requests
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend

# Load private key
with open('C:/Users/YOUR_NAME/.ssh/id_ed25519', 'rb') as f:
    private_key = serialization.load_ssh_private_key(
        f.read(),
        password=None,
        backend=default_backend()
    )

# Request data
url = "http://localhost:8000/api/v1/your-protected-endpoint"
data = {"key": "value"}
body = json.dumps(data)

# Sign the request
signature = private_key.sign(body.encode('utf-8'))
signature_b64 = base64.b64encode(signature).decode('utf-8')

# Make request
headers = {
    "Authorization": "Bearer YOUR_ADMIN_ACCESS_TOKEN",
    "X-Signature": signature_b64,
    "Content-Type": "application/json"
}

response = requests.post(url, headers=headers, json=data)
print(response.json())
```

---

## 📋 Complete Test Checklist

- [ ] Start application successfully
- [ ] Access Swagger UI
- [ ] Test Google OAuth login (Central Admin)
- [ ] Get user profile (`/api/v1/auth/me`)
- [ ] Create invitation (Central Admin)
- [ ] List invitations
- [ ] Get invitation stats
- [ ] Login with temporary password (State Admin)
- [ ] Generate SSH keys
- [ ] Upload public key
- [ ] Test signature verification
- [ ] Get admin profile
- [ ] Refresh token (`/api/v1/auth/refresh`)
- [ ] Logout (`/api/v1/auth/logout`)

---

## 🐛 Common Issues & Solutions

### Issue: "Redirect URI mismatch"
**Solution:** Add `http://localhost:8000/api/v1/auth/google/callback` to Google Console

### Issue: "Invalid signature"
**Solution:**
- Make sure you're using PRIVATE key to sign (not .pub)
- Message must exactly match request body
- Signature must be base64 encoded

### Issue: "No public key uploaded"
**Solution:** Upload public key first using `/admin/upload-public-key`

### Issue: "Invalid token"
**Solution:** Token expired, use refresh token or login again

### Issue: Email not received
**Solution:** In dev mode, emails print to console (check terminal output)

---

## 🎯 Quick Command Reference

```bash
# Start server
python run.py

# Generate SSH key
ssh-keygen -t ed25519 -C "your@email.com"

# View public key
cat ~/.ssh/id_ed25519.pub

# Sign a message (Git Bash)
echo -n "test message" | openssl dgst -sha256 -sign ~/.ssh/id_ed25519 | base64 -w 0

# Test health
curl http://localhost:8000/health
```

---

## 📚 Additional Resources

- **API Docs**: http://localhost:8000/docs
- **Security Guide**: [SECURITY_MODULE_GUIDE.md](SECURITY_MODULE_GUIDE.md)
- **Quick Start**: [SECURITY_QUICK_START.md](SECURITY_QUICK_START.md)
- **Python Examples**: [examples/sign_request_example.py](examples/sign_request_example.py)

---

**🎉 Happy Testing!**

If you encounter any issues, check the console output for detailed error messages.
