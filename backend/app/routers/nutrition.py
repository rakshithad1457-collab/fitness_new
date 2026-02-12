from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.workout_service import WorkoutService

router = APIRouter()
workout_service = WorkoutService()

class MoodWorkoutRequest(BaseModel):
    mood: str
    duration: int
    fitness_level: str = "intermediate"

class Exercise(BaseModel):
    name: str
    reps: Optional[str] = None
    sets: Optional[int] = None

class Workout(BaseModel):
    name: str
    description: str
    duration: int
    calories: int
    difficulty: str
    difficulty_icon: str
    icon: str
    exercises: List[str]
    video_url: Optional[str] = None
    image_url: Optional[str] = None

class WorkoutResponse(BaseModel):
    workouts: List[Workout]
    mood: str
    duration: int

@router.post("/mood-based", response_model=WorkoutResponse)
async def get_mood_based_workouts(request: MoodWorkoutRequest):
    """
    Get personalized workouts based on mood, duration, and fitness level
    """
    try:
        workouts = workout_service.get_workouts_by_mood(
            mood=request.mood,
            duration=request.duration,
            fitness_level=request.fitness_level
        )
        
        return {
            "workouts": workouts,
            "mood": request.mood,
            "duration": request.duration
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[Workout])
async def get_all_workouts():
    """
    Get all available workouts
    """
    try:
        workouts = workout_service.get_all_workouts()
        return workouts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))