import math

def calculate_present_value(notional: float, rate: float, years: int) -> float:
    """
    PV = FV / (1 + r)^n
    """
    if any(math.isnan(x) for x in (notional, rate, years)):
        raise ValueError("Inputs must not be NaN")

    if rate <= -1:
        raise ValueError("Rate must be greater than -1 to avoid division by zero")

    if years < 0:
        raise ValueError("Years must not be negative")

    pv = notional / ((1 + rate) ** years)
    return round(pv, 2)
