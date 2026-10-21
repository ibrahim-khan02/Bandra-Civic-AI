import os 
from dotenv import load_dotenv
from pymongo import AsyncMongoClient

load_dotenv()
MONGO_URL = os.getenv("MONGO_URL")

if not MONGO_URL:
    raise ValueError("MONGo_URL is  missing from the .env file")

client = AsyncMongoClient(MONGO_URL)

db = client["Bandra_Civic_AI"]
complaints_collection = db["complaints"]