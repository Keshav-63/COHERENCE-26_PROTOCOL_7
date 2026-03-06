## Budget Intelligence Platform - Security Module Guide

Complete guide for Phase 1: Multi-Tenancy Security with Public-Private Key Authentication

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Security Flow](#security-flow)
4. [Setup Guide](#setup-guide)
5. [Central Admin Guide](#central-admin-guide)
6. [State/Minister Admin Guide](#stateminister-admin-guide)
7. [Request Signing](#request-signing)
8. [API Reference](#api-reference)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### Purpose
The security module implements a robust multi-tenancy system for the National Budget Intelligence Platform with:

- **Invitation-based access control**
- **Public-private key cryptography**
- **Request signature verification**
- **Hierarchical permissions** (Central → State → Department)

### Key Features

✅ **Multi-Tenancy**: Isolated data access per tenant (state/ministry)
✅ **Invitation System**: Central govt invites state/minister admins via email
✅ **SSH Key Authentication**: All requests signed with private keys
✅ **Temporary Passwords**: Secure one-time login credentials
✅ **Dashboard URLs**: Unique hashed URLs for each invitation
✅ **Automated Emails**: Invitation emails with login instructions

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CENTRAL GOVERNMENT                           │
│  - Highest authority                                            │
│  - Creates invitations                                          │
│  - Manages all tenants                                          │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ Sends Invitation
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│               STATE/MINISTER ADMIN                              │
│  1. Receives email with dashboard URL + temp password          │
│  2. Logs in via unique URL                                     │
│  3. Generates SSH keys (public + private)                      │
│  4. Uploads PUBLIC key to dashboard                            │
│  5. Signs all requests with PRIVATE key                        │
└─────────────────────────────────────────────────────────────────┘
                       │
                       │ API Requests (Signed)
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND VERIFICATION                         │
│  1. Verifies JWT token                                         │
│  2. Retrieves admin's public key from database                 │
│  3. Verifies request signature                                 │
│  4. Grants access if signature valid                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Flow

### Phase 1: Invitation

```
Central Admin                    Email Server                  State Admin
     │                                │                              │
     │ 1. Create Invitation           │                              │
     ├───────────────────────────────>│                              │
     │   (email, tenant details)      │                              │
     │                                │                              │
     │                                │ 2. Send Email                │
     │                                ├─────────────────────────────>│
     │                                │   (URL + temp password)      │
     │                                │                              │
```

### Phase 2: First Login

```
State Admin                      Backend                       Database
     │                                │                              │
     │ 3. Login (email + temp pwd)    │                              │
     ├───────────────────────────────>│                              │
     │                                │ 4. Verify Credentials        │
     │                                ├─────────────────────────────>│
     │                                │<─────────────────────────────┤
     │                                │    (invitation valid)        │
     │ <──────────────────────────────┤                              │
     │    (JWT tokens)                │                              │
     │                                │                              │
```

### Phase 3: Key Upload

```
State Admin                      Backend                       Database
     │                                │                              │
     │ 5. Generate SSH Keys           │                              │
     │   (ssh-keygen)                 │                              │
     │                                │                              │
     │ 6. Upload PUBLIC key           │                              │
     ├───────────────────────────────>│                              │
     │                                │ 7. Validate & Store          │
     │                                ├─────────────────────────────>│
     │                                │    (public key + fingerprint)│
     │ <──────────────────────────────┤                              │
     │    (fingerprint)               │                              │
     │                                │                              │
```

### Phase 4: Signed Requests

```
State Admin                      Backend                       Database
     │                                │                              │
     │ 8. API Request                 │                              │
     │    + X-Signature header        │                              │
     ├───────────────────────────────>│                              │
     │                                │ 9. Get Public Key            │
     │                                ├─────────────────────────────>│
     │                                │<─────────────────────────────┤
     │                                │                              │
     │                                │ 10. Verify Signature         │
     │                                │    (using public key)        │
     │                                │                              │
     │ <──────────────────────────────┤                              │
     │    (data response)             │                              │
     │                                │                              │
```

---

## Setup Guide

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Update `.env` file:

```env
# MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=budget_intelligence

# Email (for invitations)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Budget Intelligence Platform

# Frontend
FRONTEND_URL=http://localhost:3000
```

**Gmail Setup:**
1. Enable 2FA on Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use app password in `SMTP_PASSWORD`

### 3. Run the Application

```bash
python run.py
```

API Docs: http://localhost:8000/docs

---

## Central Admin Guide

### Create Invitation

**Endpoint:** `POST /api/v1/security/central/invitations/`

```bash
curl -X POST "http://localhost:8000/api/v1/security/central/invitations/" \
  -H "Authorization: Bearer YOUR_CENTRAL_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maharashtra@gov.in",
    "tenant_type": "state_government",
    "tenant_name": "Maharashtra State Government",
    "tenant_code": "MH-GOV-2024",
    "description": "Maharashtra state budget admin",
    "expires_in_days": 7
  }'
```

**Response:**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "maharashtra@gov.in",
  "tenant_name": "Maharashtra State Government",
  "tenant_code": "MH-GOV-2024",
  "dashboard_url": "http://localhost:3000/admin/login?hash=a1b2c3d4e5f6...",
  "status": "pending",
  "invited_at": "2024-03-06T10:30:00Z",
  "expires_at": "2024-03-13T10:30:00Z"
}
```

**Email sent to:** maharashtra@gov.in with:
- Dashboard URL
- Temporary password
- SSH key generation instructions

### List Invitations

```bash
curl "http://localhost:8000/api/v1/security/central/invitations/" \
  -H "Authorization: Bearer YOUR_CENTRAL_ADMIN_TOKEN"
```

### Get Statistics

```bash
curl "http://localhost:8000/api/v1/security/central/invitations/stats" \
  -H "Authorization: Bearer YOUR_CENTRAL_ADMIN_TOKEN"
```

**Response:**

```json
{
  "total_invitations": 25,
  "pending_invitations": 5,
  "accepted_invitations": 18,
  "expired_invitations": 2,
  "active_admins": 15
}
```

### Revoke Invitation

```bash
curl -X POST "http://localhost:8000/api/v1/security/central/invitations/{invitation_id}/revoke" \
  -H "Authorization: Bearer YOUR_CENTRAL_ADMIN_TOKEN"
```

---

## State/Minister Admin Guide

### Step 1: Receive Email

You'll receive an email with:
- **Dashboard URL**: `http://localhost:3000/admin/login?hash=abc123...`
- **Temporary Password**: `Xj9#kL2@pQ4$mN7%`
- **Instructions**: How to generate SSH keys

### Step 2: First Login

**Endpoint:** `POST /api/v1/security/admin/login`

```bash
curl -X POST "http://localhost:8000/api/v1/security/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maharashtra@gov.in",
    "temporary_password": "Xj9#kL2@pQ4$mN7%",
    "invitation_hash": "a1b2c3d4e5f6..."
  }'
```

**Response:**

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

### Step 3: Generate SSH Keys

**Ed25519 (Recommended):**

```bash
ssh-keygen -t ed25519 -C "maharashtra@gov.in"
```

**RSA (Traditional):**

```bash
ssh-keygen -t rsa -b 4096 -C "maharashtra@gov.in"
```

**Output:**
- Private key: `~/.ssh/id_ed25519` (or `id_rsa`)
- **Public key**: `~/.ssh/id_ed25519.pub` (or `id_rsa.pub`)

**⚠️ IMPORTANT:**
- **Upload**: Public key (.pub file)
- **Keep secure**: Private key (NO .pub extension)
- **NEVER share**: Your private key

### Step 4: Upload Public Key

**Get your public key:**

```bash
cat ~/.ssh/id_ed25519.pub
```

**Upload:**

```bash
curl -X POST "http://localhost:8000/api/v1/security/admin/upload-public-key" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "public_key": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILx... maharashtra@gov.in"
  }'
```

**Response:**

```json
{
  "success": true,
  "fingerprint": "SHA256:7d:3e:9f:1a:2b:4c:5d:6e:7f:8a:9b:0c:1d:2e:3f:4a",
  "message": "Public key uploaded successfully. You can now make signed requests.",
  "uploaded_at": "2024-03-06T11:00:00Z"
}
```

### Step 5: Make Signed Requests

All API requests must include `X-Signature` header with request signature.

---

## Request Signing

### How It Works

1. **Create request** (body or query params)
2. **Sign with private key** using SHA-256
3. **Base64 encode** the signature
4. **Add X-Signature header** to request

### Signing Methods

#### Method 1: Using OpenSSL (Command Line)

**For POST/PUT requests (with body):**

```bash
# Save request body to file
echo -n '{"key":"value"}' > request.txt

# Sign with private key
SIGNATURE=$(openssl dgst -sha256 -sign ~/.ssh/id_rsa request.txt | base64 -w 0)

# Make request
curl -X POST "http://localhost:8000/api/v1/budgets/allocate" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "X-Signature: $SIGNATURE" \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'
```

**For GET requests:**

```bash
# Sign the query string
SIGNATURE=$(echo -n "department=health&year=2024" | openssl dgst -sha256 -sign ~/.ssh/id_rsa | base64 -w 0)

# Make request
curl "http://localhost:8000/api/v1/budgets?department=health&year=2024" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "X-Signature: $SIGNATURE"
```

#### Method 2: Using Python

```python
import base64
import json
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
import requests

# Load private key
with open('/path/to/id_rsa', 'rb') as f:
    private_key = serialization.load_ssh_private_key(
        f.read(),
        password=None
    )

# Request data
url = "http://localhost:8000/api/v1/budgets/allocate"
headers = {
    "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    "Content-Type": "application/json"
}
data = {"department": "health", "amount": 1000000}
body = json.dumps(data)

# Sign the request body
signature = private_key.sign(
    body.encode('utf-8'),
    padding.PSS(
        mgf=padding.MGF1(hashes.SHA256()),
        salt_length=padding.PSS.MAX_LENGTH
    ),
    hashes.SHA256()
)

# Base64 encode signature
signature_b64 = base64.b64encode(signature).decode('utf-8')

# Add signature to headers
headers['X-Signature'] = signature_b64

# Make request
response = requests.post(url, headers=headers, json=data)
print(response.json())
```

#### Method 3: Using Node.js

```javascript
const crypto = require('crypto');
const fs = require('fs');
const axios = require('axios');

// Load private key
const privateKey = fs.readFileSync('/path/to/id_rsa', 'utf8');

// Request data
const url = 'http://localhost:8000/api/v1/budgets/allocate';
const data = { department: 'health', amount: 1000000 };
const body = JSON.stringify(data);

// Sign the request
const sign = crypto.createSign('SHA256');
sign.update(body);
sign.end();

const signature = sign.sign(privateKey, 'base64');

// Make request
axios.post(url, data, {
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'X-Signature': signature,
    'Content-Type': 'application/json'
  }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));
```

### Test Your Signature

Use the test endpoint to verify your signing is correct:

```bash
# Create signature
MESSAGE="test message"
SIGNATURE=$(echo -n "$MESSAGE" | openssl dgst -sha256 -sign ~/.ssh/id_rsa | base64 -w 0)

# Test
curl -X POST "http://localhost:8000/api/v1/security/admin/test-signature" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"$MESSAGE\",
    \"signature\": \"$SIGNATURE\"
  }"
```

**Success Response:**

```json
{
  "verified": true,
  "message": "Signature verified successfully!",
  "fingerprint": "SHA256:7d:3e:9f:1a:2b:4c:5d:6e:7f:8a:9b:0c:1d:2e:3f:4a"
}
```

---

## API Reference

### Central Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/security/central/invitations/` | Create invitation |
| GET | `/api/v1/security/central/invitations/` | List invitations |
| GET | `/api/v1/security/central/invitations/stats` | Get statistics |
| GET | `/api/v1/security/central/invitations/{id}` | Get invitation details |
| POST | `/api/v1/security/central/invitations/{id}/revoke` | Revoke invitation |
| POST | `/api/v1/security/central/invitations/cleanup-expired` | Cleanup expired |

### Admin Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/security/admin/login` | Login with temp password |
| POST | `/api/v1/security/admin/upload-public-key` | Upload SSH public key |
| GET | `/api/v1/security/admin/profile` | Get admin profile |
| POST | `/api/v1/security/admin/test-signature` | Test signature verification |

### Protected Endpoints (Require Signature)

To create protected endpoints that require signature verification:

```python
from fastapi import APIRouter, Depends
from app.security.middleware import verify_request_signature

router = APIRouter()

@router.post("/budget/allocate")
async def allocate_budget(
    budget_data: BudgetAllocation,
    admin_info: dict = Depends(verify_request_signature)
):
    # admin_info contains: email, tenant_code, tenant_name, session_id
    # This endpoint requires valid JWT + valid signature
    ...
```

---

## Troubleshooting

### Issue: Email not sending

**Solution:**
1. Check SMTP settings in `.env`
2. For Gmail, enable "Less secure app access" OR use App Password
3. Check firewall/antivirus blocking port 587
4. Dev mode: Emails print to console if SMTP not configured

### Issue: Invalid signature error

**Causes:**
- Wrong private key used
- Request body doesn't match signed message
- Signature not base64 encoded
- Using public key instead of private key to sign

**Solution:**
1. Use `/admin/test-signature` endpoint to test
2. Verify you're using the PRIVATE key to sign
3. Ensure request body exactly matches signed message
4. Check base64 encoding

### Issue: Account locked after failed attempts

**Solution:**
- After 5 failed signature attempts, account locks
- Central admin must unlock via database or support endpoint
- Reset counter: Successfully verified signature

### Issue: Invitation expired

**Solution:**
- Central admin creates new invitation
- Default expiry: 7 days (configurable)
- Use `/cleanup-expired` to mark old invitations

### Issue: Public key upload fails

**Causes:**
- Invalid SSH key format
- Using private key instead of public
- Corrupted key file

**Solution:**
1. Verify key format: `ssh-keygen -l -f ~/.ssh/id_ed25519.pub`
2. Ensure using .pub file (public key)
3. Regenerate if corrupted: `ssh-keygen -t ed25519 -C "email@example.com"`

---

## Security Best Practices

1. **Never commit private keys** - Add to .gitignore
2. **Store private keys securely** - Use SSH agent or encrypted storage
3. **Rotate keys regularly** - Update public key every 90-180 days
4. **Monitor failed attempts** - Set up alerts for repeated failures
5. **Use strong passwords** - For SSH key passphrases
6. **Secure email** - Use App Passwords, not account password
7. **HTTPS in production** - Never send tokens over HTTP
8. **Log all access** - Maintain audit trail

---

## Next Steps

1. ✅ **Phase 1 Complete**: Multi-tenancy security with key-based auth
2. 🔄 **Phase 2**: Budget data models and allocation APIs
3. 🔄 **Phase 3**: Anomaly detection and analytics
4. 🔄 **Phase 4**: Dashboard and reporting

---

For support or questions, contact your system administrator.

**© 2024 Budget Intelligence Platform**
