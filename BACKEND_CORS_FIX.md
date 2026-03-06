# Backend CORS Fix Guide

## 🔴 Current Error

```
Access to XMLHttpRequest at 'http://localhost:8000/api/v1/auth/me'
from origin 'http://localhost:5173' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Solution: Configure CORS on Backend

Your backend needs to allow requests from the frontend origin (`http://localhost:5173`).

---

## For FastAPI Backend

### Option 1: Quick Fix (Development Only)

Add CORS middleware to allow all origins:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (DEV ONLY!)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

⚠️ **WARNING**: `allow_origins=["*"]` is for development only!

### Option 2: Production-Ready Fix (Recommended)

Specify exact origins:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS Configuration
origins = [
    "http://localhost:5173",      # Vite dev server
    "http://localhost:3000",      # Alternative port
    "http://127.0.0.1:5173",      # IPv4 localhost
    "http://127.0.0.1:3000",
    # Add production URLs when deploying
    # "https://your-production-domain.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)
```

### Full Example

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Budget Intelligence API",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Your routes here
@app.get("/health")
async def health():
    return "OK"

# ... rest of your app
```

---

## For Express.js Backend

Install CORS package:

```bash
npm install cors
```

Configure CORS:

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Your routes here
app.get('/health', (req, res) => {
  res.send('OK');
});

app.listen(8000, () => {
  console.log('Server running on port 8000');
});
```

---

## For Django Backend

Install django-cors-headers:

```bash
pip install django-cors-headers
```

Add to `settings.py`:

```python
INSTALLED_APPS = [
    # ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add this at the top
    'django.middleware.common.CommonMiddleware',
    # ... other middleware
]

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

---

## Testing CORS Fix

### 1. Restart Backend Server

After adding CORS configuration, restart your backend:

```bash
# FastAPI example
uvicorn main:app --reload --port 8000

# Express example
npm start

# Django example
python manage.py runserver 8000
```

### 2. Test in Browser

Open browser console and test:

```javascript
fetch('http://localhost:8000/health')
  .then(r => r.text())
  .then(console.log)
  .catch(console.error)

// Should return "OK" without CORS error
```

### 3. Check Response Headers

In browser DevTools → Network tab → Click the request → Headers:

Look for these response headers:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
```

---

## 🔴 Additional Error: 500 Internal Server Error

You also have a 500 error on `/auth/me`:

```
GET http://localhost:8000/api/v1/auth/me net::ERR_FAILED 500 (Internal Server Error)
```

### Common Causes:

1. **Database connection issue**
2. **JWT token decoding error**
3. **User not found in database**
4. **Missing dependencies**

### To Debug:

1. **Check backend logs** for the error traceback
2. **Test endpoint directly:**
   ```bash
   curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
        http://localhost:8000/api/v1/auth/me
   ```
3. **Check database connection**
4. **Verify JWT token is valid**

---

## Environment-Specific CORS

### Development (.env.development)
```python
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]
```

### Production (.env.production)
```python
CORS_ORIGINS = [
    "https://your-domain.com",
    "https://www.your-domain.com",
]
```

### Dynamic Configuration

```python
import os
from typing import List

# Get allowed origins from environment variable
ALLOWED_ORIGINS: List[str] = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Verifying CORS is Fixed

### Before Fix:
```
❌ Access to XMLHttpRequest blocked by CORS policy
```

### After Fix:
```
✅ 200 OK
✅ Response received successfully
✅ No CORS errors in console
```

---

## Frontend Changes (Already Done)

I've updated the frontend to:
1. ✅ Skip automatic user refresh on mount (avoids CORS error on page load)
2. ✅ User data is loaded from localStorage instead
3. ✅ Fresh data will be fetched on next API call (after backend is fixed)

---

## Quick Checklist

- [ ] Backend CORS middleware added
- [ ] Frontend origin (`http://localhost:5173`) added to allowed origins
- [ ] `allow_credentials=True` set (for cookies/auth)
- [ ] Backend server restarted
- [ ] CORS headers visible in Network tab
- [ ] No CORS errors in console
- [ ] Fix 500 error on `/auth/me` endpoint

---

## Need More Help?

Check your backend framework's specific CORS documentation:
- **FastAPI**: https://fastapi.tiangolo.com/tutorial/cors/
- **Express**: https://expressjs.com/en/resources/middleware/cors.html
- **Django**: https://github.com/adamchainz/django-cors-headers

---

## Summary

**The Issue:** Backend doesn't allow requests from frontend origin.

**The Fix:** Add CORS middleware to backend allowing `http://localhost:5173`.

**Result:** Frontend can successfully make API calls to backend! ✅
