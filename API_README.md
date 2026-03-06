# Budget Intelligence Platform - API Integration

Complete API integration for the National Budget Intelligence Platform frontend.

## 🚀 Quick Start

### 1. Install Dependencies

All required dependencies are already in `package.json`:
- `axios` - HTTP client for API calls

### 2. Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Update the API URL:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Start Development

```bash
npm run dev
```

## 📁 Project Structure

```
src/
├── config/
│   └── api.config.js              # API configuration & endpoints
├── services/
│   ├── api.client.js              # Axios instance with interceptors
│   ├── auth.service.js            # User authentication APIs
│   ├── admin.service.js           # Admin authentication APIs
│   ├── invitation.service.js      # Invitation management APIs
│   └── index.js                   # Service exports
├── utils/
│   ├── tokenManager.js            # Token storage & management
│   └── apiErrorHandler.js         # Error handling utilities
├── hooks/
│   └── useApi.js                  # Custom API hooks
├── context/
│   └── AuthContext.jsx            # Auth context with API integration
└── examples/
    └── ApiUsageExamples.jsx       # Example implementations
```

## 📚 Available Services

### 1. Authentication Service (`auth.service.js`)

```javascript
import { authService } from './services'

// Register
await authService.register({ email, password, full_name })

// Login
await authService.login({ email, password })

// Get current user
await authService.getCurrentUser()

// Logout
await authService.logout()

// Refresh token
await authService.refreshAccessToken(refreshToken)
```

### 2. Admin Service (`admin.service.js`)

```javascript
import { adminService } from './services'

// Admin login
await adminService.adminLogin({ email, temporary_password, invitation_hash })

// Upload public key
await adminService.uploadPublicKey(publicKey)

// Get admin profile
await adminService.getAdminProfile()

// Test signature
await adminService.testSignature({ message, signature })

// Admin logout
await adminService.adminLogout()
```

### 3. Invitation Service (`invitation.service.js`)

```javascript
import { invitationService } from './services'

// Create invitation
await invitationService.createInvitation({
  email,
  tenant_type,
  tenant_name,
  tenant_code,
  description,
  expires_in_days
})

// List invitations
await invitationService.listInvitations({ status, tenant_type, skip, limit })

// Get stats
await invitationService.getInvitationStats()

// Get details
await invitationService.getInvitationDetails(id)

// Revoke invitation
await invitationService.revokeInvitation(id)

// Cleanup expired
await invitationService.cleanupExpiredInvitations()
```

## 🎣 Custom Hooks

### useApi - Basic API calls

```javascript
import { useApi } from '../hooks/useApi'
import { invitationService } from '../services'

function MyComponent() {
  const { data, loading, error, execute } = useApi(
    invitationService.getInvitationStats,
    true // call immediately
  )

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {data && <div>Total: {data.total_invitations}</div>}
      <button onClick={execute}>Refresh</button>
    </div>
  )
}
```

### usePagination - Paginated lists

```javascript
import { usePagination } from '../hooks/useApi'

function InvitationList() {
  const { data, loading, page, hasMore, nextPage, prevPage } = usePagination(
    invitationService.listInvitations,
    20 // page size
  )

  return (
    <div>
      {data.map(item => <div key={item.id}>{item.email}</div>)}
      <button onClick={prevPage} disabled={page === 0}>Previous</button>
      <button onClick={nextPage} disabled={!hasMore}>Next</button>
    </div>
  )
}
```

### usePolling - Real-time updates

```javascript
import { usePolling } from '../hooks/useApi'

function LiveStats() {
  const { data, loading } = usePolling(
    invitationService.getInvitationStats,
    5000, // poll every 5 seconds
    true  // enabled
  )

  return <div>{data?.total_invitations}</div>
}
```

### useDebouncedApi - Search

```javascript
import { useDebouncedApi } from '../hooks/useApi'

function Search() {
  const { data, loading, execute } = useDebouncedApi(
    invitationService.listInvitations,
    500 // 500ms debounce
  )

  return (
    <input onChange={(e) => execute({ search: e.target.value })} />
  )
}
```

## 🔐 Authentication Context

The AuthContext provides authentication state and methods:

```javascript
import { useAuth } from '../context/AuthContext'

function MyComponent() {
  const {
    // State
    user,
    admin,
    isAuthenticated,
    loading,

    // User methods
    login,
    register,
    logout,
    getCurrentUser,
    updateUserProfile,

    // Admin methods
    adminLogin,
    adminLogout,
    uploadPublicKey,
    getAdminProfile,
  } = useAuth()

  // Use authentication state and methods
}
```

