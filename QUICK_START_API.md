# Quick Start - API Integration

## ✅ What's Been Done

The API integration is complete! Here's what was implemented:

- ✅ API client with automatic token refresh
- ✅ All authentication services (user & admin)
- ✅ Invitation management services
- ✅ Error handling utilities
- ✅ Custom React hooks for API calls
- ✅ Updated AuthContext with real API
- ✅ Updated Login component to use real API
- ✅ Environment configuration

## 🚀 Next Steps to Get Started

### 1. **Restart Your Dev Server**

The `.env` file was just created, so you need to restart Vite:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. **Make Sure Your Backend is Running**

The frontend is configured to connect to:
```
http://localhost:8000
```

If your backend runs on a different port, update the `.env` file:

```env
# Change this to match your backend
VITE_API_BASE_URL=http://localhost:3000
```

### 3. **Test the Login**

1. Open `http://localhost:5173` (or your dev server URL)
2. Go to the login page
3. Enter valid credentials from your backend
4. Click "Sign In"

**Expected behavior:**
- ✅ API call to `POST http://localhost:8000/api/v1/auth/login`
- ✅ Tokens stored in localStorage
- ✅ User data saved
- ✅ Redirect to dashboard

### 4. **Check the Network Tab**

Open browser DevTools (F12) → Network tab to see API calls:

```
POST /api/v1/auth/login
  Request: { email, password }
  Response: { access_token, refresh_token, user }
```

## 🔧 Troubleshooting

### Error: `ERR_NAME_NOT_RESOLVED`

**Problem:** Can't resolve the API domain
**Solution:**
- Check if `.env` file exists
- Restart dev server
- Verify `VITE_API_BASE_URL` is correct

### Error: `Network error`

**Problem:** Can't connect to backend
**Solution:**
- Make sure backend is running on port 8000
- Check for CORS issues
- Verify backend URL in `.env`

### Error: `401 Unauthorized`

**Problem:** Invalid credentials
**Solution:**
- Check email/password are correct
- Verify user exists in backend database
- Check backend logs for errors

### CORS Error

If you get CORS errors, your backend needs to allow your frontend origin:

```python
# Backend CORS settings should include:
allow_origins = ["http://localhost:5173", "http://localhost:3000"]
```

## 📝 Current Setup

### Environment (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
```

### Login Flow (Updated)
```javascript
// Login.jsx now uses real API
const response = await login({ email, password })
// Tokens automatically stored
// User data available in AuthContext
```

### Token Management
- Access token automatically added to all requests
- Refresh token automatically used when access token expires
- Logout clears all tokens

## 🎯 What Works Now

### User Login
```javascript
import { useAuth } from './context/AuthContext'

const { login } = useAuth()
await login({ email, password })
```

### Get Current User
```javascript
const { getCurrentUser } = useAuth()
await getCurrentUser()
```

### Logout
```javascript
const { logout } = useAuth()
await logout()
```

### Admin Login (for invitation-based admins)
```javascript
const { adminLogin } = useAuth()
await adminLogin({
  email,
  temporary_password,
  invitation_hash
})
```

## 📚 Documentation

- **Full Guide:** [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)
- **API Reference:** [API_README.md](./API_README.md)
- **Examples:** [src/examples/ApiUsageExamples.jsx](./src/examples/ApiUsageExamples.jsx)

## 🔍 Verify Setup

Run these checks:

1. ✅ `.env` file exists
2. ✅ Backend is running on correct port
3. ✅ Dev server restarted
4. ✅ Can access login page
5. ✅ Network tab shows API calls

## 🎉 You're Ready!

Try logging in with a real user account. The frontend will now communicate with your backend API!

## 💡 Tips

- Use browser DevTools Network tab to debug API calls
- Check console for error messages
- Tokens are stored in localStorage (check Application tab)
- API errors are automatically formatted and displayed

---

**Need Help?**
- Check browser console for errors
- Verify backend is running
- Review API documentation
- Check network tab for failed requests