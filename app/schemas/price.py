from pydantic import BaseModel

class PriceResponse(BaseModel):
    notional: float
    rate: float
    years: int
    present_value: float
    country: str

class PriceRequest(BaseModel):
    notional: float
    years: int
    country: str = "UK"
    name: str = "sofr"