## 🛡️ Error Handling

### Using Error Handler Utilities

```javascript
import {
  formatApiError,
  extractFieldErrors,
  isAuthError,
  isValidationError,
  retryApiCall
} from '../utils/apiErrorHandler'

try {
  await someApiCall()
} catch (error) {
  // Format error for display
  const message = formatApiError(error)

  // Get field-specific errors (for forms)
  const fieldErrors = extractFieldErrors(error)

  // Check error type
  if (isAuthError(error)) {
    // Redirect to login
  }
}

// Retry failed calls
await retryApiCall(
  () => someApiCall(),
  3,    // max retries
  1000  // delay between retries
)
```

## 🔑 Token Management

Tokens are automatically managed:

- **Auto-storage**: Tokens stored in localStorage
- **Auto-injection**: Access token added to all requests
- **Auto-refresh**: Expired tokens automatically refreshed
- **Auto-retry**: Failed requests retried after token refresh

### Manual Token Access

```javascript
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isAuthenticated
} from '../utils/tokenManager'

// Check if authenticated
if (isAuthenticated()) {
  const token = getAccessToken()
}

// Manually clear tokens
clearTokens()
```

## 🌐 API Configuration

Configure API settings in `src/config/api.config.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  API_VERSION: 'v1',
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
}
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | API base URL | `http://localhost:8000` |

## 📖 Complete Documentation

See [API_INTEGRATION_GUIDE.md](API_INTEGRATION_GUIDE.md) for:
- Detailed API usage examples
- Complete authentication flows
- Error handling patterns
- Best practices
- Testing guidelines

## 🧪 Example Components

Check `src/examples/ApiUsageExamples.jsx` for working examples:

1. InvitationStatsExample - Simple API call
2. InvitationListExample - Paginated list
3. LiveStatsExample - Real-time polling
4. InvitationSearchExample - Debounced search
5. CreateInvitationExample - Form submission
6. UserProfileExample - Auth context usage

## 🔥 Features

✅ **Optimized API Client**
- Automatic token management
- Request/response interceptors
- Auto token refresh
- Error handling

✅ **Type-Safe Services**
- Organized by feature
- Clear method signatures
- JSDoc documentation

✅ **Custom Hooks**
- useApi - Basic API calls
- usePagination - Paginated lists
- usePolling - Real-time updates
- useDebouncedApi - Search

✅ **Error Handling**
- Formatted error messages
- Field-specific errors
- Network error detection
- Retry logic

✅ **Token Management**
- Automatic storage
- Auto-refresh
- Secure handling

## 🚦 API Endpoints

All endpoints are configured in `src/config/api.config.js`:

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout

### Admin Authentication
- `POST /api/v1/security/admin/login` - Admin login
- `POST /api/v1/security/admin/upload-public-key` - Upload key
- `GET /api/v1/security/admin/profile` - Get profile
- `POST /api/v1/security/admin/test-signature` - Test signature

### Invitations
- `POST /api/v1/security/central/invitations/` - Create
- `GET /api/v1/security/central/invitations/` - List
- `GET /api/v1/security/central/invitations/stats` - Stats
- `GET /api/v1/security/central/invitations/{id}` - Details
- `POST /api/v1/security/central/invitations/{id}/revoke` - Revoke
- `POST /api/v1/security/central/invitations/cleanup-expired` - Cleanup

## 📝 Notes

- All API calls return Promises
- Errors are automatically formatted
- Tokens are automatically managed
- Network errors are handled gracefully
- Validation errors include field details

## 🔧 Troubleshooting

### API Connection Issues

1. Check `.env` file exists and has correct `VITE_API_BASE_URL`
2. Verify API server is running
3. Check browser console for errors
4. Use browser network tab to inspect requests

### Authentication Issues

1. Check tokens in localStorage
2. Verify token expiration
3. Check API response codes
4. Clear localStorage and re-login

### CORS Issues

If you get CORS errors:
1. Ensure API server allows your origin
2. Check API CORS configuration
3. Verify API base URL is correct

## 📦 Dependencies

- `axios` (^1.6.5) - HTTP client
- `react` (^18.3.1) - UI library
- `react-router-dom` (^6.20.0) - Routing

## 🎯 Next Steps

1. ✅ API integration complete
2. Update Login component to use real API
3. Update Admin login flow
4. Add invitation management UI
5. Implement protected routes
6. Add error boundaries
7. Add loading states
8. Test all flows

## 📄 License

Government of India - National Budget Intelligence Platform
