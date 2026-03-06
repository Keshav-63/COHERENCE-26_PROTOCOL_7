# API Integration Troubleshooting Guide

## Common Issues and Solutions

### 🔴 Issue: `ERR_NAME_NOT_RESOLVED`

**Error:**
```
POST https://api.budgetintelligence.gov.in/api/v1/auth/login net::ERR_NAME_NOT_RESOLVED
```

**Cause:** The `.env` file doesn't exist or hasn't been loaded.

**Solution:**

1. Create `.env` file in project root:
   ```bash
   cp .env.example .env
   ```

2. Verify `.env` content:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. **IMPORTANT:** Restart your dev server:
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

4. Environment variables are loaded only on server start!

---

### 🔴 Issue: `Network error. Please check your connection.`

**Error in console:**
```
Network error. Please check your connection.
```

**Possible Causes:**

1. **Backend not running**
   ```bash
   # Start your backend server
   # It should be running on the port specified in .env
   ```

2. **Wrong port in .env**
   - Check backend is actually running on port 8000
   - Or update `.env` to correct port

3. **Firewall blocking**
   - Allow localhost connections
   - Check antivirus/firewall settings

**Solution:**

1. Check if backend is running:
   ```bash
   curl http://localhost:8000/health
   # Should return: "OK" or similar
   ```

2. Verify `.env` matches backend port:
   ```env
   VITE_API_BASE_URL=http://localhost:8000  # Update port if needed
   ```

3. Restart frontend dev server after `.env` changes

---

### 🔴 Issue: CORS Error

**Error:**
```
Access to XMLHttpRequest at 'http://localhost:8000/api/v1/auth/login'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Cause:** Backend doesn't allow your frontend origin.

**Solution:**

**See [BACKEND_CORS_FIX.md](./BACKEND_CORS_FIX.md) for complete guide!**

Quick fix - Update backend CORS settings to allow `http://localhost:5173`:

```python
# FastAPI example
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**After adding CORS middleware:**
1. Restart your backend server
2. Refresh frontend
3. CORS error should be gone!

---

### 🔴 Issue: `401 Unauthorized`

**Error:**
```
401 Unauthorized - Invalid credentials
```

**Possible Causes:**

1. **Wrong email/password**
2. **User doesn't exist in database**
3. **Backend authentication issue**

**Solution:**

1. Verify user exists in backend database
2. Check email/password are correct
3. Test with backend directly:
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password123"}'
   ```

4. Check backend logs for error details

---

### 🔴 Issue: `422 Validation Error`

**Error:**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**Cause:** Request data doesn't match API schema.

**Solution:**

1. Check required fields in API documentation
2. Verify data format matches expected schema
3. Common issues:
   - Email format invalid
   - Password too short (min 8 chars)
   - Missing required fields

---

### 🔴 Issue: Token Not Being Sent

**Symptom:** API returns 401 even though user is logged in.

**Cause:** Access token not in request headers.

**Solution:**

1. Check token exists in localStorage:
   ```javascript
   // Browser console
   localStorage.getItem('access_token')
   ```

2. Verify API client interceptor is working:
   - Check Network tab
   - Look for `Authorization: Bearer <token>` header

3. If token missing, re-login:
   ```javascript
   const { logout } = useAuth()
   await logout()
   // Login again
   ```

---

### 🔴 Issue: Token Refresh Loop

**Symptom:** Endless refresh token requests.

**Cause:** Refresh token is invalid/expired.

**Solution:**

1. Clear all tokens:
   ```javascript
   localStorage.clear()
   ```

2. Login again to get fresh tokens

3. Check token expiration settings in backend

---

### 🔴 Issue: Component Not Updating After API Call

**Symptom:** Data fetched but UI doesn't update.

**Cause:** State not being updated properly.

**Solution:**

1. Use the custom hooks:
   ```javascript
   import { useApi } from '../hooks/useApi'

   const { data, loading, error } = useApi(apiFunction, true)
   ```

2. Or update state manually:
   ```javascript
   const [data, setData] = useState(null)

   useEffect(() => {
     const fetchData = async () => {
       const result = await someApiCall()
       setData(result)  // Update state
     }
     fetchData()
   }, [])
   ```

---

### 🔴 Issue: "Module not found" Error

**Error:**
```
Module not found: Can't resolve '../services/auth.service'
```

**Cause:** File path incorrect or service not created.

**Solution:**

1. Check all service files exist:
   ```
   src/services/
   ├── api.client.js
   ├── auth.service.js
   ├── admin.service.js
   ├── invitation.service.js
   └── index.js
   ```

2. Verify import path is correct
3. Restart dev server

---

## Debugging Checklist

When API calls fail, check in this order:

1. ✅ **Environment Setup**
   - [ ] `.env` file exists
   - [ ] `VITE_API_BASE_URL` is correct
   - [ ] Dev server restarted after `.env` changes

2. ✅ **Backend Status**
   - [ ] Backend server is running
   - [ ] Backend is on correct port
   - [ ] Backend health endpoint responds

3. ✅ **Network Request**
   - [ ] Check browser Network tab
   - [ ] Look for request to backend
   - [ ] Check request payload
   - [ ] Check response status/body

4. ✅ **Authentication**
   - [ ] Tokens in localStorage
   - [ ] Authorization header in requests
   - [ ] Token not expired

5. ✅ **CORS**
   - [ ] No CORS errors in console
   - [ ] Backend allows frontend origin

---

## Testing API Connection

### 1. Test Backend Directly

```bash
# Health check
curl http://localhost:8000/health

# Test login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### 2. Test from Browser Console

```javascript
// Test API base URL
console.log(import.meta.env.VITE_API_BASE_URL)

// Test API call
fetch('http://localhost:8000/health')
  .then(r => r.text())
  .then(console.log)

// Test login
fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
})
.then(r => r.json())
.then(console.log)
```

### 3. Check Tokens

```javascript
// Browser console
console.log({
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  user: localStorage.getItem('user')
})
```

---

## Environment Variables

### Check Current Environment

```javascript
// Browser console
console.log('API URL:', import.meta.env.VITE_API_BASE_URL)
console.log('Mode:', import.meta.env.MODE)
console.log('Dev:', import.meta.env.DEV)
```

### Environment Priority

Vite loads env files in this order (higher priority = later):

1. `.env` - All environments
2. `.env.local` - All environments (ignored by git)
3. `.env.[mode]` - Mode-specific (.env.development, .env.production)
4. `.env.[mode].local` - Mode-specific local

### Remember: Restart After Changes!

```bash
# Always restart dev server after .env changes
npm run dev
```

---

## Still Having Issues?

1. **Check browser console** for error messages
2. **Check Network tab** for failed requests
3. **Check backend logs** for API errors
4. **Clear localStorage** and try again
5. **Restart everything:**
   ```bash
   # Kill backend
   # Kill frontend
   # Start backend
   # Start frontend
   ```

---

## Get Help

- Review [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)
- Check [API_README.md](./API_README.md)
- Review example code in [src/examples/ApiUsageExamples.jsx](./src/examples/ApiUsageExamples.jsx)
