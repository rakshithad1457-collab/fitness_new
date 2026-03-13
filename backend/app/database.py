"""
app/database.py
---------------
MongoDB connection using PyMongo.
Set MONGODB_URI in your .env file.
"""

import os
from pymongo import MongoClient
from pymongo.collection import Collection
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.environ.get("MONGODB_DB_NAME", "fitmood")

client = MongoClient(MONGODB_URI)
db = client[DB_NAME]

# Collections (equivalent to Supabase tables)
users_collection: Collection = db["users"]
workouts_collection: Collection = db["workouts"]

# Create indexes for fast lookups
users_collection.create_index("email", unique=True)
users_collection.create_index("id")