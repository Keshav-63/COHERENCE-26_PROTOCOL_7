from typing import List, Dict, Any
from app.services.prediction_engine import PredictionEngine
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import User
from app.core.database import get_db
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()

@router.get("/schemes", response_model=List[Dict[str, Any]])
async def get_predictive_modeling_schemes(
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Returns predictive modeling data for all departments by querying the custom
    `departments` collection in MongoDB.
    """
    
    # Fetch all custom departments
    cursor = db.departments.find({})
    departments = await cursor.to_list(length=1000)
    
    results = []
    
    for dept in departments:
        allocated = dept.get("allocated_budget", 0)
        spent = dept.get("utilized_budget", 0)
        
        if allocated <= 0:
            continue
            
        # Since the custom departments collection does not have monthly spending
        # we will use a simulated monthly representation based on the utilized total
        current_month = 6  # Assume mid-year point for the prediction logic
        
        # Simulate last 3 months of spending as an even split of the total spent so far
        avg_monthly_spent = spent / current_month if current_month > 0 else 0
        recent_spending = [avg_monthly_spent, avg_monthly_spent, avg_monthly_spent]
        
        # Fire up the AI engine
        prediction_result = PredictionEngine.analyze_scheme(
            entity_id=dept.get("dept_id", "DEPT-00"),
            entity_name=dept.get("dept_name", "Unknown Department"),
            total_allocation=allocated,
            total_spent=spent, 
            current_month=current_month,
            recent_spending=recent_spending
        )
        
        if "error" not in prediction_result:
             # The UI expects a ministry string
             prediction_result["ministry"] = dept.get("district", "State Government")
             results.append(prediction_result)
            
    # Return the top 30
    results.sort(key=lambda x: x.get('current_status', {}).get('allocation', 0), reverse=True)
    return results[:30]
