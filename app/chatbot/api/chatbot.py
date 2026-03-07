"""
Citizen Chatbot API - GovGenie
Simple, stateless endpoint for querying public financial data
"""

import logging
from fastapi import APIRouter, HTTPException, status

from app.chatbot.schemas.chatbot import ChatRequest, ChatResponse
from app.chatbot.services.chatbot_service import ask_govgenie

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/ask", response_model=ChatResponse)
async def ask(request: ChatRequest):
    """
    Ask GovGenie about public finance, budget allocations, and government spending.

    This endpoint provides location-aware answers about:
    - Budget allocations for your area
    - Government spending and utilization rates
    - Contractors and vendors operating nearby
    - Public schemes and their implementation
    - How to access more information (RTI, portals, etc.)

    **Example queries:**
    - "What is the budget allocated to my area?"
    - "How much has been utilized?"
    - "Who are the contractors in my district?"
    - "What government schemes are running here?"
    - "Tell me about vendor XYZ"

    **Required:**
    - `query`: Your question (string)
    - `latitude`: Your current latitude (float)
    - `longitude`: Your current longitude (float)
    """
    try:
        logger.info(f"Received query from ({request.latitude}, {request.longitude})")

        # Call the main chatbot function
        result = await ask_govgenie(
            query=request.query,
            latitude=request.latitude,
            longitude=request.longitude
        )

        # Check for errors
        if result.get("error"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("error_details", "Failed to generate response")
            )

        # Return response
        return ChatResponse(
            answer=result["answer"],
            location_context=result.get("location_context"),
            budget_summary=result.get("budget_summary"),
            sources=result.get("sources"),
            model=result.get("model", "gemini-2.5-flash")
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chatbot endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process your query: {str(e)}"
        )
