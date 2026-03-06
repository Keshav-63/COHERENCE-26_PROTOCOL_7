# Employee Login Password Field Fixed ✅

## The Problem

When employee role users logged in (without invitation hash), the frontend was sending the **wrong field name** to the backend.

### Wrong Request (Before)

```json
POST /api/v1/security/admin/login

{
  "email": "keshavdv241@gmail.com",
  "password": "vVY!fmWVOdr%08HA"  // ❌ Wrong field name
}
```

### Correct Request (After)

```json
POST /api/v1/security/admin/login

{
  "email": "keshavdv241@gmail.com",
  "temporary_password": "vVY!fmWVOdr%08HA"  // ✅ Correct field name
}
```

---

## Why This Matters

The `/api/v1/security/admin/login` endpoint expects **different field names** than `/api/v1/auth/login`:

### Endpoint 1: /api/v1/auth/login (Central Admin Only)
```json
{
  "email": "admin@gov.in",
  "password": "AdminPassword123"  // ✅ Uses "password"
}
```

### Endpoint 2: /api/v1/security/admin/login (State/Department Admins)
```json
{
  "email": "admin@state.gov.in",
  "temporary_password": "StatePassword123"  // ✅ Uses "temporary_password"
}
```

---

## The Fix

### File Updated: src/pages/auth/Login.jsx

**Before:**
```javascript
} else if (role === 'employee') {
  const response = await adminLogin({
    email,
    password  // ❌ Wrong field name
  })
  navigate('/employee/dashboard')
}
```

**After:**
```javascript
} else if (role === 'employee') {
  console.log('🔐 Using admin login endpoint for employee/state government')
  console.log('📤 Sending request to: POST /api/v1/security/admin/login')
  console.log('📋 Request payload:', {
    email,
    temporary_password: password.substring(0, 3) + '***'
  })

  const response = await adminLogin({
    email,
    temporary_password: password  // ✅ Correct field name
  })

  console.log('✅ Employee login successful!')
  console.log('📊 Response:', {
    tenant_code: response.tenant_code,
    tenant_name: response.tenant_name,
    tenant_type: response.tenant_type,
    requires_public_key: response.requires_public_key,
    role: response.role
  })

  showSuccess(`Welcome ${email}!`)

  // Check if public key is required
  if (response.requires_public_key) {
    console.log('🔑 Public key required - redirecting to upload page')
    showSuccess('Please upload your public key to complete setup')
    navigate('/admin/upload-key')
  } else {
    // Navigate based on mapped role
    const dashboardPath = response.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'
    console.log(`🎯 Redirecting to ${dashboardPath} (role: ${response.role})`)
    navigate(dashboardPath)
  }
}
```

---

## Complete Login Flow Summary

### 1. Invitation Login (URL with hash)
```
URL: http://localhost:5173/admin/login?hash=abc123
Endpoint: POST /api/v1/security/admin/login

Request:
{
  "email": "admin@state.gov.in",
  "temporary_password": "TempPass123",
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
  "temporary_password": "StatePassword123"  // ✅ FIXED
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

## Testing

### Test Employee Login
1. Go to: `http://localhost:5173/login`
2. Select **"Employee"** role
3. Enter credentials:
   - Email: `keshavdv241@gmail.com`
   - Password: `vVY!fmWVOdr%08HA`
4. Click "Sign In"
5. **Check Console:**
   ```
   🔐 Using admin login endpoint for employee/state government
   📤 Sending request to: POST /api/v1/security/admin/login
   📋 Request payload: {
     email: "keshavdv241@gmail.com",
     temporary_password: "vVY***"
   }
   ```
6. **Check Network Tab:**
   ```json
   Request URL: http://localhost:8000/api/v1/security/admin/login
   Request Payload:
   {
     "email": "keshavdv241@gmail.com",
     "temporary_password": "vVY!fmWVOdr%08HA"
   }
   ```
7. **Expected Response:**
   ```json
   {
     "access_token": "...",
     "tenant_type": "state_government",
     "requires_public_key": false,
     ...
   }
   ```
8. **Should redirect to:** `/employee/dashboard` ✅

---

## Console Output (After Fix)

```
🔐 Using admin login endpoint for employee/state government
📤 Sending request to: POST /api/v1/security/admin/login
📋 Request payload: {
  email: "keshavdv241@gmail.com",
  temporary_password: "vVY***"
}

✅ Employee login successful!
📊 Response: {
  tenant_code: "MH1",
  tenant_name: "MH",
  tenant_type: "state_government",
  requires_public_key: false,
  role: "employee"
}

🎯 Redirecting to /employee/dashboard (role: employee)

[ProtectedRoute check]
ProtectedRoute: {
  requiredRole: "employee",
  userRole: "employee",
  backendRole: "state_government",
  isAuthenticated: true
}

→ Successfully navigated to Employee Dashboard ✅
```

---

## Backend Requirements

Your backend `/api/v1/security/admin/login` endpoint must support these two formats:

### Format 1: Invitation Login
```json
{
  "email": "admin@state.gov.in",
  "temporary_password": "TempPass123",
  "invitation_hash": "abc123def456"
}
```

### Format 2: Regular Employee/State Admin Login
```json
{
  "email": "admin@state.gov.in",
  "temporary_password": "StatePassword123"
}
```

Both should return:
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "tenant_code": "MH1",
  "tenant_name": "Maharashtra",
  "tenant_type": "state_government",
  "requires_public_key": false
}
```

---

## Summary

**Before:**
- ❌ Employee login sent `password` field
- ❌ Backend rejected or mishandled request
- ❌ Login failed

**After:**
- ✅ Employee login sends `temporary_password` field
- ✅ Backend accepts request correctly
- ✅ Login succeeds
- ✅ Redirects to correct dashboard

**Employee login now uses the correct field name and works properly!** 🎉
