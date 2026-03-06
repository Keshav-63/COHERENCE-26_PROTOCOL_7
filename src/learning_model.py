def predict_strategy(amount):

    if amount < 100000:
        return 1

    if amount < 1000000:
        return 2

    return 3