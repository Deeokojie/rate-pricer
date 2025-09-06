# Rate Pricer

A full-stack FastAPI + React (TypeScript) application that fetches live interest rates and calculates the present value (PV) of zero-coupon bonds.

## Features
- Fetches real-time interest rates from external APIs  
- Calculates present value (PV) using:  
  PV = FV / (1 + r)^n  
- Modular FastAPI backend with routes, models, services, and schemas  
- React + TypeScript frontend with a simple bond calculator UI  
- Container-friendly and deployable to the cloud  

## Tech Stack
- Backend: FastAPI, Pydantic, SQLAlchemy  
- Frontend: React (TypeScript), Vite  
- Database: SQLite (dev) → PostgreSQL (production ready)  
- Infra: Python 3.12, Node.js 18+, Docker (optional)  

## Project Structure

rate-pricer/
├── app/ # FastAPI backend
│ ├── main.py # ASGI entrypoint
│ ├── routes/ # API routes
│ ├── models/ # DB models
│ ├── schemas/ # Pydantic schemas
│ ├── services/ # Business logic (pricing, API calls)
│ └── config/ # Settings
│
├── frontend/ # React frontend
│ ├── public/ # Static files
│ └── src/ # Source code
│ ├── components/ # UI components
│ │ └── PricingCalculator.tsx
│ └── App.tsx
│
├── requirements.txt # Backend dependencies
├── package.json # Frontend dependencies
└── README.md # Project docs

## Setup & Installation

### 1. Clone the repo
```bash
git clone https://github.com/Deeokojie/rate-pricer.git
cd rate-pricer

# Create and activate venv
python3.12 -m venv .venv
source .venv/bin/activate  # Mac/Linux
.venv\Scripts\activate     # Windows

# Install dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Run server
python -m uvicorn app.main:app --reload

Backend runs at: http://127.0.0.1:8000
Interactive docs: http://127.0.0.1:8000/docs

cd frontend/rate-pricer-ui
npm install
npm start

Frontend runs at: http://localhost:3000

Example API Call

Endpoint: GET /pricing/external

curl "http://127.0.0.1:8000/pricing/external?notional=1000&years=5&country=United%20Kingdom"

Response:

{
  "notional": 1000.0,
  "rate": 0.04,
  "years": 5,
  "price": 821.93,
  "country": "United Kingdom"
}

Roadmap

Extend to coupon bond pricing
Add user authentication
Improve UI styling and UX
Docker Compose for full stack
Deploy to AWS/Azure




