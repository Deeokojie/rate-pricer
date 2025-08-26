def calculate_present_value(notational: float, rate: float, years: int) -> float:

    """
    Calculate present value of a zero-coupon bond.
    Formula: PV = FV / (1 + r)^n
    """

    if rate < 0 or years <0:
        raise ValueError("Rate and years must not be negativeu")

    return round(notational / ((1 + rate) ** years), 2)