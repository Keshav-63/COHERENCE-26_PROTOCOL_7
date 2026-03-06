# Quick Start Guide - Email/Password Authentication

## Step 1: Setup and Start the Server

```bash
# Install dependencies
pip install -r requirements.txt

# Start the server
python run.py
```

Server will be running at: http://localhost:8000

## Step 2: Create Central Admin User

Before testing, you need to create a central admin user:

```bash
python create_central_admin.py
```

**Default Credentials:**
- Email: `admin@gov.in`
- Password: `Admin@123`

**IMPORTANT:** Change the password after first login!

## Step 3: Test Authentication

### Option A: Using Swagger UI (http://localhost:8000/docs)

1. **Login as Central Admin:**
   - Go to `POST /api/v1/auth/login`
   - Click "Try it out"
   - Enter credentials:
     ```json
     {
       "email": "admin@gov.in",
       "password": "Admin@123"
     }
     ```
   - Click "Execute"
   - **Copy the `access_token`**

2. **Authorize:**
   - Click the green "Authorize" button at the top
   - Paste your `access_token`
   - Click "Authorize"

3. **Create Invitation:**
   - Go to `POST /api/v1/security/central/invitations/`
   - Click "Try it out"
   - Enter invitation data:
     ```json
     {
       "email": "maharashtra.admin@gov.in",
       "tenant_type": "state_government",
       "tenant_name": "Maharashtra State Government",
       "tenant_code": "MH-GOV-2024",
       "expires_in_days": 7
     }
     ```
   - Click "Execute"
   - **Check server console for temporary password!**

4. **Admin Login (State/Minister):**
   - Go to `POST /api/v1/security/admin/login`
   - Use email, temporary password, and invitation hash
   - Upload public key via `POST /api/v1/security/admin/upload-public-key`

### Option B: Using cURL

```bash
# 1. Login as Central Admin
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gov.in",
    "password": "Admin@123"
  }'

# 2. Create Invitation (use token from step 1)
curl -X POST "http://localhost:8000/api/v1/security/central/invitations/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maharashtra.admin@gov.in",
    "tenant_type": "state_government",
    "tenant_name": "Maharashtra State Government",
    "tenant_code": "MH-GOV-2024",
    "expires_in_days": 7
  }'
```

## Step 4: Register New Users (Optional)

Regular users can register via:

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123",
    "full_name": "John Doe"
  }'
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user info
- `POST /api/v1/auth/logout` - Logout

### Central Admin (Requires `central_admin` role)
- `POST /api/v1/security/central/invitations/` - Create invitation
- `GET /api/v1/security/central/invitations/` - List invitations
- `GET /api/v1/security/central/invitations/stats` - Get statistics
- `POST /api/v1/security/central/invitations/{id}/revoke` - Revoke invitation

### State/Minister Admin
- `POST /api/v1/security/admin/login` - Login with temporary password
- `POST /api/v1/security/admin/upload-public-key` - Upload SSH public key
- `GET /api/v1/security/admin/profile` - Get admin profile
- `POST /api/v1/security/admin/test-signature` - Test signature verification

## Key Changes from OAuth

1. **No Google OAuth** - System now uses email/password authentication
2. **Role-Based Access** - Users have roles: `user` or `central_admin`
3. **Central Admin Only** - Only users with `central_admin` role can create invitations
4. **Password Requirements** - Minimum 8 characters
5. **JWT Tokens** - Same token system (access + refresh tokens)

## Email Configuration

Emails are printed to console in development mode. To enable SMTP:

Update `.env` file:
```env
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
FROM_EMAIL=your-email@gmail.com
```

For Gmail, create an App Password: https://support.google.com/accounts/answer/185833

## Security Notes

1. Change default admin password immediately
2. Use strong passwords (min 8 characters)
3. Store tokens securely (httpOnly cookies recommended)
4. Enable SMTP for production to send invitation emails
5. All admin API requests require SSH key signatures

## Testing Checklist

- [ ] Server starts successfully
- [ ] Created central admin user
- [ ] Central admin can login
- [ ] Central admin can create invitations
- [ ] State admin can login with temporary password
- [ ] State admin can upload public key
- [ ] Regular users can register
- [ ] Regular users can login
- [ ] Token refresh works
- [ ] Role-based access control works

Happy Testing!
