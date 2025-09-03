# app/routes/pricing.py
from fastapi import APIRouter, HTTPException, Query
from app.services.calculator import calculate_present_value
from app.services.rate_fetcher import get_external_rate
from app.schemas.price import PriceResponse
import os
import httpx

router = APIRouter(prefix="/pricing", tags=["pricing"])

@router.get("/health")
async def health():
    """Verify the API key is loaded (does not expose the key)."""
    return {"api_key_loaded": bool((os.getenv("API_NINJAS_KEY") or "").strip())}

@router.get("/probe")
async def probe(country: str = Query("United Kingdom")):
    """Return raw upstream status/body for quick debugging."""
    api_key = (os.getenv("API_NINJAS_KEY") or "").strip()
    if not api_key:
        return {"status": 503, "ok": False, "body": "API key missing"}
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(
            "https://api.api-ninjas.com/v1/interestrate",
            headers={"X-Api-Key": api_key},
            params={"country": country},
        )
        return {"status": r.status_code, "ok": r.is_success, "body": r.text}

@router.get(
    "/external",
    response_model=PriceResponse
)  # 👈 ensure this closing parenthesis exists
async def external(
    notional: float = Query(..., gt=0),
    years: int = Query(..., ge=1, le=50),
    country: str | None = Query("United Kingdom"),
    name: str | None = Query(None),
    central_bank_only: bool | None = Query(None),
):
    """
    Price using an external interest rate:
    - Provide either `country` (central bank policy rate) or `name` (benchmark like 'sonia').
    """
    api_key = (os.getenv("API_NINJAS_KEY") or "").strip()
    if not api_key:
        raise HTTPException(status_code=503, detail="API key missing")

    if not country and not name:
        raise HTTPException(status_code=400, detail="Provide either 'country' or 'name'")

    try:
        rate = await get_external_rate(
            country=country,
            name=name,
            central_bank_only=central_bank_only,
        )
    except httpx.ReadTimeout:
        raise HTTPException(status_code=504, detail="Upstream timeout")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Upstream {e.response.status_code}: {e.response.text[:500]}")
    except ValueError as e:
        raise HTTPException(status_code=502, detail=f"Failed to parse upstream: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")

    present_value = calculate_present_value(notional=notional, rate=rate, years=years)
    return PriceResponse(notional=notional, years=years, country=country or "", rate=rate,  present_value= present_value)



