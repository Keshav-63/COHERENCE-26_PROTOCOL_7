"""
Allocation Engine - Core Reallocation Logic
Reallocates budget from donor departments to receiver department
"""

from typing import List, Dict, Any, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.reallocation.utils import compute_remaining
from app.reallocation.services.learning_model import predict_strategy
from app.reallocation.services.transaction_logger import log_transaction
from app.budget.models import Department


async def get_department_budget_summary(
    db: AsyncIOMotorDatabase,
    dept_code: str,
    fiscal_year: str = "2025-26"
) -> Dict[str, Any]:
    """
    Get aggregated budget summary for a department

    Args:
        db: MongoDB database instance
        dept_code: Department code
        fiscal_year: Fiscal year to query

    Returns:
        Dictionary with department budget summary
    """
    pipeline = [
        {
            "$match": {
                "department_code": dept_code,
                "fiscal_year": fiscal_year
            }
        },
        {
            "$group": {
                "_id": "$department_code",
                "dept_code": {"$first": "$department_code"},
                "dept_name": {"$first": "$department_name"},
                "total_allocated": {"$sum": "$budget_estimate"},
                "total_utilized": {"$sum": {"$ifNull": ["$actual_expenditure", 0]}}
            }
        }
    ]

    result = await db["budget_allocations"].aggregate(pipeline).to_list(1)

    if result:
        dept_data = result[0]
        return {
            "dept_id": dept_data["dept_code"],
            "dept_name": dept_data["dept_name"],
            "allocated_budget": float(dept_data["total_allocated"]),
            "utilized_budget": float(dept_data["total_utilized"]),
        }

    return None


async def get_all_departments_budget_summary(
    db: AsyncIOMotorDatabase,
    fiscal_year: str = "2025-26"
) -> List[Dict[str, Any]]:
    """
    Get budget summary for all departments

    Args:
        db: MongoDB database instance
        fiscal_year: Fiscal year to query

    Returns:
        List of department budget summaries
    """
    pipeline = [
        {
            "$match": {
                "fiscal_year": fiscal_year,
                "department_code": {"$ne": None}
            }
        },
        {
            "$group": {
                "_id": "$department_code",
                "dept_code": {"$first": "$department_code"},
                "dept_name": {"$first": "$department_name"},
                "total_allocated": {"$sum": "$budget_estimate"},
                "total_utilized": {"$sum": {"$ifNull": ["$actual_expenditure", 0]}}
            }
        }
    ]

    results = await db["budget_allocations"].aggregate(pipeline).to_list(None)

    departments = []
    for dept in results:
        departments.append({
            "dept_id": dept["dept_code"],
            "dept_name": dept["dept_name"],
            "allocated_budget": float(dept["total_allocated"]),
            "utilized_budget": float(dept["total_utilized"]),
        })

    return departments


async def reallocate_budget(
    db: AsyncIOMotorDatabase,
    receiver_id: str,
    amount: float,
    fiscal_year: str = "2025-26"
) -> List[Dict[str, Any]]:
    """
    Reallocate budget from donor departments to receiver department

    Args:
        db: MongoDB database instance
        receiver_id: Department code receiving the funds
        amount: Amount to reallocate
        fiscal_year: Fiscal year for the reallocation

    Returns:
        List of allocation details (donors with contributions)
    """
    # Get all departments with their budget summaries
    all_departments = await get_all_departments_budget_summary(db, fiscal_year)

    # Compute remaining budget for each department
    all_departments = compute_remaining(all_departments)

    # Separate receiver from potential donors
    receiver = None
    donors = []

    for dept in all_departments:
        if dept["dept_id"] == receiver_id:
            receiver = dept
        else:
            # Only include departments with positive remaining budget
            if dept["remaining_budget"] > 0:
                donors.append(dept)

    if not receiver:
        raise ValueError(f"Receiver department {receiver_id} not found")

    if not donors:
        raise ValueError("No departments with available budget to donate")

    # Sort donors by remaining budget (highest first)
    donors.sort(key=lambda x: x["remaining_budget"], reverse=True)

    # Determine allocation strategy (number of donors to use)
    strategy = predict_strategy(amount)

    # Select top donors based on strategy
    selected_donors = donors[:strategy]

    # Calculate total remaining budget from selected donors
    total_remaining = sum([d["remaining_budget"] for d in selected_donors])

    if total_remaining < amount:
        raise ValueError(
            f"Insufficient total remaining budget. "
            f"Required: {amount}, Available: {total_remaining}"
        )

    # Calculate proportional contribution from each donor
    allocation = []

    for donor in selected_donors:
        # Calculate share based on proportion of remaining budget
        share = donor["remaining_budget"] / total_remaining
        contribution = share * amount

        allocation.append({
            "dept_id": donor["dept_id"],
            "dept_name": donor["dept_name"],
            "amount": contribution
        })

        # Update donor's budget allocations (increase actual_expenditure)
        await db["budget_allocations"].update_many(
            {
                "department_code": donor["dept_id"],
                "fiscal_year": fiscal_year
            },
            {
                "$inc": {"actual_expenditure": contribution}
            }
        )

    # Update receiver's budget allocations (increase budget_estimate)
    await db["budget_allocations"].update_many(
        {
            "department_code": receiver_id,
            "fiscal_year": fiscal_year
        },
        {
            "$inc": {"budget_estimate": amount}
        }
    )

    # Log the transaction
    await log_transaction(
        db=db,
        receiver_id=receiver_id,
        receiver_name=receiver["dept_name"],
        donors=allocation,
        amount=amount
    )

    return allocation
