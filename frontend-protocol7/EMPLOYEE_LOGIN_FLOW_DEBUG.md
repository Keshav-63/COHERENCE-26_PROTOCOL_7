# Employee Login Flow - Complete Debug Guide

## Step-by-Step Flow

### Step 1: User Opens Login Page
```
URL: http://localhost:5173/login
```

**What happens:**
- Login.jsx renders
- Default role: "admin"
- User clicks "Employee" button to change role

**File:** `src/pages/auth/Login.jsx`
```javascript
const [role, setRole] = useState('admin')

// User clicks Employee button
<button onClick={() => handleRoleChange('employee')}>
  Employee
</button>

const handleRoleChange = (newRole) => {
  setRole(newRole)  // Sets role to "employee"
}
```

**Console check:**
- Should see UI change when Employee is selected
- Role selector should highlight "Employee"

---

### Step 2: User Enters Credentials

**User fills in:**
- Email: `keshavdv241@gmail.com`
- Password: `vVY!fmWVOdr%08HA`

**User clicks:** "Sign In" button

---

### Step 3: Form Validation

**File:** `src/pages/auth/Login.jsx`
```javascript
const validateForm = () => {
  const newErrors = {}
  if (!email || !validateEmail(email))
    newErrors.email = 'Valid email is required'

  if (!password || password.length < 6)
    newErrors.password = 'Password must be at least 6 characters'

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}
```

**Console check:**
- If validation fails, error messages appear
- Check console for validation errors

---

### Step 4: Determine Which Endpoint to Call

**File:** `src/pages/auth/Login.jsx` - handleLogin function

```javascript
const handleLogin = async (e) => {
  e.preventDefault()

  if (!validateForm()) return

  setLoading(true)

  try {
    // Check conditions:
    if (isInvitationLogin) {
      // Has hash in URL → Use invitation flow
      // NOT THIS CASE for employee login
    }
    else if (role === 'employee') {
      // ✅ THIS IS THE EMPLOYEE LOGIN PATH
      console.log('🔐 Using admin login endpoint for employee/state government')

      const response = await adminLogin({
        email,
        temporary_password: password  // ✅ Uses temporary_password field
      })
      // ...
    }
    else {
      // role === 'admin' → Use regular login
      // NOT THIS CASE
    }
  } catch (error) {
    // Handle errors
  }
}
```

**Console check:**
Should see:
```
🔐 Using admin login endpoint for employee/state government
📤 Sending request to: POST /api/v1/security/admin/login
📋 Request payload: { email: "keshavdv241@gmail.com", temporary_password: "vVY***" }
```

**❌ If you DON'T see these logs:**
- Check that `role === 'employee'` (click Employee button)
- Check that `isInvitationLogin === false` (no hash in URL)

---

### Step 5: AuthContext.adminLogin Called

**File:** `src/context/AuthContext.jsx`
```javascript
const adminLogin = async (credentials) => {
  try {
    // Call admin.service.js
    const response = await adminService.adminLogin(credentials)

    // Map role
    const frontendRole = mapBackendRoleToFrontend(response.tenant_type)
    // "state_government" → "employee"

    // Create admin data with role
    const adminData = {
      email: credentials.email,
      tenant_code: response.tenant_code,
      tenant_name: response.tenant_name,
      tenant_type: response.tenant_type,
      requires_public_key: response.requires_public_key,
      backendRole: response.tenant_type,
      role: frontendRole  // ✅ "employee"
    }

    // Store in state
    setAdmin(adminData)
    setIsAuthenticated(true)

    // Store in localStorage
    setStoredAdmin(adminData)

    console.log('✅ Admin data stored in localStorage with role:', frontendRole)
    console.log('💾 Stored admin data:', adminData)

    return { ...response, role: frontendRole }
  }
}
```

**Console check:**
Should see:
```
✅ Admin data stored in localStorage with role: employee
💾 Stored admin data: { email: "...", role: "employee", ... }
```

---

### Step 6: admin.service.js Makes API Call

**File:** `src/services/admin.service.js`
```javascript
export const adminLogin = async (credentials) => {
  try {
    // API call
    const response = await apiClient.post(
      ENDPOINTS.ADMIN.LOGIN,  // 'security/admin/login'
      credentials  // { email, temporary_password }
    )

    // Extract tokens
    const { access_token, refresh_token } = response.data

    // Store tokens
    setTokens({ access_token, refresh_token })

    return response.data
  } catch (error) {
    throw handleAdminError(error)
  }
}
```

**Network check (F12 → Network tab):**
```
Request URL: http://localhost:8000/api/v1/security/admin/login
Request Method: POST
Status Code: 200 OK

Request Payload:
{
  "email": "keshavdv241@gmail.com",
  "temporary_password": "vVY!fmWVOdr%08HA"
}

Response:
{
  "access_token": "eyJhbGciOi...",
  "refresh_token": "eyJhbGciOi...",
  "tenant_code": "MH1",
  "tenant_name": "MH",
  "tenant_type": "state_government",
  "requires_public_key": false
}
```

