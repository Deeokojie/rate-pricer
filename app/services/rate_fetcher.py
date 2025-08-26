import os
import httpx
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

API_KEY = os.getenv("API_NINJAS_KEY")
BASE_URL = "https://api.api-ninjas.com/v1/interestrate"

async def get_external_rate(country: str = "United Kingdom") -> float:
    # Why: Fail fast if key missing so the route doesn't pass None in headers
    if not API_KEY:
        raise HTTPException(status_code=500, detail="Missing API_NINJAS_KEY env var")

    headers = {"X-Api-Key": API_KEY}
    params = {"country": country}

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(BASE_URL, headers=headers, params=params)
        resp.raise_for_status()
        data = resp.json()

    rates = data.get("central_bank_rates") or []
    if not rates:
        # Why: Surface the raw payload to help diagnose bad params
        raise HTTPException(status_code=502, detail="No rate data returned")

    return float(rates[0]["rate_pct"])  # first entry is the headline policy rate

