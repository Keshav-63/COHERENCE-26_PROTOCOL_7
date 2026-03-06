# Security Module - Quick Start Guide

Get started with multi-tenancy security in 5 minutes!

## 🚀 For Central Admin

### 1. Login to Platform

```bash
# Use existing Google OAuth
curl http://localhost:8000/api/v1/auth/google/login
```

### 2. Create Invitation

```bash
curl -X POST "http://localhost:8000/api/v1/security/central/invitations/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maharashtra@gov.in",
    "tenant_type": "state_government",
    "tenant_name": "Maharashtra State Government",
    "tenant_code": "MH-GOV-2024",
    "expires_in_days": 7
  }'
```

✅ **Done!** Email sent with login credentials.

---

## 📧 For State/Minister Admin

### 1. Check Email

You received:
- Dashboard URL: `http://localhost:3000/admin/login?hash=abc123...`
- Temporary Password: `Xj9#kL2@pQ4$mN7%`

### 2. Login

```bash
curl -X POST "http://localhost:8000/api/v1/security/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maharashtra@gov.in",
    "temporary_password": "Xj9#kL2@pQ4$mN7%",
    "invitation_hash": "abc123..."
  }'
```

Save the `access_token` from response!

### 3. Generate SSH Keys

```bash
ssh-keygen -t ed25519 -C "maharashtra@gov.in"
```

Press Enter 3 times (no passphrase for testing).

### 4. Upload Public Key

```bash
# Get your public key
cat ~/.ssh/id_ed25519.pub

# Upload it
curl -X POST "http://localhost:8000/api/v1/security/admin/upload-public-key" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "public_key": "ssh-ed25519 AAAAC3Nza... maharashtra@gov.in"
  }'
```

### 5. Test Signature

```bash
# Create test signature
MESSAGE="test message"
SIGNATURE=$(echo -n "$MESSAGE" | openssl dgst -sha256 -sign ~/.ssh/id_ed25519 | base64 -w 0)

# Test it
curl -X POST "http://localhost:8000/api/v1/security/admin/test-signature" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"$MESSAGE\",
    \"signature\": \"$SIGNATURE\"
  }"
```

✅ **Success!** You can now make signed API requests.

---

## 🔐 Making Signed Requests

### Template

```bash
# 1. Create request body
BODY='{"department":"health","amount":1000000}'

# 2. Sign it
SIGNATURE=$(echo -n "$BODY" | openssl dgst -sha256 -sign ~/.ssh/id_ed25519 | base64 -w 0)

# 3. Make request with signature
curl -X POST "http://localhost:8000/api/v1/your-endpoint" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "X-Signature: $SIGNATURE" \
  -H "Content-Type: application/json" \
  -d "$BODY"
```

---

## 📊 Check Your Status

```bash
curl "http://localhost:8000/api/v1/security/admin/profile" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🆘 Common Issues

### "Invalid signature"
- Make sure you're using PRIVATE key (id_ed25519, NOT id_ed25519.pub)
- Check message matches exactly

### "Missing X-Signature header"
- Add `-H "X-Signature: $SIGNATURE"` to request

### "No public key uploaded"
- Upload public key first (step 4 above)

### "Email not received"
- Check spam folder
- Configure SMTP in .env
- Dev mode: Check console logs

---

## 📚 Full Documentation

For complete guide, see [SECURITY_MODULE_GUIDE.md](SECURITY_MODULE_GUIDE.md)

---

**Need Help?**
- API Docs: http://localhost:8000/docs
- Full Guide: [SECURITY_MODULE_GUIDE.md](SECURITY_MODULE_GUIDE.md)