**❌ If API call fails:**
- Check backend is running on port 8000
- Check CORS is configured
- Check backend accepts `temporary_password` field
- Check credentials are correct

---

### Step 7: Role Mapping

**File:** `src/utils/roleMapper.js`
```javascript
const ROLE_MAP = {
  state_government: 'employee',
  minister: 'employee',
  department: 'employee',
  central_admin: 'admin',
  central_government: 'admin',
}

export const mapBackendRoleToFrontend = (backendRole) => {
  const normalizedRole = backendRole.toLowerCase()
  return ROLE_MAP[normalizedRole] || 'employee'
}
```

**For your case:**
```
Input: "state_government"
Output: "employee"
```

---

### Step 8: localStorage Storage

**What gets stored:**

**localStorage.access_token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**localStorage.refresh_token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**localStorage.admin:**
```json
{
  "email": "keshavdv241@gmail.com",
  "tenant_code": "MH1",
  "tenant_name": "MH",
  "tenant_type": "state_government",
  "requires_public_key": false,
  "backendRole": "state_government",
  "role": "employee"
}
```

**Verify in browser (F12 → Application → Local Storage):**
- ✅ Check `access_token` exists
- ✅ Check `admin` exists
- ✅ Check `admin` has `"role": "employee"`

**❌ If role is missing:**
- The bug is in AuthContext.jsx setStoredAdmin call
- Check import: `import { setStoredAdmin } from '../utils/tokenManager'`

---

### Step 9: Return to Login.jsx

**File:** `src/pages/auth/Login.jsx`
```javascript
const response = await adminLogin({
  email,
  temporary_password: password
})

console.log('✅ Employee login successful!')
console.log('📊 Response:', {
  tenant_code: response.tenant_code,
  tenant_name: response.tenant_name,
  tenant_type: response.tenant_type,
  requires_public_key: response.requires_public_key,
  role: response.role  // Should be "employee"
})

// Verify localStorage
console.log('🔍 Checking localStorage after login...')
const storedAdmin = localStorage.getItem('admin')
const storedAccessToken = localStorage.getItem('access_token')
console.log('💾 Stored admin:', storedAdmin ? JSON.parse(storedAdmin) : 'NOT FOUND')
console.log('🔑 Stored access_token:', storedAccessToken ? 'EXISTS' : 'NOT FOUND')
```

**Console check:**
Should see:
```
✅ Employee login successful!
📊 Response: { ..., role: "employee" }
🔍 Checking localStorage after login...
💾 Stored admin: { role: "employee", ... }
🔑 Stored access_token: EXISTS
```

**❌ If role is undefined:**
- AuthContext didn't return role
- Check AuthContext return statement

---

### Step 10: Determine Redirect Path

**File:** `src/pages/auth/Login.jsx`
```javascript
if (response.requires_public_key) {
  // Redirect to upload key page
  navigate('/admin/upload-key')
} else {
  // Determine dashboard based on role
  const dashboardPath = response.role === 'admin'
    ? '/admin/dashboard'
    : '/employee/dashboard'

  console.log(`🎯 Attempting to redirect to: ${dashboardPath}`)
  console.log(`📍 Current role: ${response.role}`)

  navigate(dashboardPath)

  console.log(`✅ Navigate called with path: ${dashboardPath}`)
}
```

**For your case (requires_public_key: false, role: "employee"):**
```
dashboardPath = '/employee/dashboard'
```

**Console check:**
```
🎯 Attempting to redirect to: /employee/dashboard
📍 Current role: employee
✅ Navigate called with path: /employee/dashboard
```

**❌ If dashboardPath is wrong:**
- Check response.role value
- Check ternary logic

---

### Step 11: Navigate to Dashboard

**React Router navigates to:** `/employee/dashboard`

**File:** `src/App.jsx`
```javascript
<Route
  path="/employee/dashboard"
  element={
    <ProtectedRoute requiredRole="employee">
      <EmployeeHome />
    </ProtectedRoute>
  }
/>
```

---

### Step 12: ProtectedRoute Check

**File:** `src/App.jsx`
```javascript
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, admin, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    console.log('🚫 ProtectedRoute: Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  if (requiredRole) {
    const currentUser = user || admin
    const userRole = currentUser?.role

    console.log('🔒 ProtectedRoute check:', {
      requiredRole,
      userRole,
      backendRole: currentUser?.backendRole,
      isAuthenticated,
      hasUser: !!user,
      hasAdmin: !!admin,
      currentUser: currentUser ? {
        email: currentUser.email,
        role: currentUser.role,
        tenant_type: currentUser.tenant_type
      } : null
    })

    if (userRole !== requiredRole) {
      console.warn(`🚫 Access denied: required "${requiredRole}", user has "${userRole}"`)
      return <Navigate to="/login" replace />
    }

    console.log('✅ Access granted to protected route')
  }

  return children
}
```

