# app/settings.py
import os
from dotenv import load_dotenv

load_dotenv()  # load variables from .env

API_NINJAS_KEY = os.getenv("API_NINJAS_KEY")
if not API_NINJAS_KEY:
    raise RuntimeError("Missing API_NINJAS_KEY env var")
