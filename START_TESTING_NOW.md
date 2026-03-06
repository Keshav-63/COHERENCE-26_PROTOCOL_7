# 🚀 Start Testing NOW - Quick Commands

## ⚡ Step 1: Start the Server (2 seconds)

```bash
python run.py
```

**Expected Output:**
```
Connected to MongoDB: coherence_db
INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ Server is running!

---

## 🌐 Step 2: Open Swagger UI (Click this!)

**Open in browser:** http://localhost:8000/docs

You'll see all API endpoints with interactive testing!

---

## 🧪 Step 3: Test in 3 Minutes

### Method A: Using Swagger UI (Easiest!)

1. **Go to:** http://localhost:8000/docs

2. **Test Google OAuth:**
   - Find `GET /api/v1/auth/google/login`
   - Click "Try it out" → "Execute"
   - Copy the `authorization_url`
   - Open URL in browser → Sign in with Google
   - You'll be redirected with a `code` in URL

3. **Get Tokens:**
   - Find `POST /api/v1/auth/google/callback`
   - Click "Try it out"
   - Paste the `code`
   - Click "Execute"
   - **SAVE the `access_token`!**

4. **Authorize:**
   - Click green 🔓 "Authorize" button at top
   - Paste your `access_token`
   - Click "Authorize"

5. **Create Invitation:**
   - Find `POST /api/v1/security/central/invitations/`
   - Click "Try it out"
   - Edit email if needed
   - Click "Execute"
   - **Check console output** for temporary password!

6. **Login as State Admin:**
   - Find `POST /api/v1/security/admin/login`
   - Use email from invitation
   - Use temporary password from console
   - Use `invitation_hash` from response
   - Click "Execute"
   - **SAVE the new `access_token`!**

7. **Generate SSH Key (Terminal):**
   ```bash
   ssh-keygen -t ed25519 -C "test@gov.in"
   cat ~/.ssh/id_ed25519.pub
   ```

8. **Upload Public Key:**
   - Re-authorize with admin token
   - Find `POST /api/v1/security/admin/upload-public-key`
   - Paste your public key
   - Click "Execute"

---

### Method B: Using Postman

1. **Import Collection:**
   - Open Postman
   - Click "Import"
   - Select: `Budget-Intelligence-Platform.postman_collection.json`

2. **Follow the numbered folders:**
   - 1️⃣ Central Admin - Google OAuth
   - 2️⃣ Central Admin - Invitation Management
   - 3️⃣ State/Minister Admin - Authentication

---

### Method C: Using cURL (Quick Test)

```bash
# 1. Health Check
curl http://localhost:8000/health

# 2. Get Google Login URL
curl http://localhost:8000/api/v1/auth/google/login

# 3. Open URL in browser, sign in, get code

# 4. Exchange code for token
curl -X POST "http://localhost:8000/api/v1/auth/google/callback" \
  -H "Content-Type: application/json" \
  -d '{"code":"YOUR_CODE_HERE"}'

# 5. Create invitation (use token from step 4)
curl -X POST "http://localhost:8000/api/v1/security/central/invitations/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@gov.in",
    "tenant_type":"state_government",
    "tenant_name":"Test State",
    "tenant_code":"TS-001",
    "expires_in_days":7
  }'
```

---

## 📋 Complete Testing Checklist

- [ ] Server running on http://localhost:8000
- [ ] Swagger UI accessible at http://localhost:8000/docs
- [ ] Google OAuth login works
- [ ] Got access token
- [ ] Created invitation
- [ ] Saw temporary password in console
- [ ] Admin login successful
- [ ] Generated SSH keys
- [ ] Uploaded public key
- [ ] Tested signature verification

---

## 🎯 Quick Links

- **Swagger UI**: http://localhost:8000/docs
- **API Root**: http://localhost:8000
- **Health**: http://localhost:8000/health
- **Complete Guide**: [TESTING_GUIDE.md](TESTING_GUIDE.md)
- **Postman Collection**: `Budget-Intelligence-Platform.postman_collection.json`

---

## 🐛 Common Issues

### "Redirect URI mismatch"
→ Add `http://localhost:8000/api/v1/auth/google/callback` to Google Console

### "Module not found"
→ Run `pip install -r requirements.txt`

### "Email not sent"
→ Normal! In dev mode, emails print to console (check terminal)

### "Invalid signature"
→ Make sure using PRIVATE key (not .pub file)

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| [TESTING_GUIDE.md](TESTING_GUIDE.md) | Complete step-by-step testing guide |
| [SECURITY_MODULE_GUIDE.md](SECURITY_MODULE_GUIDE.md) | Full documentation |
| [SECURITY_QUICK_START.md](SECURITY_QUICK_START.md) | 5-minute quick start |
| [examples/sign_request_example.py](examples/sign_request_example.py) | Python code examples |

---

## 🎉 You're Ready!

1. ✅ Start server: `python run.py`
2. ✅ Open: http://localhost:8000/docs
3. ✅ Test everything!

**Happy Testing!** 🚀
