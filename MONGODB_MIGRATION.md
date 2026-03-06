# MongoDB Migration Guide

The application has been updated to use **MongoDB** instead of PostgreSQL.

## What Changed

### Database
- ❌ **PostgreSQL/SQLAlchemy** → ✅ **MongoDB/Beanie**
- User ID format changed from `int` to `string` (MongoDB ObjectId)
- No database sessions needed (MongoDB driver handles connections)

### Dependencies
- Added: `motor`, `pymongo`, `beanie`
- Removed: `sqlalchemy`, `alembic`, `asyncpg`, `psycopg2-binary`

### Environment Variables
**Old (.env):**
```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/coherence_db
```

**New (.env):**
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=coherence_db
```

## MongoDB Setup

### Option 1: Local MongoDB

**Install MongoDB:**
- Windows: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
- macOS: `brew install mongodb-community`
- Linux: `sudo apt-get install mongodb` or `sudo yum install mongodb-org`

**Start MongoDB:**
```bash
# Windows (as service)
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Verify it's running:**
```bash
mongosh
# or older versions:
mongo
```

### Option 2: MongoDB Atlas (Cloud - Free Tier)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create a free cluster
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Update `.env`:
   ```env
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   DATABASE_NAME=coherence_db
   ```

### Option 3: Docker

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Update Your .env File

```bash
cp .env.example .env
```

Then edit `.env`:
```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=coherence_db

# Rest of the config remains the same...
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
# ...
```

## API Changes

### User ID Type
**Before (PostgreSQL):**
```python
user_id: int
```

**After (MongoDB):**
```python
user_id: str  # MongoDB ObjectId as string
```

### Example Response
```json
{
  "id": "507f1f77bcf86cd799439011",  // MongoDB ObjectId
  "email": "user@example.com",
  "full_name": "John Doe",
  // ...
}
```

## No Code Changes Needed!

The API endpoints remain exactly the same:
- ✅ `GET /api/v1/auth/google/login`
- ✅ `POST /api/v1/auth/google/callback`
- ✅ `POST /api/v1/auth/refresh`
- ✅ `GET /api/v1/auth/me`
- ✅ `POST /api/v1/auth/logout`

Frontend integration code doesn't need any changes!

## Running the Application

```bash
# Install updated dependencies
pip install -r requirements.txt

# Make sure MongoDB is running
mongosh  # test connection

# Run the app
python run.py
```

## Verify MongoDB Connection

```bash
# Connect to MongoDB shell
mongosh

# Switch to your database
use coherence_db

# Check collections
show collections

# View users
db.users.find().pretty()
```

## Database Indexes

Beanie automatically creates indexes defined in the User model:
- `email` - unique index
- `google_id` - unique, sparse index

## Benefits of MongoDB

- ✅ **Flexible schema** - Easy to add new fields
- ✅ **No migrations** - Schema changes don't require migrations
- ✅ **Native JSON** - Perfect for REST APIs
- ✅ **Horizontal scaling** - Built-in sharding
- ✅ **Fast development** - No ORM complexity
- ✅ **Free cloud hosting** - MongoDB Atlas free tier

## Troubleshooting

### "Connection refused" error
MongoDB not running. Start it:
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### "Authentication failed" (MongoDB Atlas)
- Check username/password in connection string
- Whitelist your IP in Atlas console
- Ensure database user has read/write permissions

### Import errors
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

## Data Migration (PostgreSQL → MongoDB)

If you have existing PostgreSQL data:

```python
# migration_script.py
import asyncio
import asyncpg
from motor.motor_asyncio import AsyncIOMotorClient

async def migrate():
    # Connect to PostgreSQL
    pg_conn = await asyncpg.connect('postgresql://...')

    # Connect to MongoDB
    mongo_client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = mongo_client['coherence_db']

    # Fetch users from PostgreSQL
    users = await pg_conn.fetch('SELECT * FROM users')

    # Insert into MongoDB
    for user in users:
        await db.users.insert_one({
            'email': user['email'],
            'full_name': user['full_name'],
            'profile_picture': user['profile_picture'],
            'google_id': user['google_id'],
            'oauth_provider': user['oauth_provider'],
            'is_active': user['is_active'],
            'is_verified': user['is_verified'],
            'created_at': user['created_at'],
            'updated_at': user['updated_at'],
            'last_login': user['last_login']
        })

    print(f"Migrated {len(users)} users")

asyncio.run(migrate())
```

## Questions?

Everything else works exactly the same! The API, authentication flow, and frontend integration are unchanged.
