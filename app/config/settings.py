import os
from dotenv import load_dotenv

load_dotenv()  

API_NINJAS_KEY = os.getenv("API_NINJAS_KEY")
if not API_NINJAS_KEY:
    raise RuntimeError("Missing API_NINJAS_KEY env var")
