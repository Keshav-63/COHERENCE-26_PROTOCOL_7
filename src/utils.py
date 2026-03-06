def remaining_budget(dept):
    return dept["allocated_budget"] - dept["utilized_budget"]


def compute_remaining(departments):
    for d in departments:
        d["remaining_budget"] = remaining_budget(d)
    return departments