# Budget Intelligence Platform API

Production-ready FastAPI application with Google OAuth2 authentication and multi-tenancy security for National Budget Flow Intelligence & Leakage Detection.

## Features

### Core Authentication
- **Google OAuth2 Authentication** - Secure user authentication via Google
- **JWT Token Management** - Access and refresh token implementation

### Security Module (Phase 1) ✨
- **Multi-Tenancy Security** - Isolated tenant access (Central, State, Ministry)
- **Invitation System** - Email-based invitation with temporary passwords
- **Public-Private Key Authentication** - SSH key-based request signing
- **Request Signature Verification** - All admin requests cryptographically signed
- **Automated Email Notifications** - Invitation emails with setup instructions

### Platform
- **Async Database Operations** - MongoDB with Motor and Beanie ODM
- **CORS Enabled** - Ready for frontend integration
- **Industry-Standard Structure** - Organized, scalable codebase
- **DRY Principles** - Reusable services and dependencies
- **Type Safety** - Pydantic schemas for validation
- **Error Handling** - Centralized error management
- **API Documentation** - Auto-generated Swagger/ReDoc docs

## Project Structure

```
Coherence-project/
├── app/
│   ├── __init__.py
│   ├── main.py                    # Application entry point
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py               # Reusable dependencies
│   │   └── v1/
│   │       ├── __init__.py
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           └── auth.py       # Authentication endpoints
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py             # Configuration management
│   │   ├── database.py           # Database connection
│   │   └── security.py           # JWT & password utilities
│   ├── models/
│   │   ├── __init__.py
│   │   └── user.py               # User database model
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── user.py               # Pydantic schemas
│   ├── services/
│   │   ├── __init__.py
│   │   ├── oauth.py              # Google OAuth service
│   │   └── user.py               # User business logic
│   └── middleware/
│       ├── __init__.py
│       ├── cors.py               # CORS configuration
│       └── error_handler.py      # Error handling
├── .env.example                   # Environment variables template
├── .gitignore
├── requirements.txt
└── README.md
```

## Prerequisites

- Python 3.10+
- MongoDB 6.0+ (or MongoDB Atlas free tier)
- Google Cloud Project with OAuth2 credentials

## Setup Instructions

### 1. Clone and Setup Virtual Environment

```bash
# Navigate to project directory
cd Coherence-project

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Google OAuth2

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:8000/api/v1/auth/google/callback`
7. Copy Client ID and Client Secret

### 4. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Windows: Download from mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Verify it's running
mongosh
```

**Option B: MongoDB Atlas (Free Cloud)**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account and cluster
3. Get connection string
4. Use in `.env` file

**Option C: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
```

**Required environment variables:**

```env
# MongoDB Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=coherence_db
# For MongoDB Atlas, use: mongodb+srv://username:password@cluster.mongodb.net/

# Security (Generate secure random strings)
SECRET_KEY=your-super-secret-key-min-32-characters
SESSION_SECRET_KEY=another-secret-key-min-32-characters

# Google OAuth2
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback

# Frontend (Update with your frontend URL)
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 6. Run the Application

```bash
# Development mode with auto-reload
python app/main.py

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

## Security Module (Multi-Tenancy)

The platform implements a sophisticated multi-tenancy security system for hierarchical government structure:

### Architecture
```
Central Government (Highest Authority)
    ↓ (Creates Invitations)
State Governments / Ministries
    ↓ (Access Budget Data)
Departments
```

### Key Features

1. **Invitation-Based Access**
   - Central admin invites state/minister admins via email
   - Unique dashboard URL with hash for each invitation
   - Temporary password for first-time login

2. **Public-Private Key Authentication**
   - Admins generate SSH keys (Ed25519 or RSA)
   - Upload public key to platform
   - Sign all API requests with private key
   - Backend verifies using stored public key

3. **Request Signature Verification**
   - Every API request includes `X-Signature` header
   - Signature created by signing request with private key
   - Backend validates signature before processing
   - Auto-locks account after 5 failed verification attempts

### Quick Start

**For Central Admin:**
```bash
# Create invitation
POST /api/v1/security/central/invitations/
{
  "email": "maharashtra@gov.in",
  "tenant_type": "state_government",
  "tenant_name": "Maharashtra State Government",
  "tenant_code": "MH-GOV-2024"
}
```

