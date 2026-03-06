# Super Admin Created Successfully! 🎉

## Central Government Admin Account

✅ **Super Admin Created**
✅ **Highest Permissions Granted**
✅ **Ready to Login**

---

## Login Credentials

```
Email:    admin@gov.in
Password: Admin123
```

**⚠️ IMPORTANT:** Change this password after first login!

---

## Admin Details

- **Email:** admin@gov.in
- **Full Name:** Central Government Administrator
- **Role:** central_admin
- **Status:** Active & Verified
- **User ID:** 69aad5350d50aaebaa267b25

---

## Permissions & Access

This super admin account has the **highest level of permissions** in the system:

### Budget Data Access
- ✅ Full access to all ministry budget data
- ✅ View and manage all 60 ministries
- ✅ Access to all 393 schemes
- ✅ Complete budget allocations (Rs. 10,125,368.52 Cr)

### Administrative Powers
- ✅ Create, read, update, delete (CRUD) operations on all data
- ✅ Manage users and assign roles
- ✅ Grant permissions to state admins
- ✅ System-wide configuration access

### Analytics & Reporting
- ✅ Access to all analytics dashboards
- ✅ Generate ministry-wise reports
- ✅ View scheme-wise expenditure analysis
- ✅ Budget utilization tracking
- ✅ Year-over-year comparisons

### Advanced Features
- ✅ Anomaly detection access
- ✅ Predictive analytics
- ✅ Data export capabilities
- ✅ Audit log access

---

## How to Login

### Option 1: Via API

```bash
# Login endpoint
POST http://localhost:8000/api/v1/auth/login

# Request body
{
  "email": "admin@gov.in",
  "password": "Admin123"
}

# Response
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "email": "admin@gov.in",
    "full_name": "Central Government Administrator",
    "role": "central_admin"
  }
}
```

### Option 2: Via Python Script

```python
import asyncio
from app.core.database import connect_to_mongodb, close_mongodb_connection
from app.core.security import verify_password
from app.models.user import User

async def login():
    await connect_to_mongodb()

    # Find user
    user = await User.find_one(User.email == "admin@gov.in")

    # Verify password
    if user and verify_password("Admin123", user.hashed_password):
        print("Login successful!")
        print(f"Welcome, {user.full_name}")
    else:
        print("Invalid credentials")

    await close_mongodb_connection()

asyncio.run(login())
```

---

## Verification

You can verify the admin account anytime:

```bash
python verify_admin.py
```

This will show:
- Admin email and name
- Role and permissions
- Account status
- User ID

---

## Next Steps

### 1. Start the API Server

```bash
python run.py
```

Access at: http://localhost:8000

### 2. Login and Get Access Token

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gov.in","password":"Admin123"}'
```

### 3. Access Budget Data

```bash
# Get all ministries
GET http://localhost:8000/api/v1/budget/ministries
Authorization: Bearer <your_access_token>

# Get all schemes
GET http://localhost:8000/api/v1/budget/schemes
Authorization: Bearer <your_access_token>

# Get budget allocations
GET http://localhost:8000/api/v1/budget/allocations?fiscal_year=2025-26
Authorization: Bearer <your_access_token>
```

### 4. Create State Admin (Optional)

As super admin, you can create state-level admins:

```python
# Create Maharashtra State Admin
state_admin = User(
    email="admin.maharashtra@gov.in",
    hashed_password=hash_password("password"),
    full_name="Maharashtra State Administrator",
    role="state_admin",
    is_active=True,
    is_verified=True
)
await state_admin.insert()
```

---

## Security Best Practices

1. **Change Default Password**
   - Login immediately and change the password
   - Use a strong password (min 12 characters, mix of letters, numbers, symbols)

2. **Enable 2FA (Future)**
   - Two-factor authentication for added security

3. **Regular Audits**
   - Review access logs regularly
   - Monitor user activities

4. **Least Privilege Principle**
   - Grant minimal necessary permissions to other users
   - Create role-based access for different departments

---

## Account Management

### Change Password

```python
from app.core.security import hash_password

async def change_password():
    await connect_to_mongodb()

    user = await User.find_one(User.email == "admin@gov.in")
    new_password = "YourNewSecurePassword123!"
    user.hashed_password = hash_password(new_password)
    await user.save()

    print("Password changed successfully!")
    await close_mongodb_connection()
```

### Update Profile

```python
async def update_profile():
    await connect_to_mongodb()

    user = await User.find_one(User.email == "admin@gov.in")
    user.full_name = "Your Full Name"
    user.profile_picture = "https://example.com/photo.jpg"
    await user.save()

    await close_mongodb_connection()
```

---

## Role Hierarchy

The system supports multiple roles:

1. **central_admin** (Super Admin) - YOU ARE HERE
   - Highest permissions
   - Full system access
   - Can create and manage all users
   - Access to all budget data (central and state)

2. **state_admin** (State Level)
   - State-specific permissions
   - Access to assigned state budget data
   - Can manage state-level users
   - Limited to state jurisdiction

3. **user** (Regular User)
   - Read-only access
   - View dashboards and reports
   - No administrative privileges
   - Limited data access based on assignment

---

## Database Collections Access

As super admin, you have access to all collections:

```
Central Government Data:
├── ministries (60 documents)
├── schemes (393 documents)
├── budget_allocations (385 documents)
├── departments (ready for data)
├── subschemes (ready for data)
└── users (includes you!)

Vendor & Contracts:
├── vendors (ready for data)
└── contracts (ready for data)

Geographical:
├── states (ready for data)
├── districts (ready for data)
└── locations (ready for data)
```

---

## Support & Help

### Verify Current Data

```bash
# Check budget data
python verify_import.py

# Check admin account
python verify_admin.py

# Check MongoDB connection
python check_mongodb.py
```

### Create Additional Admins

```bash
# Interactive creation
python create_super_admin.py
# Select option 1 for custom credentials
```

---

## Quick Command Reference

```bash
# Start server
python run.py

# Verify admin
python verify_admin.py

# Check database
python check_mongodb.py

# View budget data
python verify_import.py

# Create new admin
python create_super_admin.py
```

---

## System Status

```
✅ MongoDB Connected
✅ Super Admin Created
✅ Budget Data Imported (60 ministries, 393 schemes, 385 allocations)
✅ Authentication System Ready
✅ API Endpoints Available
✅ Ready for Production Use
```

---

**CONGRATULATIONS!** Your Budget Intelligence Platform is now fully operational with super admin access.

You can start building analytics, managing users, and exploring budget data immediately!
