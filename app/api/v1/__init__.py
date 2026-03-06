"""API version 1"""

from fastapi import APIRouter
from app.api.v1.endpoints import auth, predictive_modeling
from app.security.api import security_router

api_router = APIRouter()

# Include authentication routes
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Include predictive modeling routes
api_router.include_router(predictive_modeling.router, prefix="/predictive-modeling", tags=["Predictive Modeling"])

# Include security routes (multi-tenancy, invitations, admin auth)
api_router.include_router(security_router)
