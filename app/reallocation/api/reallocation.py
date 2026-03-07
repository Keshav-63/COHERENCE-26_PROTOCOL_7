"""
AI Budget Reallocation API Endpoints
Implements the POC reallocation strategy from shah-re branch
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.reallocation.services.anomaly_client import run_anomaly_detection, get_anomaly_summary
from app.reallocation.services.allocation_engine import reallocate_budget
from app.reallocation.models import ReallocationTransaction

router = APIRouter(prefix="/reallocation", tags=["Reallocation"])


# ── Pydantic Schemas ──────────────────────────────────────────────────────────


class BudgetRequest(BaseModel):
    """Request model for budget reallocation"""
    dept_id: str = Field(description="Department code requesting funds")
    amount: float = Field(gt=0, description="Amount to reallocate (in crores)")
    fiscal_year: Optional[str] = Field(default="2025-26", description="Fiscal year")

    class Config:
        json_schema_extra = {
            "example": {
                "dept_id": "DEA-MF-001",
                "amount": 10000000,
                "fiscal_year": "2025-26"
            }
        }


class ReallocationResponse(BaseModel):
    """Response model for successful reallocation"""
    status: str
    message: str
    receiver: str
    total_amount: float
    allocation: list
    transaction_id: Optional[str] = None
    fiscal_year: str
    timestamp: datetime


# ── ENDPOINT 1: Reallocate Budget ────────────────────────────────────────────


@router.post(
    "/reallocate",
    summary="Reallocate budget from donor departments to receiver department",
    response_model=ReallocationResponse
)
async def reallocate(
    request: BudgetRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    **AI Budget Reallocation Endpoint** (POC Implementation)

    Automatically reallocates unused budgets between government departments
    after verifying financial integrity using anomaly detection.

    **Workflow:**
    1. Run anomaly detection
    2. Block if critical anomalies >= 2
    3. Scan all departments for available budget
    4. Determine optimal fund contribution (proportional allocation)
    5. Record transaction in ledger

    **Strategy:**
    - Small amounts (<100K): 1 donor
    - Medium amounts (100K-1M): 2 donors
    - Large amounts (>1M): 3 donors

    **Safety Mechanisms:**
    - Anomaly detection gate before allocation
    - Prevents allocation during suspicious activity
    - Full transaction audit trail
    - Multi-department fund sharing
    - Budget balance validation
    """
    try:
        # Step 1: Run anomaly detection
        critical_anomalies = await run_anomaly_detection(db)

        # Step 2: Block if critical anomalies >= 2
        if critical_anomalies >= 2:
            return ReallocationResponse(
                status="rejected",
                message=f"Critical anomalies detected: {critical_anomalies}. Reallocation blocked for financial safety.",
                receiver=request.dept_id,
                total_amount=request.amount,
                allocation=[],
                fiscal_year=request.fiscal_year,
                timestamp=datetime.utcnow()
            )

        # Step 3-5: Perform reallocation
        allocation = await reallocate_budget(
            db=db,
            receiver_id=request.dept_id,
            amount=request.amount,
            fiscal_year=request.fiscal_year
        )

        # Get the transaction ID from the most recent transaction
        recent_txn = await ReallocationTransaction.find_one(
            {"receiver_dept_id": request.dept_id},
            sort=[("timestamp", -1)]
        )

        return ReallocationResponse(
            status="approved",
            message="Budget reallocated successfully",
            receiver=request.dept_id,
            total_amount=request.amount,
            allocation=allocation,
            transaction_id=str(recent_txn.id) if recent_txn else None,
            fiscal_year=request.fiscal_year,
            timestamp=datetime.utcnow()
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Reallocation engine error: {str(e)}"
        )


# ── ENDPOINT 2: Anomaly Check ─────────────────────────────────────────────────


@router.get(
    "/anomaly-check",
    summary="Check anomaly status before reallocation"
)
async def check_anomalies(
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Check current anomaly status to determine if reallocation is safe

    Returns:
    - Critical anomaly count
    - Flagged anomaly count
    - Reallocation allowed status
    - Detailed anomaly information
    """
    try:
        summary = await get_anomaly_summary(db)
        return {
            "status": "success",
            "anomaly_summary": summary,
            "checked_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── ENDPOINT 3: Reallocation History ──────────────────────────────────────────


@router.get(
    "/history",
    summary="Get reallocation transaction history"
)
async def get_reallocation_history(
    dept_id: Optional[str] = Query(None, description="Filter by department code"),
    limit: int = Query(50, ge=1, le=200, description="Number of records to fetch"),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Retrieve reallocation transaction history

    **Query Parameters:**
    - dept_id: Filter transactions for specific department (as receiver)
    - limit: Maximum number of records to return

    **Returns:**
    - List of reallocation transactions with full details
    - Donor contributions for each transaction
    - Timestamps and amounts
    """
    try:
        query = {}
        if dept_id:
            query["receiver_dept_id"] = dept_id

        transactions = await ReallocationTransaction.find(
            query
        ).sort([("timestamp", -1)]).limit(limit).to_list()

        return {
            "status": "success",
            "total": len(transactions),
            "transactions": [
                {
                    "transaction_id": str(txn.id),
                    "receiver_dept_id": txn.receiver_dept_id,
                    "receiver_dept_name": txn.receiver_dept_name,
                    "total_amount": txn.total_amount,
                    "donors": txn.donors,
                    "transaction_status": txn.transaction_status,
                    "timestamp": txn.timestamp.isoformat(),
                }
                for txn in transactions
            ],
            "fetched_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── ENDPOINT 4: Reallocation Statistics ───────────────────────────────────────


@router.get(
    "/statistics",
    summary="Get reallocation statistics and insights"
)
async def get_reallocation_statistics(
    fiscal_year: Optional[str] = Query("2025-26", description="Fiscal year"),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Get statistical insights on budget reallocations

    **Returns:**
    - Total reallocations count
    - Total amount reallocated
    - Top receiver departments
    - Top donor departments
    - Average reallocation amount
    """
    try:
        # Get all reallocation transactions
        all_txns = await ReallocationTransaction.find_all().to_list()

        if not all_txns:
            return {
                "status": "success",
                "fiscal_year": fiscal_year,
                "total_reallocations": 0,
                "total_amount_reallocated": 0,
                "message": "No reallocation transactions found"
            }

        # Calculate statistics
        total_amount = sum(txn.total_amount for txn in all_txns)
        avg_amount = total_amount / len(all_txns) if all_txns else 0

        # Top receivers
        receiver_amounts = {}
        for txn in all_txns:
            dept = txn.receiver_dept_id
            receiver_amounts[dept] = receiver_amounts.get(dept, 0) + txn.total_amount

        top_receivers = sorted(
            [{"dept_id": k, "total_received": v} for k, v in receiver_amounts.items()],
            key=lambda x: x["total_received"],
            reverse=True
        )[:10]

        # Top donors
        donor_amounts = {}
        for txn in all_txns:
            for donor in txn.donors:
                dept = donor["dept_id"]
                donor_amounts[dept] = donor_amounts.get(dept, 0) + donor["amount"]

        top_donors = sorted(
            [{"dept_id": k, "total_donated": v} for k, v in donor_amounts.items()],
            key=lambda x: x["total_donated"],
            reverse=True
        )[:10]

        return {
            "status": "success",
            "fiscal_year": fiscal_year,
            "total_reallocations": len(all_txns),
            "total_amount_reallocated": round(total_amount, 2),
            "average_reallocation": round(avg_amount, 2),
            "top_receivers": top_receivers,
            "top_donors": top_donors,
            "analyzed_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
