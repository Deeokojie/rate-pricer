from fastapi import FastAPI
from app.database import Base, engine
from app.models.user import User
from app.routes import users
from app.routes import pricing

# Create the FastAPI app instance first
app = FastAPI()

# Then include your routes
app.include_router(users.router)
app.include_router(pricing.router)

# Then create tables
Base.metadata.create_all(bind=engine)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}

