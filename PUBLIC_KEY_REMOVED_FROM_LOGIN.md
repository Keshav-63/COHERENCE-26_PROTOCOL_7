# Public Key Removed from Login Page

## Changes Made

Removed the public key input field from the Login page for state government and other admins.

### Why This Change?

**Before:** The Login page had a confusing public key field for "employee" role users that didn't make sense.

**After:** Public key upload is now handled separately through the dedicated PublicKeyUpload page after invitation login.

---

## What Was Removed

### 1. Public Key State Variable
```javascript
// REMOVED
const [publicKey, setPublicKey] = useState('')
```

### 2. Public Key Validation
```javascript
// REMOVED from validateForm()
if (role === 'employee' && !publicKey)
  newErrors.publicKey = 'Public key is required for employees'
```

### 3. Public Key Input Field
```javascript
// REMOVED from form
{!isInvitationLogin && role === 'employee' && (
  <Input
    label="Public Key"
    type="text"
    placeholder="Paste your public key"
    value={publicKey}
    onChange={(e) => {
      setPublicKey(e.target.value)
      if (errors.publicKey) setErrors({ ...errors, publicKey: '' })
    }}
    error={errors.publicKey}
  />
)}
```

### 4. Confusing Footer Text
```javascript
// REMOVED
<p className="text-xs text-neutral-500 mt-2">
  {role === 'employee' && 'You need an invitation link to access this portal'}
</p>
```

---

## How Public Key Upload Works Now

### Correct Flow for State Government Admins:

```
1. Central admin creates invitation
   ↓
2. State admin receives email with:
   - Dashboard URL: http://localhost:5173/admin/login?hash=abc123
   - Temporary password
   ↓
3. State admin clicks URL and logs in
   - Uses Login page (/admin/login?hash=abc123)
   - NO public key field shown
   - Enters email + temporary password only
   ↓
4. Backend responds with requires_public_key: true
   ↓
5. Frontend redirects to /admin/upload-key
   ↓
6. State admin uploads public key on dedicated page
   - File upload option (.pub files)
   - Manual paste option
   - Instructions for SSH key generation
   ↓
7. Redirect to /admin/dashboard
```

---

## Why the Old Approach Was Wrong

### Problem 1: Wrong Timing
- Login page was asking for public key BEFORE authentication
- But public key upload should happen AFTER successful invitation login

### Problem 2: Confusing UX
- State government admins saw "employee" role (due to frontend role mapping)
- Asked them to enter public key during login
- But they didn't have one yet!

### Problem 3: Incorrect Flow
- Public key should be uploaded via dedicated endpoint: `/api/v1/security/admin/upload-public-key`
- Not sent during login to `/api/v1/auth/login` or `/api/v1/security/admin/login`

---

## Current Login Page Behavior

### For Invitation Login (URL with hash)
```
URL: http://localhost:5173/admin/login?hash=abc123

Shows:
- "Admin Invitation" header
- Email field
- Temporary Password field
- "Login with Invitation" button
- Blue info box about invitation

Hides:
- Role selector
- Public key field
- OAuth button
```

### For Regular Login (No hash)
```
URL: http://localhost:5173/login

Shows:
- "Budget Intelligence" header
- Role selector (Admin/Employee)
- Email field
- Password field
- "Sign In" button
- OAuth button

Hides:
- Public key field (REMOVED)
- Invitation info box
```

---

## Files Modified

### src/pages/auth/Login.jsx
- Removed `publicKey` state
- Removed public key validation
- Removed public key input field
- Removed confusing footer text
- Simplified login flow

---

## Testing

### Test Regular Admin Login
1. Go to: `http://localhost:5173/login`
2. Select "Admin" role
3. Enter email and password
4. Click "Sign In"
5. Should NOT see public key field
6. Should login successfully

### Test Employee Login
1. Go to: `http://localhost:5173/login`
2. Select "Employee" role
3. Enter email and password
4. Click "Sign In"
5. Should NOT see public key field
6. Should login successfully

### Test Invitation Login
1. Go to: `http://localhost:5173/admin/login?hash=abc123`
2. Enter email and temporary password
3. Click "Login with Invitation"
4. Should NOT see public key field during login
5. Should redirect to `/admin/upload-key`
6. Upload public key on dedicated page

---

## Summary

**Removed:**
- Public key input field from Login page
- Public key state and validation
- Confusing "employee needs invitation" text

**Result:**
- Cleaner login experience
- Correct flow: Login first, then upload key
- No confusion about when/where to enter public key
- Dedicated PublicKeyUpload page handles key upload properly

**Public key upload is now handled correctly through the invitation flow, not during login!**
