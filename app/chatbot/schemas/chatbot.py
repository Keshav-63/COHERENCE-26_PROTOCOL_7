"""
Chatbot API Schemas
Request and response models for citizen chatbot
"""

from typing import Optional, List, Dict
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Chatbot query request"""

    query: str = Field(..., description="User's question about public finance/budget")
    latitude: float = Field(..., description="User's current latitude")
    longitude: float = Field(..., description="User's current longitude")


class ChatResponse(BaseModel):
    """Chatbot response"""

    answer: str = Field(..., description="AI-generated answer")
    location_context: Optional[str] = Field(None, description="Detected location")
    budget_summary: Optional[Dict] = Field(None, description="Budget data summary")
    sources: Optional[List[str]] = Field(None, description="Data sources used")
    model: str = Field(default="gemini-2.5-flash", description="AI model used")
