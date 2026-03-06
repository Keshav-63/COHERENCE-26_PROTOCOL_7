# Project Structure Overview

Detailed explanation of the project architecture and file organization.

## Directory Tree

```
Coherence-project/
│
├── app/                                    # Main application package
│   ├── __init__.py                        # Package initializer
│   ├── main.py                            # Application entry point & FastAPI app
│   │
│   ├── api/                               # API layer
│   │   ├── __init__.py
│   │   ├── deps.py                        # Shared dependencies (auth, db session)
│   │   └── v1/                            # API version 1
│   │       ├── __init__.py                # API router aggregation
│   │       └── endpoints/                 # API endpoints
│   │           ├── __init__.py
│   │           └── auth.py                # Authentication endpoints
│   │
│   ├── core/                              # Core utilities
│   │   ├── __init__.py
│   │   ├── config.py                      # Configuration management
│   │   ├── database.py                    # Database connection & session
│   │   └── security.py                    # JWT & password utilities
│   │
│   ├── models/                            # SQLAlchemy database models
│   │   ├── __init__.py
│   │   └── user.py                        # User database model
│   │
│   ├── schemas/                           # Pydantic schemas
│   │   ├── __init__.py
│   │   └── user.py                        # User request/response schemas
│   │
│   ├── services/                          # Business logic layer
│   │   ├── __init__.py
│   │   ├── oauth.py                       # Google OAuth2 service
│   │   └── user.py                        # User service
│   │
│   └── middleware/                        # Middleware components
│       ├── __init__.py
│       ├── cors.py                        # CORS configuration
│       └── error_handler.py               # Global error handling
│
├── .env.example                           # Environment variables template
├── .gitignore                             # Git ignore rules
├── requirements.txt                       # Python dependencies
├── run.py                                 # Simple run script
├── README.md                              # Project documentation
├── QUICKSTART.md                          # Quick start guide
├── FRONTEND_INTEGRATION.md                # Frontend integration guide
└── PROJECT_STRUCTURE.md                   # This file
```

## File Descriptions

### Root Files

#### `requirements.txt`
Python dependencies with pinned versions for reproducibility.

**Key dependencies:**
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `sqlalchemy` - ORM for database
- `google-auth` - Google OAuth2 client
- `python-jose` - JWT token handling
- `pydantic` - Data validation

#### `.env.example`
Template for environment variables. Copy to `.env` and fill with actual values.

**Contains:**
- Database connection URL
- Secret keys for JWT
- Google OAuth credentials
- CORS origins
- Application settings

#### `run.py`
Simple script to run the application. Easier than typing the full uvicorn command.

```python
python run.py
```

### Application Core (`app/`)

#### `app/main.py`
**Purpose:** Application entry point and FastAPI app instance

**Responsibilities:**
- Create FastAPI application
- Configure middleware (CORS, error handling)
- Include API routers
- Define lifespan events (startup/shutdown)
- Database initialization
- Root endpoints (health check)

**Key Features:**
- Automatic database table creation on startup
- Proper cleanup on shutdown
- Swagger/ReDoc documentation endpoints
- Environment-based configuration

#### `app/core/config.py`
**Purpose:** Centralized configuration management

**Implementation:**
- Uses Pydantic Settings for type-safe config
- Loads from environment variables
- Validates required fields
- Provides sensible defaults

**DRY Principle:**
- Single source of truth for configuration
- Reused across entire application via `settings` instance

#### `app/core/database.py`
**Purpose:** Database connection and session management

**Features:**
- Async SQLAlchemy engine
- Connection pooling
- Session factory
- Dependency injection for route handlers

**DRY Principle:**
- `get_db()` dependency reused in all endpoints
- Automatic session lifecycle management
- Consistent error handling (rollback on exception)

#### `app/core/security.py`
**Purpose:** Security utilities (JWT, password hashing)

**Functions:**
- `create_access_token()` - Generate access tokens
- `create_refresh_token()` - Generate refresh tokens
- `verify_token()` - Validate and decode tokens
- `hash_password()` - Bcrypt password hashing
- `verify_password()` - Password verification

**DRY Principle:**
- Single implementation for all JWT operations
- Reused across authentication flows
- Centralized security logic

### Models (`app/models/`)

#### `app/models/user.py`
**Purpose:** User database model (SQLAlchemy ORM)

**Fields:**
- `id` - Primary key
- `email` - Unique user email
- `full_name` - User's full name
- `profile_picture` - Avatar URL
- `google_id` - Google OAuth ID
- `oauth_provider` - OAuth provider name
- `is_active` - Account status
- `is_verified` - Email verification status
- `created_at`, `updated_at`, `last_login` - Timestamps

**Design:**
- Ready for multi-provider OAuth (can add Facebook, GitHub, etc.)
- Soft delete capable (via `is_active`)
- Automatic timestamp management

### Schemas (`app/schemas/`)

#### `app/schemas/user.py`
**Purpose:** Pydantic schemas for request/response validation

**Schemas:**
- `UserBase` - Common user fields
- `UserCreate` - User creation data
- `UserResponse` - User data for frontend (excludes sensitive fields)
- `UserInDB` - Complete user data with internal fields
- `TokenResponse` - Authentication token response
- `GoogleAuthRequest` - OAuth callback request
- `GoogleUserInfo` - Google user data structure

**DRY Principle:**
- Inheritance for common fields (`UserBase`)
- Reused across different operations
- Type-safe data validation

### Services (`app/services/`)

#### `app/services/oauth.py`
**Purpose:** Google OAuth2 authentication service

