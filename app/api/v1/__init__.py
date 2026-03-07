"""API version 1"""

from fastapi import APIRouter
from app.api.v1.endpoints import auth, predictive_modeling, analytics, predictions
from app.security.api import security_router
from app.intelligence.api.intelligence import router as intelligence_router

api_router = APIRouter()

# Include authentication routes
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Include predictive modeling routes
api_router.include_router(predictive_modeling.router, prefix="/predictive-modeling", tags=["Predictive Modeling"])

# Include analytics routes
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(predictions.router, prefix="/analytics", tags=["Analytics Predictions"])

# Include security routes (multi-tenancy, invitations, admin auth)
api_router.include_router(security_router)

# Include PRAHARI Intelligence routes
api_router.include_router(
    intelligence_router,
    prefix="/intelligence",
    tags=["PRAHARI Intelligence"],
)

# Include Fund Flow Knowledge Graph routes
from app.fund_flow.api.fund_flow import router as fund_flow_router
api_router.include_router(
    fund_flow_router,
    prefix="/fund-flow",
    tags=["Fund Flow Knowledge Graph"],
)

# Include Citizen Chatbot routes
from app.chatbot.api.chatbot import router as chatbot_router
api_router.include_router(
    chatbot_router,
    prefix="/chatbot",
    tags=["Citizen Chatbot"],
)

# Include Budget Reallocation routes
from app.reallocation.api.reallocation import router as reallocation_router
api_router.include_router(
    reallocation_router,
    tags=["Budget Reallocation"],
)
