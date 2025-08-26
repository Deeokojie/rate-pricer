from fastapi import APIRouter, HTTPException
from app.services.calculator import calculate_present_value
from app.services.rate_fetcher import get_external_rate
from app.schemas.price import PriceResponse
from fastapi import Query

router = APIRouter(prefix="/pricing", tags=["pricing"])

@router.get("/external", response_model=PriceResponse)
async def fetch_and_calculate_price(
    notional: float = Query(1000.0, gt=0),
    years: int = Query(5, gt=0),
    country: str = Query("United States"),
    name: str = Query("federal_funds_rate")
):
    try:
        rate = await get_external_rate(country=country)
        present_value = calculate_present_value(notional, rate / 100, years)
        return PriceResponse(
            notional=notional,
            rate=rate,
            years=years,
            present_value=present_value
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"pricing failed: {str(e)}")
