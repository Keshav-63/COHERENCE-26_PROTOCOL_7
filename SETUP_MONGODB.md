# MongoDB Setup Guide - Quick Reference

## ✅ Application Successfully Converted to MongoDB!

The application now uses **MongoDB** instead of PostgreSQL.

## 🚀 Quick Start (3 steps)

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start MongoDB
**Choose ONE option:**

**A) Use MongoDB Atlas (Easiest - No installation needed!)**
```
1. Go to mongodb.com/cloud/atlas/register
2. Create a FREE cluster (M0)
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Update .env:
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/
   DATABASE_NAME=coherence_db
```

**B) Local MongoDB**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**C) Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. Update .env File
```env
# MongoDB (choose local OR Atlas)
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=coherence_db

# Google OAuth (same as before)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback

# Security
SECRET_KEY=your-secret-key-min-32-characters
SESSION_SECRET_KEY=another-secret-key-min-32-characters

# CORS
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. Run the App
```bash
python run.py
```

Visit: http://localhost:8000/docs

## ✨ What Changed

| Aspect | Before (PostgreSQL) | After (MongoDB) |
|--------|---------------------|-----------------|
| **Database** | PostgreSQL 14+ | MongoDB 6.0+ |
| **Driver** | asyncpg + SQLAlchemy | motor + beanie |
| **User ID** | Integer | String (ObjectId) |
| **Connection** | DATABASE_URL | MONGODB_URL + DATABASE_NAME |
| **Migrations** | Alembic required | Not needed! |

## 📦 Dependencies Changed

**Removed:**
- sqlalchemy
- alembic
- asyncpg
- psycopg2-binary

**Added:**
- motor (async MongoDB driver)
- pymongo (MongoDB Python driver)
- beanie (MongoDB ODM - like SQLAlchemy for MongoDB)

## 🔑 Environment Variables

**Old:**
```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/coherence_db
```

**New:**
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=coherence_db
```

## 🆔 User ID Format Change

**Before:**
```json
{
  "id": 123,
  "email": "user@example.com"
}
```

**After:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com"
}
```

MongoDB uses ObjectId (24-character hex string) instead of integers.

## 🌐 API Endpoints - NO CHANGES!

All endpoints work exactly the same:
- ✅ GET /api/v1/auth/google/login
- ✅ POST /api/v1/auth/google/callback
- ✅ POST /api/v1/auth/refresh
- ✅ GET /api/v1/auth/me
- ✅ POST /api/v1/auth/logout

**Frontend code requires NO changes!** (except user.id is now a string)

## 🔍 Verify MongoDB Connection

```bash
# Open MongoDB shell
mongosh

# Switch to your database
use coherence_db

# View users
db.users.find().pretty()

# Check indexes
db.users.getIndexes()
```

## 📊 View Your Data

**MongoDB Compass (GUI):**
1. Download from mongodb.com/try/download/compass
2. Connect to: mongodb://localhost:27017
3. Browse your data visually

**Command Line:**
```bash
mongosh
use coherence_db
db.users.find()
```

## 🐛 Troubleshooting

### "Connection refused" Error
```bash
# MongoDB not running. Start it:
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### "Module not found" Error
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

### Can't connect to MongoDB Atlas
1. Check username/password in connection string
2. Whitelist your IP: Atlas → Network Access → Add IP Address
3. Ensure database user exists with read/write permissions

### "beanie.exceptions.DocumentNotFound"
This is normal if no users exist yet. Just authenticate via Google and a user will be created!

## 💡 MongoDB Advantages

- ✅ **No migrations needed** - Schema changes are automatic
- ✅ **Flexible schema** - Easy to add new fields
- ✅ **JSON-native** - Perfect for REST APIs
- ✅ **Free cloud hosting** - MongoDB Atlas free tier (512MB)
- ✅ **Horizontal scaling** - Built-in sharding support
- ✅ **Fast development** - No complex ORM queries

## 📝 Code Changes Summary

**Modified Files:**
- `requirements.txt` - New MongoDB dependencies
- `.env.example` - MongoDB connection strings
- `app/core/config.py` - MongoDB URL config
- `app/core/database.py` - Motor/Beanie connection
- `app/models/user.py` - Beanie Document model
- `app/services/user.py` - MongoDB queries
- `app/api/deps.py` - Removed db session dependency
- `app/api/v1/endpoints/auth.py` - Removed db params
- `app/main.py` - MongoDB connection lifecycle
- `app/schemas/user.py` - User ID type (int → str)

**All other files unchanged!**

## 🎯 Next Steps

1. ✅ Install dependencies: `pip install -r requirements.txt`
2. ✅ Start MongoDB (local, Atlas, or Docker)
3. ✅ Update `.env` file
4. ✅ Run: `python run.py`
5. ✅ Test at: http://localhost:8000/docs

## 📚 Learn More

- **MongoDB Docs:** https://docs.mongodb.com/
- **Beanie ODM:** https://beanie-odm.dev/
- **Motor Driver:** https://motor.readthedocs.io/
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas

## ❓ Need Help?

Everything else in the application works exactly the same! The OAuth flow, JWT tokens, and frontend integration are unchanged. Only the database layer was swapped from PostgreSQL to MongoDB.

Happy coding! 🚀
