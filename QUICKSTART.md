# Quick Start Guide

Get up and running with the Coherence OAuth2 API in 5 minutes.

## Prerequisites Check

```bash
# Check Python version (need 3.10+)
python --version

# Check MongoDB (if installed locally)
mongosh --version
# or
mongo --version
```

## 1. Install Dependencies (1 minute)

```bash
# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install packages
pip install -r requirements.txt
```

## 2. Setup Google OAuth (2 minutes)

1. Go to https://console.cloud.google.com/
2. Create new project → APIs & Services → Credentials
3. Click "+ CREATE CREDENTIALS" → OAuth 2.0 Client ID
4. Configure consent screen (External, add app name)
5. Create OAuth client:
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:8000/api/v1/auth/google/callback`
6. Copy **Client ID** and **Client Secret**

## 3. Setup MongoDB (1 minute)

```bash
# Option 1: Local MongoDB (if installed)
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Test connection
mongosh

# Option 2: MongoDB Atlas (Free Cloud - EASIEST!)
# 1. Go to mongodb.com/cloud/atlas
# 2. Create free account + cluster
# 3. Get connection string
# Use in .env: MONGODB_URL=mongodb+srv://...

# Option 3: Docker (Quick!)
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## 4. Configure Environment (1 minute)

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` and set these **required** values:

```env
# MongoDB Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=coherence_db
# For Atlas: mongodb+srv://username:password@cluster.mongodb.net/

# Security (generate random strings)
SECRET_KEY=put-any-random-string-here-min-32-chars-long-abc123xyz
SESSION_SECRET_KEY=another-random-string-min-32-chars-long-def456uvw

# Google OAuth (from step 2)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Everything else can use defaults
```

## 5. Run the Application (30 seconds)

```bash
# Start the server
python run.py
```

Open http://localhost:8000/docs to see the API documentation!

## Test the Authentication

### Using Swagger UI (Easiest)

1. Go to http://localhost:8000/docs
2. Find `GET /api/v1/auth/google/login`
3. Click "Try it out" → "Execute"
4. Copy the `authorization_url` from the response
5. Open that URL in a new tab
6. Sign in with Google
7. Copy the `code` from the redirect URL
8. Back in Swagger, find `POST /api/v1/auth/google/callback`
9. Click "Try it out", paste the code
10. Execute → You'll get your JWT tokens!

### Using cURL

```bash
# 1. Get authorization URL
curl http://localhost:8000/api/v1/auth/google/login

# 2. Open the URL in browser, sign in, copy the code from redirect

# 3. Exchange code for tokens
curl -X POST http://localhost:8000/api/v1/auth/google/callback \
  -H "Content-Type: application/json" \
  -d '{"code": "YOUR_CODE_HERE"}'

# 4. Use the access token
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Frontend Integration (React Example)

Create a simple React app to test:

```bash
npx create-react-app my-app
cd my-app
npm start
```

Add this to `src/App.js`:

```javascript
import { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = async () => {
    const response = await fetch('http://localhost:8000/api/v1/auth/google/login');
    const data = await response.json();
    window.location.href = data.authorization_url;
  };

  useEffect(() => {
    // Handle callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      fetch('http://localhost:8000/api/v1/auth/google/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      .then(res => res.json())
      .then(data => {
        localStorage.setItem('access_token', data.access_token);
        setUser(data.user);
        window.history.replaceState({}, document.title, "/");
      });
    }
  }, []);

  return (
    <div style={{ padding: '50px' }}>
      <h1>Coherence OAuth2 Demo</h1>
      {user ? (
        <div>
          <img src={user.profile_picture} alt={user.full_name} style={{ borderRadius: '50%' }} />
          <h2>Welcome, {user.full_name}!</h2>
          <p>Email: {user.email}</p>
          <button onClick={() => {
            localStorage.clear();
            setUser(null);
          }}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Sign in with Google</button>
      )}
    </div>
  );
}

export default App;
```

Don't forget to update CORS in `.env`:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Troubleshooting

### Port already in use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

### Database connection failed
```bash
# Check if PostgreSQL is running
# Windows
pg_ctl status

# macOS/Linux
sudo service postgresql status
```

### Google OAuth redirect mismatch
- Make sure the redirect URI in Google Console **exactly** matches:
  ```
  http://localhost:8000/api/v1/auth/google/callback
  ```
- No trailing slash!
- Must be http:// for localhost (https:// for production)

### ModuleNotFoundError
```bash
# Make sure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt
```

## Next Steps

1. Read the full [README.md](README.md) for detailed documentation
2. Check [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) for production-ready frontend code
3. Customize the User model in `app/models/user.py`
4. Add more endpoints in `app/api/v1/endpoints/`
5. Deploy to production (see README for deployment guide)

## Useful Commands

```bash
# Run server
python run.py

# Run with custom port
uvicorn app.main:app --port 8080

# View database tables
psql -U postgres -d coherence_db -c "\dt"

# Reset database (careful!)
psql -U postgres -c "DROP DATABASE coherence_db;"
psql -U postgres -c "CREATE DATABASE coherence_db;"
```

## Support

Need help? Check:
- API Docs: http://localhost:8000/docs
- README: [README.md](README.md)
- Frontend Guide: [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)

Happy coding! 🚀
