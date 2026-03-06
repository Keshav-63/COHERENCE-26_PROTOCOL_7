"""
CORS Middleware Configuration
Configures Cross-Origin Resource Sharing for frontend integration
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


def setup_cors(app: FastAPI) -> None:
    """
    Configure CORS middleware for the FastAPI application

    Allows frontend applications to make requests to the API
    from different origins (domains/ports)

    Args:
        app: FastAPI application instance
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=[
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "User-Agent",
            "DNT",
            "Cache-Control",
            "X-Requested-With",
            "X-Signature",  # For admin request signature verification
        ],
        expose_headers=["Content-Length", "X-Total-Count"],
        max_age=3600,  # Cache preflight requests for 1 hour
    )
