from fastapi import APIRouter, Depends, HTTPException
from typing import Any, Dict, List
from motor.motor_asyncio import AsyncIOMotorDatabase
import traceback

from app.core.database import get_db
from app.services.prediction_analysis import run_inference, train_and_save_models

router = APIRouter()

@router.get("/predictions", response_model=Dict[str, Any])
async def get_prediction_analysis(
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Fetches the prediction analysis from the ML model, returning lapse probabilities,
    predicted spend, and smart reallocation suggestions for zero-based budgeting.
    """
    try:
        results = await run_inference(db)
        return {
            "predictions": results
        }
        
    except Exception as e:
        print(f"Error serving prediction analysis: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/train-models", response_model=Dict[str, Any])
async def trigger_model_training(
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Manually triggers offline training of the Random Forest models.
    Saves via Joblib.
    """
    try:
        await train_and_save_models(db)
        return {"status": "success", "message": "Models successfully trained and saved."}
        
    except Exception as e:
        print(f"Error training models: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
