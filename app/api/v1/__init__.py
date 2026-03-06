"""API version 1"""

from fastapi import APIRouter
from app.api.v1.endpoints import auth
from app.security.api import security_router
from app.intelligence.api.intelligence import router as intelligence_router

api_router = APIRouter()

# Include authentication routes
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Include security routes (multi-tenancy, invitations, admin auth)
api_router.include_router(security_router)

# Include PRAHARI Intelligence routes
api_router.include_router(
    intelligence_router,
    prefix="/intelligence",
    tags=["PRAHARI Intelligence"],
)
