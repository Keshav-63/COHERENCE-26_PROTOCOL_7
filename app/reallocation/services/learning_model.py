"""
Learning Model for Allocation Strategy
Determines optimal number of donor departments based on required amount
"""


def predict_strategy(amount: float) -> int:
    """
    Predict allocation strategy (number of donor departments)
    based on the required amount

    Strategy:
    - Small amounts (<100K): Single donor
    - Medium amounts (100K-1M): Two donors
    - Large amounts (>1M): Three donors

    Args:
        amount: Required reallocation amount

    Returns:
        int: Number of donor departments to use
    """
    if amount < 100000:
        return 1

    if amount < 1000000:
        return 2

    return 3
