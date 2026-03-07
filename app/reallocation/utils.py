"""
Reallocation Utility Functions
Helper functions for budget calculations
"""

from typing import List, Dict, Any


def remaining_budget(dept: Dict[str, Any]) -> float:
    """
    Calculate remaining budget for a department

    Args:
        dept: Department dictionary with allocated_budget and utilized_budget

    Returns:
        float: Remaining budget amount
    """
    allocated = float(dept.get("allocated_budget", 0))
    utilized = float(dept.get("utilized_budget", 0))
    return allocated - utilized


def compute_remaining(departments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Compute remaining budget for all departments

    Args:
        departments: List of department dictionaries

    Returns:
        List of departments with added 'remaining_budget' field
    """
    for dept in departments:
        dept["remaining_budget"] = remaining_budget(dept)
    return departments
