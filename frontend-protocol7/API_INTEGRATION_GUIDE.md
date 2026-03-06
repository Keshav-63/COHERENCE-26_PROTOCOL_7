# API Integration Guide

Complete guide for using the Budget Intelligence Platform API in the frontend.

## Table of Contents
1. [Setup](#setup)
2. [Authentication APIs](#authentication-apis)
3. [Admin Authentication APIs](#admin-authentication-apis)
4. [Invitation Management APIs](#invitation-management-apis)
5. [Error Handling](#error-handling)
6. [Examples](#examples)

---

## Setup

### 1. Environment Configuration

Create a `.env` file in the project root:

```bash
# Copy from .env.example
cp .env.example .env
```

Update the API URL in `.env`:

```env
# Development
VITE_API_BASE_URL=http://localhost:8000

# Production
# VITE_API_BASE_URL=https://api.budgetintelligence.gov.in
```

### 2. Project Structure

```
src/
├── config/
│   └── api.config.js          # API configuration & endpoints
├── services/
│   ├── api.client.js          # Axios instance with interceptors
│   ├── auth.service.js        # User authentication
│   ├── admin.service.js       # Admin authentication
│   ├── invitation.service.js  # Invitation management
│   └── index.js               # Service exports
├── utils/
│   ├── tokenManager.js        # Token storage & management
│   └── apiErrorHandler.js     # Error handling utilities
└── context/
    └── AuthContext.jsx        # Auth context with API integration
```

---

## Authentication APIs

### Register New User

```javascript
import { useAuth } from '../context/AuthContext'

function RegisterForm() {
  const { register } = useAuth()

  const handleRegister = async (e) => {
    e.preventDefault()

    try {
      const response = await register({
        email: 'user@example.com',
        password: 'securepassword123',
        full_name: 'John Doe' // optional
      })

      console.log('Registered:', response)
      // Response includes: access_token, refresh_token, user data

    } catch (error) {
      console.error('Registration failed:', error.message)
    }
  }

  return (/* your form JSX */)
}
```

### User Login

```javascript
import { useAuth } from '../context/AuthContext'

function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const response = await login({
        email: 'user@example.com',
        password: 'password123'
      })

      console.log('Logged in:', response.user)
      navigate('/dashboard')

    } catch (error) {
      console.error('Login failed:', error.message)
    }
  }

  return (/* your form JSX */)
}
```

### Get Current User

```javascript
import { useAuth } from '../context/AuthContext'

function ProfilePage() {
  const { getCurrentUser } = useAuth()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getCurrentUser()
        console.log('User data:', userData)
      } catch (error) {
        console.error('Failed to load user:', error.message)
      }
    }

    loadUserData()
  }, [])

  return (/* your component JSX */)
}
```

### Logout

```javascript
import { useAuth } from '../context/AuthContext'

function Header() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error.message)
    }
  }

  return (
    <button onClick={handleLogout}>Logout</button>
  )
}
```

---

## Admin Authentication APIs

### Admin Login (with Invitation)

```javascript
import { useAuth } from '../context/AuthContext'
import { useSearchParams } from 'react-router-dom'

function AdminLoginForm() {
  const { adminLogin } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const handleAdminLogin = async (e) => {
    e.preventDefault()

    // Get invitation hash from URL query parameter
    const invitationHash = searchParams.get('hash')

    try {
      const response = await adminLogin({
        email: 'admin@state.gov.in',
        temporary_password: 'temp_password_from_email',
        invitation_hash: invitationHash
      })

      console.log('Admin logged in:', response)

      // Check if public key upload is required
      if (response.requires_public_key) {
        navigate('/admin/upload-key')
      } else {
        navigate('/admin/dashboard')
      }

    } catch (error) {
      console.error('Admin login failed:', error.message)
    }
  }

  return (/* your form JSX */)
}
```

### Upload Public Key

```javascript
import { useAuth } from '../context/AuthContext'

function PublicKeyUploadForm() {
  const { uploadPublicKey } = useAuth()
  const [publicKey, setPublicKey] = useState('')

  const handleUpload = async (e) => {
    e.preventDefault()

    try {
      const response = await uploadPublicKey(publicKey)

      console.log('Public key uploaded:', response.fingerprint)
      alert(`Key uploaded successfully! Fingerprint: ${response.fingerprint}`)

    } catch (error) {
      console.error('Upload failed:', error.message)
    }
  }

  return (
    <form onSubmit={handleUpload}>
      <textarea
        value={publicKey}
        onChange={(e) => setPublicKey(e.target.value)}
        placeholder="Paste your SSH public key here..."
        rows={10}
      />
      <button type="submit">Upload Public Key</button>
    </form>
  )
}
```

### Get Admin Profile

```javascript
import { useAuth } from '../context/AuthContext'

function AdminProfilePage() {
  const { getAdminProfile } = useAuth()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const adminProfile = await getAdminProfile()
        setProfile(adminProfile)
      } catch (error) {
        console.error('Failed to load profile:', error.message)
      }
    }

    loadProfile()
  }, [])

  return (
    <div>
      {profile && (
        <>
          <h2>{profile.tenant_name}</h2>
          <p>Type: {profile.tenant_type}</p>
          <p>Code: {profile.tenant_code}</p>
          <p>Public Key: {profile.public_key_uploaded ? '✓ Uploaded' : '✗ Not uploaded'}</p>
          {profile.public_key_fingerprint && (
            <p>Fingerprint: {profile.public_key_fingerprint}</p>
          )}
        </>
      )}
    </div>
  )
}
```

---

## Invitation Management APIs

**Note:** These APIs are only for central government users.

### Create Invitation

```javascript
import { invitationService } from '../services'

function CreateInvitationForm() {
  const handleCreate = async (e) => {
    e.preventDefault()

    try {
      const invitation = await invitationService.createInvitation({
        email: 'stateadmin@state.gov.in',
        tenant_type: 'state_government', // 'state_government', 'minister', 'department'
        tenant_name: 'Maharashtra State Government',
        tenant_code: 'MH-GOV-001',
        description: 'State Government Admin Access',
        expires_in_days: 7 // optional, default: 7
      })

      console.log('Invitation created!')
      console.log('Dashboard URL:', invitation.dashboard_url)
      console.log('Send this URL to the admin via email')

    } catch (error) {
      console.error('Failed to create invitation:', error.message)
    }
  }

  return (/* your form JSX */)
}
```

### List Invitations

```javascript
import { invitationService } from '../services'

function InvitationsList() {
  const [invitations, setInvitations] = useState([])

  useEffect(() => {
    const loadInvitations = async () => {
      try {
        const data = await invitationService.listInvitations({
          status: 'pending', // optional: 'pending', 'accepted', 'expired', 'revoked'
          tenant_type: 'state_government', // optional
          skip: 0,
          limit: 50
        })

        setInvitations(data)
      } catch (error) {
        console.error('Failed to load invitations:', error.message)
      }
    }

    loadInvitations()
  }, [])

  return (
    <div>
      {invitations.map(inv => (
        <div key={inv.id}>
          <p>{inv.email} - {inv.status}</p>
          <p>{inv.tenant_name} ({inv.tenant_code})</p>
        </div>
      ))}
    </div>
  )
}
```

### Get Invitation Statistics

```javascript
import { invitationService } from '../services'

function InvitationStats() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await invitationService.getInvitationStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to load stats:', error.message)
      }
    }

    loadStats()
  }, [])

  return (
    <div>
      {stats && (
        <>
          <p>Total: {stats.total_invitations}</p>
          <p>Pending: {stats.pending_invitations}</p>
          <p>Accepted: {stats.accepted_invitations}</p>
          <p>Expired: {stats.expired_invitations}</p>
          <p>Active Admins: {stats.active_admins}</p>
        </>
      )}
    </div>
  )
}
```

### Revoke Invitation

```javascript
import { invitationService } from '../services'

function InvitationItem({ invitationId }) {
  const handleRevoke = async () => {
    if (!confirm('Are you sure you want to revoke this invitation?')) {
      return
    }

    try {
      await invitationService.revokeInvitation(invitationId)
      alert('Invitation revoked successfully')
    } catch (error) {
      console.error('Failed to revoke:', error.message)
    }
  }

  return (
    <button onClick={handleRevoke}>Revoke</button>
  )
}
```

---

## Error Handling

### Using Error Handler Utilities

```javascript
import { formatApiError, extractFieldErrors, isAuthError } from '../utils/apiErrorHandler'
import { authService } from '../services'

function LoginForm() {
  const [errors, setErrors] = useState({})

  const handleLogin = async (credentials) => {
    try {
      await authService.login(credentials)
    } catch (error) {
      // Check if it's an auth error
      if (isAuthError(error)) {
        console.log('Authentication failed - redirect to login')
      }

      // Get field-specific errors
      const fieldErrors = extractFieldErrors(error)
      setErrors(fieldErrors)

      // Show formatted error message
      alert(formatApiError(error))
    }
  }

  return (
    <form>
      <input name="email" />
      {errors.email && <span className="error">{errors.email}</span>}

      <input name="password" type="password" />
      {errors.password && <span className="error">{errors.password}</span>}
    </form>
  )
}
```

### Retry Failed API Calls

```javascript
import { retryApiCall } from '../utils/apiErrorHandler'
import { invitationService } from '../services'

async function fetchInvitationsWithRetry() {
  try {
    const invitations = await retryApiCall(
      () => invitationService.listInvitations(),
      3, // max retries
      1000 // delay between retries (ms)
    )

    return invitations
  } catch (error) {
    console.error('Failed after retries:', error.message)
  }
}
```

---

## Examples

### Complete Login Flow

```javascript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { showSuccess, showError } from '../utils/utils'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await login({ email, password })
      showSuccess(`Welcome ${response.user.email}!`)
      navigate('/dashboard')
    } catch (error) {
      showError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

### Protected Route with Auth Check

```javascript
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Usage in App.jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### Direct API Call (without AuthContext)

```javascript
import { authService } from '../services'
import { showError } from '../utils/utils'

async function directLoginCall() {
  try {
    const response = await authService.login({
      email: 'user@example.com',
      password: 'password123'
    })

    // Tokens are automatically stored
    console.log('User:', response.user)
    console.log('Token expires in:', response.expires_in)

  } catch (error) {
    showError(error.message)
  }
}
```

---

## Token Management

Tokens are automatically managed by the API client:

- **Access Token**: Automatically added to all API requests
- **Refresh Token**: Automatically used to refresh expired access tokens
- **Storage**: Tokens stored in localStorage
- **Auto-refresh**: Failed requests with 401 are automatically retried after token refresh

### Manual Token Access

```javascript
import { getAccessToken, getRefreshToken, clearTokens } from '../utils/tokenManager'

// Get current access token
const token = getAccessToken()

// Get refresh token
const refreshToken = getRefreshToken()

// Clear all tokens (logout)
clearTokens()
```

---

## API Configuration

Update API settings in [api.config.js](src/config/api.config.js):

```javascript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.budgetintelligence.gov.in',
  API_VERSION: 'v1',
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
}
```

---

## Testing

### Test API Connection

```javascript
import apiClient from '../services/api.client'

async function testApiConnection() {
  try {
    const response = await apiClient.get('/health')
    console.log('API is healthy:', response.data)
  } catch (error) {
    console.error('API connection failed:', error.message)
  }
}
```

### Test Signature Verification (Admin)

```javascript
import { adminService } from '../services'

async function testSignature() {
  try {
    const result = await adminService.testSignature({
      message: 'test message',
      signature: 'base64_encoded_signature_here'
    })

    console.log('Signature verified:', result.verified)
    console.log('Fingerprint:', result.fingerprint)
  } catch (error) {
    console.error('Signature test failed:', error.message)
  }
}
```

---

## Support

For issues or questions:
- Check the API documentation: `/openapi.json`
- Review error messages in browser console
- Verify API base URL in `.env` file
- Check network tab for failed requests

## Next Steps

1. Update `.env` with your API URL
2. Test authentication flows
3. Implement protected routes
4. Add error handling to all forms
5. Test invitation management (for central admins)
