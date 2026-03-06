"""
March Rush Intelligence Engine — PRAHARI
Detects departments heading for year-end panic spending.

Indian Government Fiscal Year: April 1 – March 31.
March Rush = 60–80% of annual budget spent in the last 3–4 weeks.

Also computes Fund Lapse Risk: probability that funds will lapse (expire unspent).
"""

import logging
from datetime import datetime
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

# Current fiscal year derived from current date
def get_current_fiscal_year() -> str:
    now = datetime.utcnow()
    if now.month >= 4:
        return f"{now.year}-{str(now.year + 1)[-2:]}"
    return f"{now.year - 1}-{str(now.year)[-2:]}"


def get_fiscal_month(calendar_month: int) -> int:
    """Convert calendar month to fiscal month (April = 1)."""
    if calendar_month >= 4:
        return calendar_month - 3
    return calendar_month + 9


async def analyze_march_rush(
    db: AsyncIOMotorDatabase,
    fiscal_year: Optional[str] = None,
) -> List[dict]:
    """
    Analyze all ministries/departments for March Rush risk.
    Returns list of entities ranked by march rush probability.
    """
    if not fiscal_year:
        fiscal_year = get_current_fiscal_year()

    results = []

    # Fetch all allocations for this fiscal year
    allocations = await db["budget_allocations"].find(
        {"fiscal_year": fiscal_year, "entity_type": {"$in": ["ministry", "department"]}}
    ).to_list(500)

    for alloc in allocations:
        entity_code = alloc.get("entity_code", "")
        entity_name = alloc.get("entity_name", "")
        be = float(alloc.get("budget_estimate") or 0)
        actual = float(alloc.get("actual_expenditure") or 0)

        if be == 0:
            continue

        utilization_pct = (actual / be) * 100

        # Fetch monthly expenditure data
        expenditures = await db["expenditures"].find(
            {"entity_code": entity_code, "fiscal_year": fiscal_year}
        ).to_list(12)

        # March spending
        march_spent = sum(
            float(e.get("expenditure_amount", 0))
            for e in expenditures
            if e.get("month") == 3
        )
        march_ratio = march_spent / actual if actual > 0 else 0

        # Q4 (Jan–Mar) spending ratio
        q4_spent = sum(
            float(e.get("expenditure_amount", 0))
            for e in expenditures
            if e.get("month") in (1, 2, 3)
        )
        q4_ratio = q4_spent / actual if actual > 0 else 0

        # Historical march rush from previous year
        prev_alloc = await db["budget_allocations"].find_one({
            "entity_code": entity_code,
            "fiscal_year": {"$ne": fiscal_year},
        }, sort=[("fiscal_year", -1)])

        prev_march_rush = False
        if prev_alloc:
            prev_actual = float(prev_alloc.get("actual_expenditure") or 0)
            prev_be = float(prev_alloc.get("budget_estimate") or 1)
            if prev_actual > 0:
                prev_utilization = prev_actual / prev_be
                # If previous year had >90% utilization with low early spending — classic rush
                prev_march_rush = prev_utilization > 0.90

        # MARCH RUSH PROBABILITY SCORE
        rush_score = 0.0
        rush_signals = []

        if march_ratio > 0.50:
            rush_score += 0.40
            rush_signals.append(f"{round(march_ratio*100,1)}% spent in March alone")
        elif march_ratio > 0.30:
            rush_score += 0.25
            rush_signals.append(f"Elevated March spending ({round(march_ratio*100,1)}%)")

        if q4_ratio > 0.70:
            rush_score += 0.30
            rush_signals.append(f"{round(q4_ratio*100,1)}% spent in Q4 (Jan-Mar)")

        if utilization_pct < 30:
            rush_score += 0.20
            rush_signals.append(f"Low mid-year utilization ({round(utilization_pct,1)}%) — burst expected")

        if prev_march_rush:
            rush_score += 0.10
            rush_signals.append("Historical repeat offender (previous year March Rush detected)")

        # FUND LAPSE RISK (inverse: low utilization = high lapse risk)
        now = datetime.utcnow()
        months_left = max(0, 3 - now.month) if now.month <= 3 else max(0, 15 - now.month)
        remaining_budget = be - actual
        monthly_run_rate = actual / max(get_fiscal_month(now.month), 1)

        if monthly_run_rate > 0:
            months_to_exhaust = remaining_budget / monthly_run_rate
            lapse_risk = "HIGH" if months_to_exhaust > (months_left * 2) else \
                         "MEDIUM" if months_to_exhaust > months_left else "LOW"
        else:
            lapse_risk = "HIGH" if remaining_budget > 0 else "NONE"

        results.append({
            "entity_code": entity_code,
            "entity_name": entity_name,
            "fiscal_year": fiscal_year,
            "budget_estimate_cr": round(be, 2),
            "actual_expenditure_cr": round(actual, 2),
            "utilization_pct": round(utilization_pct, 1),
            "march_spending_ratio_pct": round(march_ratio * 100, 1),
            "q4_spending_ratio_pct": round(q4_ratio * 100, 1),
            "march_rush_score": round(min(rush_score, 1.0), 4),
            "march_rush_risk": (
                "CRITICAL" if rush_score > 0.70
                else "HIGH" if rush_score > 0.45
                else "MEDIUM" if rush_score > 0.20
                else "LOW"
            ),
            "march_rush_signals": rush_signals,
            "fund_lapse_risk": lapse_risk,
            "remaining_budget_cr": round(remaining_budget, 2),
            "prev_march_rush_history": prev_march_rush,
        })

    # Sort by march rush score descending
    results.sort(key=lambda x: x["march_rush_score"], reverse=True)
    return results
