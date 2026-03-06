from src.db import departments
from src.utils import compute_remaining
from src.learning_model import predict_strategy
from src.transaction_logger import log_transaction


def reallocate_budget(receiver_id, amount):

    all_departments = list(departments.find())

    all_departments = compute_remaining(all_departments)

    receiver = None
    donors = []

    for d in all_departments:
        if d["dept_id"] == receiver_id:
            receiver = d
        else:
            donors.append(d)

    donors.sort(key=lambda x: x["remaining_budget"], reverse=True)

    strategy = predict_strategy(amount)

    selected_donors = donors[:strategy]

    total_remaining = sum([d["remaining_budget"] for d in selected_donors])

    allocation = []

    for d in selected_donors:

        share = d["remaining_budget"] / total_remaining

        contribution = share * amount

        allocation.append({
            "dept_id": d["dept_id"],
            "dept_name": d["dept_name"],
            "amount": contribution
        })

        departments.update_one(
            {"dept_id": d["dept_id"]},
            {"$inc": {"utilized_budget": contribution}}
        )

    departments.update_one(
        {"dept_id": receiver_id},
        {"$inc": {"allocated_budget": amount}}
    )

    log_transaction(receiver_id, allocation, amount)

    return allocation