**Expected console output:**
```
🔒 ProtectedRoute check: {
  requiredRole: "employee",
  userRole: "employee",
  backendRole: "state_government",
  isAuthenticated: true,
  hasUser: false,
  hasAdmin: true,
  currentUser: {
    email: "keshavdv241@gmail.com",
    role: "employee",
    tenant_type: "state_government"
  }
}
✅ Access granted to protected route
```

**❌ If access is denied:**

**Scenario 1: Not authenticated**
```
🚫 ProtectedRoute: Not authenticated, redirecting to login
```
**Cause:** `isAuthenticated` is `false`
**Check:**
- Is `access_token` in localStorage?
- Is AuthContext loading the admin correctly on mount?

**Scenario 2: Role mismatch**
```
🚫 Access denied: required "employee", user has "undefined"
```
**Cause:** `admin.role` is `undefined`
**Check:**
- Is `admin` object in AuthContext state?
- Does stored admin in localStorage have `role` property?
- Did AuthContext load admin from localStorage correctly?

**Scenario 3: Wrong role**
```
🚫 Access denied: required "employee", user has "admin"
```
**Cause:** Role mapping is wrong
**Check:**
- What is `tenant_type` in response?
- Check roleMapper.js mapping

---

## Complete Debug Checklist

### 1. Before Login
- [ ] Open browser console (F12)
- [ ] Clear localStorage (Application → Clear Site Data)
- [ ] Go to http://localhost:5173/login

### 2. During Login
- [ ] Click "Employee" role button
- [ ] Enter email: `keshavdv241@gmail.com`
- [ ] Enter password: `vVY!fmWVOdr%08HA`
- [ ] Click "Sign In"

### 3. Check Console Logs
Look for these logs IN ORDER:
- [ ] `🔐 Using admin login endpoint for employee/state government`
- [ ] `📤 Sending request to: POST /api/v1/security/admin/login`
- [ ] `📋 Request payload: { email, temporary_password }`
- [ ] `✅ Admin data stored in localStorage with role: employee`
- [ ] `💾 Stored admin data: { ..., role: "employee" }`
- [ ] `✅ Employee login successful!`
- [ ] `📊 Response: { ..., role: "employee" }`
- [ ] `💾 Stored admin: { ..., role: "employee" }`
- [ ] `🔑 Stored access_token: EXISTS`
- [ ] `🎯 Attempting to redirect to: /employee/dashboard`
- [ ] `✅ Navigate called with path: /employee/dashboard`
- [ ] `🔒 ProtectedRoute check: { requiredRole: "employee", userRole: "employee" }`
- [ ] `✅ Access granted to protected route`

### 4. Check Network Tab
- [ ] Open Network tab (F12 → Network)
- [ ] Look for request to `/api/v1/security/admin/login`
- [ ] Check request payload has `temporary_password` field
- [ ] Check response status is 200 OK
- [ ] Check response has `tenant_type`, `access_token`, etc.

### 5. Check localStorage
After login, check Application → Local Storage:
- [ ] `access_token` exists
- [ ] `refresh_token` exists
- [ ] `admin` exists
- [ ] `admin` contains: `{"email":"...","role":"employee",...}`

### 6. Expected Result
- [ ] Redirects to `/employee/dashboard`
- [ ] Dashboard loads (not login page)
- [ ] Refresh page (F5) → stays on dashboard
- [ ] Direct URL access works

---

## Common Issues and Fixes

### Issue 1: "Using regular login endpoint for central admin"
**Symptom:** Console shows wrong endpoint
**Cause:** `role` state is still "admin", not "employee"
**Fix:** Make sure Employee button is clicked before login

### Issue 2: "Access denied: required 'employee', user has 'undefined'"
**Symptom:** Role is undefined in ProtectedRoute
**Cause:** `admin` object doesn't have `role` property
**Fix:** Check AuthContext stores admin with role in localStorage

### Issue 3: "Not authenticated, redirecting to login"
**Symptom:** isAuthenticated is false
**Cause:** Tokens not stored or AuthContext not loading from localStorage
**Fix:**
- Verify tokens in localStorage
- Check AuthContext useEffect loads admin on mount

### Issue 4: API returns 401
**Symptom:** Network shows 401 Unauthorized
**Cause:** Wrong credentials or backend issue
**Fix:**
- Verify email and password are correct
- Check backend accepts `temporary_password` field
- Verify backend endpoint exists

### Issue 5: Navigate called but doesn't redirect
**Symptom:** Console shows navigate called, but stays on login page
**Cause:** ProtectedRoute blocks immediately after redirect
**Fix:**
- This means localStorage isn't updated before ProtectedRoute checks
- Should be fixed by synchronous `setStoredAdmin` import

---

## What to Send Me

If it's still not working, send me:

1. **Complete console output** from login attempt
2. **Network tab screenshot** showing the API request/response
3. **localStorage screenshot** (Application tab → Local Storage)
4. **Which step is failing** from the flow above

This will help me identify exactly where the flow is breaking!
