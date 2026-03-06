# Role Mapping Guide

## Problem

The backend returns role `"central_admin"` but the frontend expects `"admin"` for routing.

**Backend Response:**
```json
{
  "user": {
    "role": "central_admin"  // ← Backend role
  }
}
```

**Frontend Routes:**
```javascript
<ProtectedRoute requiredRole="admin">  // ← Expects "admin"
```

## Solution

Created a role mapping system that automatically converts backend roles to frontend roles.

## Role Mapping

### Backend → Frontend

| Backend Role | Frontend Role | Access |
|-------------|---------------|--------|
| `central_admin` | `admin` | Admin Dashboard |
| `central_government` | `admin` | Admin Dashboard |
| `state_government` | `employee` | Employee Dashboard |
| `state_admin` | `employee` | Employee Dashboard |
| `minister` | `employee` | Employee Dashboard |
| `department` | `employee` | Employee Dashboard |
| `employee` | `employee` | Employee Dashboard |
| `admin` | `admin` | Admin Dashboard |

## How It Works

### 1. **Login Process**

```javascript
// User logs in
const response = await login({ email, password })

// Backend returns: { role: "central_admin" }

// AuthContext maps it automatically:
{
  role: "admin",           // ← Frontend role (for routing)
  backendRole: "central_admin"  // ← Original backend role (preserved)
}
```

### 2. **Protected Routes**

```javascript
// Routes check against mapped frontend role
<ProtectedRoute requiredRole="admin">
  // Checks if user.role === "admin" ✅
</ProtectedRoute>
```

### 3. **Navigation**

```javascript
// Login.jsx navigates based on mapped role
if (userRole === 'admin') {
  navigate('/admin/dashboard')  // ✅ Works for central_admin
} else {
  navigate('/employee/dashboard')
}
```

## Files Changed

### 1. **src/utils/roleMapper.js** (NEW)
Role mapping utility with helper functions:
```javascript
mapBackendRoleToFrontend('central_admin') // Returns 'admin'
isAdminRole('central_admin') // Returns true
getRoleDisplayName('central_admin') // Returns 'Central Government Admin'
```

### 2. **src/context/AuthContext.jsx**
Maps role during login:
```javascript
const login = async (credentials) => {
  const response = await authService.login(credentials)

  // Map backend role to frontend role
  const userWithMappedRole = {
    ...response.user,
    backendRole: response.user.role,  // Keep original
    role: mapBackendRoleToFrontend(response.user.role)  // Map to frontend
  }

  setUser(userWithMappedRole)
}
```

### 3. **src/App.jsx**
ProtectedRoute uses mapped role:
```javascript
const ProtectedRoute = ({ children, requiredRole }) => {
  const userRole = user?.role  // This is already mapped to 'admin' or 'employee'

  if (userRole !== requiredRole) {
    return <Navigate to="/login" />
  }

  return children
}
```

### 4. **src/pages/auth/Login.jsx**
Navigation uses mapped role:
```javascript
const userRole = response.user?.role  // Already mapped by AuthContext

if (userRole === 'admin') {
  navigate('/admin/dashboard')  // ✅ Works!
}
```

## Testing

### Check Role Mapping

Open browser console after login:

```javascript
// Login successful: {
//   user: {
//     role: "admin",                // ← Mapped frontend role
//     backendRole: "central_admin", // ← Original backend role
//     email: "admin@gov.in"
//   }
// }

// Navigating with role: {
//   frontendRole: "admin",
//   backendRole: "central_admin"
// }

// ProtectedRoute: {
//   requiredRole: "admin",
//   userRole: "admin",             // ← Match! ✅
//   backendRole: "central_admin",
//   isAuthenticated: true
// }
```

## Adding New Roles

To add support for new backend roles:

### 1. Update Role Mapper

Edit `src/utils/roleMapper.js`:

```javascript
const ROLE_MAP = {
  // Add new mapping
  new_backend_role: 'admin',  // or 'employee'

  // Existing mappings...
  central_admin: 'admin',
  state_government: 'employee',
}
```

### 2. Update Display Names

```javascript
const roleNames = {
  new_backend_role: 'New Role Display Name',
  // ...
}
```

That's it! The role will automatically work throughout the app.

## Benefits

✅ **Automatic Mapping** - Happens during login, no manual conversion needed

✅ **Preserved Original** - Backend role is saved as `backendRole` for reference

✅ **Flexible** - Easy to add new role mappings

✅ **Consistent** - All routes use the same mapped roles

✅ **Debuggable** - Console logs show both frontend and backend roles

## Current Behavior

### For `central_admin` users:
1. Login with email/password
2. Backend returns `role: "central_admin"`
3. Frontend maps to `role: "admin"`
4. Redirects to `/admin/dashboard` ✅
5. ProtectedRoute allows access ✅

### For `state_government` users:
1. Login with email/password
2. Backend returns `role: "state_government"`
3. Frontend maps to `role: "employee"`
4. Redirects to `/employee/dashboard` ✅
5. ProtectedRoute allows access ✅

## Troubleshooting

### Issue: Still can't access dashboard

**Check console logs:**
```javascript
// Should see these logs after login:
Login successful: { user: { role: "admin", backendRole: "central_admin" } }
Navigating with role: { frontendRole: "admin", backendRole: "central_admin" }
ProtectedRoute: { requiredRole: "admin", userRole: "admin" }
```

**If role is not mapped:**
- Check if backend role exists in `ROLE_MAP`
- Add missing role to `src/utils/roleMapper.js`
- Restart dev server

### Issue: Wrong dashboard redirect

**Check:**
- Console log shows correct `frontendRole`
- Login.jsx navigation logic uses mapped role
- Not using the UI role selector value (we removed that)

## Summary

The role mapping system ensures that **any backend role** can be automatically mapped to the correct **frontend role** (`admin` or `employee`), making routing and access control work seamlessly.

**Backend roles** → **Mapped to** → **Frontend roles** → **Correct dashboard** ✅
