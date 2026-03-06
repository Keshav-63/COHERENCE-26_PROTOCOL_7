from fastapi import FastAPI
from pydantic import BaseModel

from src.anomaly_client import run_anomaly_detection
from src.allocation_engine import reallocate_budget

app = FastAPI()


class BudgetRequest(BaseModel):

    dept_id: str
    amount: float


@app.post("/reallocate")

def reallocate(request: BudgetRequest):

    critical = run_anomaly_detection()

    if critical >= 2:

        return {
            "status": "rejected",
            "reason": "Critical anomalies detected"
        }

    allocation = reallocate_budget(request.dept_id, request.amount)

    return {
        "status": "approved",
        "receiver": request.dept_id,
        "allocation": allocation
    }