"""Middleware components"""

from app.middleware.cors import setup_cors
from app.middleware.error_handler import setup_error_handlers

__all__ = ["setup_cors", "setup_error_handlers"]
