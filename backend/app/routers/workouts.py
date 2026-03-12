from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, Field
from typing import Optional
import os
from jose import jwt, JWTError
from supabase import create_client
from app.services.workout_service import get_mood_workout

router = APIRouter(tags=["workout"])

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

SECRET_KEY = "fitmood-secret-key-2026"
ALGORITHM = "HS256"

VALID_MOODS = ["happy", "stressed", "tired", "energetic", "anxious", "sad", "neutral", "motivated"]
VALID_AGE_CATEGORIES = ["teen", "young_adult", "adult", "senior"]

class WorkoutRequest(BaseModel):
    mood: str
    available_time: int = Field(..., ge=5)
    age_category: str = Field(default="young_adult")

class CaloriesBurned(BaseModel):
    per_exercise_total: int
    estimated_range: str
    note: str

class WorkoutResponse(BaseModel):
    mood: str
    age_category: str
    age_label: str
    title: str
    description: str
    duration_minutes: int
    rest_note: str
    exercises: list[dict]
    calories_burned: Optional[CaloriesBurned] = None
    youtube_url: str
    youtube_query: str

@router.post("/mood-based", response_model=WorkoutResponse)
async def generate_workout(request: WorkoutRequest, authorization: Optional[str] = Header(None)):
    mood = request.mood.lower().strip()
    age_category = request.age_category.lower().strip()

    if mood not in VALID_MOODS:
        raise HTTPException(status_code=400, detail=f"Mood '{mood}' not supported.")
    if age_category not in VALID_AGE_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Age category '{age_category}' not supported.")

    # Update user's mood and workout count in Supabase
    if authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.split(" ")[1]
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("sub")
            if email:
                user_res = supabase.table("users").select("workouts").eq("email", email).execute()
                if user_res.data:
                    current_workouts = user_res.data[0].get("workouts", 0) or 0
                    supabase.table("users").update({
                        "last_mood": mood,
                        "workouts": current_workouts + 1,
                    }).eq("email", email).execute()
        except JWTError:
            pass  # Invalid token, just skip the update

    workout = get_mood_workout(mood, request.available_time, age_category)
    return workout

@router.get("/moods")
async def list_supported_moods():
    return {
        "moods": [
            {"value": "happy",     "label": "Happy",     "description": "Upbeat cardio & dance workouts"},
            {"value": "stressed",  "label": "Stressed",  "description": "Yoga & breathing exercises"},
            {"value": "tired",     "label": "Tired",     "description": "Gentle stretching & low-impact"},
            {"value": "energetic", "label": "Energetic", "description": "HIIT & power training"},
            {"value": "anxious",   "label": "Anxious",   "description": "Mindful movement & meditation"},
            {"value": "sad",       "label": "Sad",       "description": "Feel-good endorphin boosters"},
            {"value": "neutral",   "label": "Neutral",   "description": "Balanced full-body workout"},
            {"value": "motivated", "label": "Motivated", "description": "Strength & performance training"},
        ]
    }

@router.get("/age-categories")
async def list_age_categories():
    return {
        "age_categories": [
            {"value": "teen",        "label": "Teen (13-17)",       "description": "Fun, energizing routines."},
            {"value": "young_adult", "label": "Young Adult (18-35)", "description": "High-intensity sessions."},
            {"value": "adult",       "label": "Adult (36-55)",       "description": "Joint-friendly training."},
            {"value": "senior",      "label": "Senior (56+)",        "description": "Low-impact movement."},
        ]
    }