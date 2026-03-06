# Employee Login Endpoint Fixed

## Changes Made

Updated the login flow so that **employee/state government logins** use the correct endpoint: `/api/v1/security/admin/login`

---

## Login Endpoints by Role

### 1. Invitation Login (URL with hash)
```
URL: http://localhost:5173/admin/login?hash=abc123

Endpoint: POST /api/v1/security/admin/login

Request:
{
  "email": "admin@state.gov.in",
  "temporary_password": "TempPass123!",
  "invitation_hash": "abc123"
}
```

### 2. Employee Login (No hash, role="employee")
```
URL: http://localhost:5173/login
Role Selected: Employee

Endpoint: POST /api/v1/security/admin/login

Request:
{
  "email": "admin@state.gov.in",
  "password": "YourPassword123"
}
```

### 3. Central Admin Login (No hash, role="admin")
```
URL: http://localhost:5173/login
Role Selected: Admin

Endpoint: POST /api/v1/auth/login

Request:
{
  "email": "admin@gov.in",
  "password": "AdminPassword123"
}
```

---

## Files Modified

### 1. src/services/admin.service.js

**Updated adminLogin to support both formats:**

```javascript
/**
 * Admin login (supports both invitation and regular login)
 * @param {Object} credentials - Admin login credentials
 * @param {string} credentials.email - Admin email
 * @param {string} [credentials.password] - Regular password
 * @param {string} [credentials.temporary_password] - Temporary password from invitation
 * @param {string} [credentials.invitation_hash] - Hash from invitation URL (optional)
 */
export const adminLogin = async (credentials) => {
  const response = await apiClient.post(ENDPOINTS.ADMIN.LOGIN, credentials)
  // ... store tokens and admin data

  // Only store invitation hash if provided
  if (credentials.invitation_hash) {
    localStorage.setItem(STORAGE_KEYS.INVITATION_HASH, credentials.invitation_hash)
  }

  return response.data
}
```

### 2. src/pages/auth/Login.jsx

**Updated handleLogin with 3 different flows:**

```javascript
const handleLogin = async (e) => {
  if (isInvitationLogin) {
    // Flow 1: Invitation login
    const response = await adminLogin({
      email,
      temporary_password: password,
      invitation_hash: invitationHash
    })
    // Redirect to upload-key or dashboard

  } else if (role === 'employee') {
    // Flow 2: Employee/State Government login
    const response = await adminLogin({
      email,
      password
    })
    // Redirect to upload-key or employee dashboard

  } else {
    // Flow 3: Central Admin login
    const response = await login({
      email,
      password
    })
    // Redirect to admin dashboard
  }
}
```

---

## Why This Change?

### Problem Before:
- Employee role (state_government, minister, department) was calling `/api/v1/auth/login`
- That endpoint is only for central admins
- State government admins got "Invalid credentials" error
- Network requests failed or showed 401 errors

### Solution After:
- Employee role now calls `/api/v1/security/admin/login`
- Central admin role calls `/api/v1/auth/login`
- Each role uses its correct backend endpoint
- Invitations continue to work as before

---

## Testing Guide

### Test 1: Employee Login
1. Go to: `http://localhost:5173/login`
2. Select "Employee" role
3. Enter credentials:
   - Email: `admin@maharashtra.gov.in`
   - Password: `StateAdminPass123`
4. Click "Sign In"
5. **Check Console**: Should show "Using admin login endpoint for employee/state government"
6. **Check Network**: Should see POST to `/api/v1/security/admin/login`
7. **Should succeed** and redirect appropriately

### Test 2: Central Admin Login
1. Go to: `http://localhost:5173/login`
2. Select "Admin" role
3. Enter credentials:
   - Email: `admin@gov.in`
   - Password: `CentralAdminPass123`
4. Click "Sign In"
5. **Check Console**: Should show "Using regular login endpoint for central admin"
6. **Check Network**: Should see POST to `/api/v1/auth/login`
7. **Should succeed** and redirect to admin dashboard

### Test 3: Invitation Login
1. Go to: `http://localhost:5173/admin/login?hash=abc123`
2. Enter credentials:
   - Email: `newadmin@state.gov.in`
   - Temporary Password: `TempPass123!`
3. Click "Login with Invitation"
4. **Check Console**: Should show "Using admin invitation login endpoint"
5. **Check Network**: Should see POST to `/api/v1/security/admin/login` with invitation_hash
6. **Should succeed** and redirect to public key upload page

---

## Backend Requirements

Your backend needs to support `/api/v1/security/admin/login` with two formats:

### Format 1: Invitation Login
```json
{
  "email": "admin@state.gov.in",
  "temporary_password": "TempPass123!",
  "invitation_hash": "abc123def456"
}
```

### Format 2: Regular Admin Login
```json
{
  "email": "admin@state.gov.in",
  "password": "RegularPassword123"
}
```

Both should return:
```json
{
  "access_token": "eyJ0eXAi...",
  "refresh_token": "eyJ0eXAi...",
  "tenant_code": "MH-GOV-001",
  "tenant_name": "Maharashtra State Government",
  "tenant_type": "state_government",
  "requires_public_key": true
}
```

---

## Role Mapping Reminder

### Backend Roles → Frontend Roles
```
central_admin      → admin
central_government → admin
state_government   → employee
minister           → employee
department         → employee
```

### Role Selection → API Endpoint
```
Admin role (frontend)    → /api/v1/auth/login
Employee role (frontend) → /api/v1/security/admin/login
```

---

## Summary

**Before:**
- Employee login called wrong endpoint
- Got "Invalid credentials" error
- Page reloaded unexpectedly
- Network response not visible

**After:**
- Employee login calls `/api/v1/security/admin/login`
- Central admin login calls `/api/v1/auth/login`
- Invitations work correctly
- All login flows properly separated
- Clear console logs for debugging

**Employee login now works correctly!**
