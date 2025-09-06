import os, httpx
from typing import Optional
from fastapi import HTTPException
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

BASE_URL = "https://api.api-ninjas.com/v1/interestrate"

async def get_external_rate(
    *, country: Optional[str] = None, name: Optional[str] = None, central_bank_only: Optional[bool] = None
) -> float:
    api_key = (os.getenv("API_NINJAS_KEY") or "").strip()
    if not api_key:
        raise HTTPException(status_code=503, detail="API key missing")

    params = {}
    if country: params["country"] = country
    if name: params["name"] = name
    if central_bank_only is not None:
        params["central_bank_only"] = "true" if central_bank_only else "false"

    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(BASE_URL, headers={"X-Api-Key": api_key}, params=params)
        try:
            r.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=502, detail=f"Upstream {e.response.status_code}: {e.response.text[:500]}")
        data = r.json()

    
    rate = None
    if isinstance(data, dict) and "central_bank_rates" in data and data["central_bank_rates"]:
        item = data["central_bank_rates"][0]
        # Prefer rate_pct, fallback to rate if API ever changes
        if "rate_pct" in item:
            rate = float(item["rate_pct"]) / 100.0   # convert % to decimal
        elif "rate" in item:
            # If API ever returns 'rate' as % or decimal, normalize
            val = float(item["rate"])
            rate = val / 100.0 if val > 1.0 else val
    elif isinstance(data, list) and data and "rate" in data[0]:
        val = float(data[0]["rate"])
        rate = val / 100.0 if val > 1.0 else val

    if rate is None:
        raise HTTPException(status_code=502, detail=f"Unexpected upstream JSON: {data}")

    if not (0.0 <= rate <= 1.0):
        raise HTTPException(status_code=502, detail=f"Parsed rate out of range (0..1): {rate}")

    return rate