**For State/Minister Admin:**
```bash
# 1. Receive email with dashboard URL and temporary password

# 2. Login
POST /api/v1/security/admin/login
{
  "email": "maharashtra@gov.in",
  "temporary_password": "from-email",
  "invitation_hash": "from-url"
}

# 3. Generate SSH keys
ssh-keygen -t ed25519 -C "maharashtra@gov.in"

# 4. Upload public key
POST /api/v1/security/admin/upload-public-key
{
  "public_key": "ssh-ed25519 AAAAC3Nza..."
}

# 5. Make signed requests
# Include X-Signature header with all API calls
```

### Documentation

- **Quick Start**: [SECURITY_QUICK_START.md](SECURITY_QUICK_START.md)
- **Complete Guide**: [SECURITY_MODULE_GUIDE.md](SECURITY_MODULE_GUIDE.md)
- **Code Example**: [examples/sign_request_example.py](examples/sign_request_example.py)

## API Endpoints

### Authentication

#### `GET /api/v1/auth/google/login`
Get Google OAuth2 authorization URL

**Response:**
```json
{
  "authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "message": "Redirect user to this URL for Google authentication"
}
```

#### `POST /api/v1/auth/google/callback`
Exchange Google authorization code for JWT tokens

**Request Body:**
```json
{
  "code": "4/0AY0e-g7X...",
  "redirect_uri": "http://localhost:8000/api/v1/auth/google/callback"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "full_name": "John Doe",
    "profile_picture": "https://...",
    "is_active": true,
    "is_verified": true,
    "oauth_provider": "google",
    "created_at": "2024-01-01T00:00:00Z",
    "last_login": "2024-01-01T00:00:00Z"
  }
}
```

#### `POST /api/v1/auth/refresh`
Refresh access token

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

#### `GET /api/v1/auth/me`
Get current user information

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "profile_picture": "https://...",
  "is_active": true,
  "is_verified": true,
  "oauth_provider": "google",
  "created_at": "2024-01-01T00:00:00Z",
  "last_login": "2024-01-01T00:00:00Z"
}
```

#### `POST /api/v1/auth/logout`
Logout current user

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response:**
```json
{
  "message": "Successfully logged out",
  "detail": "Please clear tokens from client storage"
}
```

## Frontend Integration Guide

### React/Next.js Example

```typescript
// 1. Redirect user to Google login
const handleGoogleLogin = async () => {
  const response = await fetch('http://localhost:8000/api/v1/auth/google/login');
  const data = await response.json();
  window.location.href = data.authorization_url;
};

// 2. Handle callback (extract code from URL)
const handleCallback = async (code: string) => {
  const response = await fetch('http://localhost:8000/api/v1/auth/google/callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });

  const data = await response.json();

  // Store tokens securely (consider httpOnly cookies in production)
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);

  return data.user;
};

// 3. Make authenticated requests
const fetchUserProfile = async () => {
  const token = localStorage.getItem('access_token');

  const response = await fetch('http://localhost:8000/api/v1/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
};

// 4. Refresh token when access token expires
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');

  const response = await fetch('http://localhost:8000/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken })
  });

  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);

  return data.access_token;
};
```

### Vue.js Example

```javascript
// composables/useAuth.js
export const useAuth = () => {
  const login = async () => {
    const response = await fetch('http://localhost:8000/api/v1/auth/google/login');
    const data = await response.json();
    window.location.href = data.authorization_url;
  };

  const handleCallback = async (code) => {
    const response = await fetch('http://localhost:8000/api/v1/auth/google/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);

    return data.user;
  };

  return { login, handleCallback };
};
```

## Security Best Practices

1. **Environment Variables**: Never commit `.env` file
2. **HTTPS**: Use HTTPS in production
3. **Token Storage**:
   - Use httpOnly cookies for tokens in production
   - Avoid localStorage for sensitive data
4. **CORS**: Configure specific origins, not wildcards
5. **Token Expiration**: Implement proper token refresh flow
6. **Rate Limiting**: Add rate limiting in production
7. **Database**: Use strong passwords and SSL connections

## Development

### Database Migrations (Future Enhancement)

```bash
# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial migration"

# Run migrations
alembic upgrade head
```

### Running Tests (Future Enhancement)

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

## Production Deployment

1. Set `DEBUG=False` in environment
2. Use proper PostgreSQL instance
3. Configure reverse proxy (Nginx)
4. Use process manager (systemd, supervisor)
5. Enable HTTPS with SSL certificates
6. Set up monitoring and logging
7. Configure backup strategy

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Verify database exists
psql -U postgres -l
```

### Google OAuth Errors
- Verify redirect URI matches exactly in Google Console
- Check Client ID and Secret are correct
- Ensure Google+ API is enabled

### CORS Issues
- Add your frontend URL to `ALLOWED_ORIGINS`
- Check frontend is sending correct headers

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
