"""
Citizen Chatbot Session and Message Models
Tracks chat conversations with location context
"""

from datetime import datetime
from typing import Optional, List
from beanie import Document
from pydantic import Field


class ChatMessage(Document):
    """Individual chat message in a conversation"""

    session_id: str = Field(..., description="Reference to parent chat session")
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Location context at the time of message
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # Metadata
    tokens_used: Optional[int] = None
    model_used: Optional[str] = None

    class Settings:
        name = "chat_messages"
        indexes = [
            "session_id",
            "timestamp",
        ]


class ChatSession(Document):
    """Chat session for a citizen user"""

    # Session identification
    session_id: str = Field(..., description="Unique session identifier")
    user_id: Optional[str] = None  # If user is authenticated

    # Location context for this session
    latitude: float = Field(..., description="User latitude")
    longitude: float = Field(..., description="User longitude")
    location_name: Optional[str] = None  # Human-readable location

    # Session metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime = Field(default_factory=datetime.utcnow)

    # Session state
    is_active: bool = True
    message_count: int = 0

    class Settings:
        name = "chat_sessions"
        indexes = [
            "session_id",
            "user_id",
            "created_at",
        ]
