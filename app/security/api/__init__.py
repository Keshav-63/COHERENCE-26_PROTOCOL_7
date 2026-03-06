"""
Security API Endpoints
"""

from fastapi import APIRouter

from app.security.api.central_admin import router as central_admin_router
from app.security.api.admin_auth import router as admin_auth_router

# Aggregate all security routers
security_router = APIRouter(prefix="/security")

security_router.include_router(central_admin_router)
security_router.include_router(admin_auth_router)

__all__ = ["security_router"]