**Methods:**
- `get_authorization_url()` - Generate Google login URL
- `exchange_code_for_token()` - Exchange auth code for tokens
- `get_user_info()` - Fetch user data from Google
- `verify_id_token()` - Validate Google ID tokens
- `refresh_access_token()` - Refresh expired tokens

**DRY Principle:**
- Single service instance (`google_oauth_service`)
- All Google API interactions in one place
- Reusable across endpoints

#### `app/services/user.py`
**Purpose:** User business logic and database operations

**Methods:**
- `get_user_by_id()` - Fetch user by ID
- `get_user_by_email()` - Fetch user by email
- `get_user_by_google_id()` - Fetch user by Google ID
- `create_user()` - Create new user
- `update_last_login()` - Update login timestamp
- `get_or_create_user()` - Smart user creation/retrieval

**DRY Principle:**
- Reusable database queries
- Business logic separated from routes
- Single source of truth for user operations

### API Layer (`app/api/`)

#### `app/api/deps.py`
**Purpose:** Reusable FastAPI dependencies

**Dependencies:**
- `get_current_user()` - Extract and validate user from JWT
- `get_current_active_user()` - Ensure user is active

**DRY Principle:**
- Used via `Depends()` in protected routes
- Single implementation for authentication
- Automatic token validation

#### `app/api/v1/endpoints/auth.py`
**Purpose:** Authentication endpoints

**Endpoints:**
- `GET /auth/google/login` - Get Google auth URL
- `POST /auth/google/callback` - Handle OAuth callback
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user info
- `POST /auth/logout` - Logout user

**Design:**
- Frontend-friendly responses
- Detailed docstrings for API docs
- Error handling with meaningful messages
- Integration examples in docstrings

### Middleware (`app/middleware/`)

#### `app/middleware/cors.py`
**Purpose:** CORS configuration for frontend integration

**Features:**
- Configurable allowed origins from environment
- Credentials support for cookies
- Common HTTP methods and headers
- Preflight request caching

#### `app/middleware/error_handler.py`
**Purpose:** Global error handling

**Handlers:**
- Validation errors → 422 with detailed field errors
- Database errors → 500 with safe error message
- General exceptions → 500 with logging

**Benefits:**
- Consistent error responses
- Security (no sensitive data in errors)
- Centralized logging

## Architecture Patterns

### Layered Architecture

```
┌─────────────────────────────────────┐
│   API Layer (endpoints/auth.py)    │  ← HTTP requests/responses
├─────────────────────────────────────┤
│   Service Layer (services/*.py)    │  ← Business logic
├─────────────────────────────────────┤
│   Model Layer (models/*.py)         │  ← Database access
├─────────────────────────────────────┤
│   Database (PostgreSQL)             │  ← Data storage
└─────────────────────────────────────┘
```

### Dependency Injection

FastAPI's dependency injection is used throughout:

```python
# Database session injection
async def endpoint(db: AsyncSession = Depends(get_db)):
    ...

# Authentication injection
async def endpoint(user: User = Depends(get_current_user)):
    ...
```

### DRY Principles Applied

1. **Configuration** - Single `settings` instance
2. **Database** - Reusable `get_db()` dependency
3. **Security** - Centralized JWT functions
4. **Services** - Singleton service instances
5. **Schemas** - Inherited Pydantic models
6. **Error Handling** - Global middleware

## Data Flow Example

### User Authentication Flow

```
1. Frontend calls /auth/google/login
   ↓
2. API returns Google authorization URL
   ↓
3. User authenticates with Google
   ↓
4. Google redirects with code
   ↓
5. Frontend sends code to /auth/google/callback
   ↓
6. oauth.py exchanges code for Google token
   ↓
7. oauth.py fetches user info from Google
   ↓
8. user.py creates/updates user in database
   ↓
9. security.py creates JWT tokens
   ↓
10. API returns JWT + user data to frontend
```

## Extension Points

### Adding New OAuth Providers

1. Create new service in `app/services/` (e.g., `github_oauth.py`)
2. Add endpoints in `app/api/v1/endpoints/auth.py`
3. Update User model if needed
4. Add configuration to `.env.example`

### Adding New Endpoints

1. Create new file in `app/api/v1/endpoints/`
2. Import and include router in `app/api/v1/__init__.py`
3. Use existing dependencies for auth and database

### Adding New Models

1. Create model in `app/models/`
2. Create schemas in `app/schemas/`
3. Create service in `app/services/`
4. Create endpoints in `app/api/v1/endpoints/`

## Best Practices Implemented

✅ **Type Safety** - Pydantic for validation, type hints everywhere
✅ **Async/Await** - Full async support for better performance
✅ **Error Handling** - Global handlers with proper logging
✅ **Security** - JWT tokens, password hashing, CORS
✅ **Documentation** - Auto-generated API docs, code comments
✅ **Configuration** - Environment-based, validated settings
✅ **Separation of Concerns** - Layered architecture
✅ **DRY Principle** - No code duplication
✅ **SOLID Principles** - Single responsibility, dependency injection
✅ **Production Ready** - Logging, error handling, database pooling

## Development Workflow

1. **Add Feature** → Create/modify files in appropriate layer
2. **Test Locally** → Run `python run.py` and test in Swagger
3. **Update Docs** → Docstrings auto-generate API docs
4. **Commit** → Git commit with descriptive message
5. **Deploy** → Follow deployment guide in README

## Scaling Considerations

- **Horizontal Scaling** - Stateless design (JWT tokens)
- **Database Pooling** - Already configured in database.py
- **Caching** - Add Redis for session/token storage
- **Load Balancing** - Works with multiple instances
- **Monitoring** - Add Sentry/DataDog integration
