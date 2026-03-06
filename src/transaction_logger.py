from datetime import datetime
from src.db import reallocation_transactions


def log_transaction(receiver, donors, amount):

    record = {
        "receiver_dept": receiver,
        "donors": donors,
        "amount": amount,
        "timestamp": datetime.utcnow()
    }

    reallocation_transactions.insert_one(record)