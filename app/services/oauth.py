"""
Google OAuth2 Service
Handles Google OAuth2 authentication flow and token exchange
"""

from typing import Dict, Any, Optional
import httpx
from google.oauth2 import id_token
from google.auth.transport import requests

from app.core.config import settings
from app.schemas.user import GoogleUserInfo


class GoogleOAuthService:
    """Service for handling Google OAuth2 authentication"""

    GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
    GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
    GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"

    def __init__(self):
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET
        self.redirect_uri = settings.GOOGLE_REDIRECT_URI

    def get_authorization_url(self, state: Optional[str] = None) -> str:
        """
        Generate Google OAuth2 authorization URL

        Args:
            state: Optional state parameter for CSRF protection

        Returns:
            Authorization URL for redirecting users to Google login
        """
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent",
        }

        if state:
            params["state"] = state

        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{self.GOOGLE_AUTH_URL}?{query_string}"

    async def exchange_code_for_token(self, code: str, redirect_uri: Optional[str] = None) -> Dict[str, Any]:
        """
        Exchange authorization code for access token

        Args:
            code: Authorization code from Google OAuth callback
            redirect_uri: Optional redirect URI override

        Returns:
            Dictionary containing access_token, refresh_token, and other token data

        Raises:
            httpx.HTTPError: If token exchange fails
        """
        token_data = {
            "code": code,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "redirect_uri": redirect_uri or self.redirect_uri,
            "grant_type": "authorization_code",
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(self.GOOGLE_TOKEN_URL, data=token_data)
            response.raise_for_status()
            return response.json()

    async def get_user_info(self, access_token: str) -> GoogleUserInfo:
        """
        Fetch user information from Google using access token

        Args:
            access_token: Google OAuth2 access token

        Returns:
            GoogleUserInfo schema with user data

        Raises:
            httpx.HTTPError: If user info request fails
        """
        headers = {"Authorization": f"Bearer {access_token}"}

        async with httpx.AsyncClient() as client:
            response = await client.get(self.GOOGLE_USERINFO_URL, headers=headers)
            response.raise_for_status()
            user_data = response.json()

        return GoogleUserInfo(**user_data)

    def verify_id_token(self, token: str) -> Dict[str, Any]:
        """
        Verify Google ID token

        Args:
            token: Google ID token to verify

        Returns:
            Decoded token payload

        Raises:
            ValueError: If token is invalid
        """
        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                self.client_id
            )

            # Verify issuer
            if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
                raise ValueError("Invalid token issuer")

            return idinfo
        except Exception as e:
            raise ValueError(f"Invalid ID token: {str(e)}")

    async def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """
        Refresh access token using refresh token

        Args:
            refresh_token: Google OAuth2 refresh token

        Returns:
            Dictionary containing new access_token and expiration data

        Raises:
            httpx.HTTPError: If token refresh fails
        """
        token_data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(self.GOOGLE_TOKEN_URL, data=token_data)
            response.raise_for_status()
            return response.json()


# Singleton instance
google_oauth_service = GoogleOAuthService()
