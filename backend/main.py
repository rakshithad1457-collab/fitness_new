from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, workouts, nutrition

app = FastAPI(
    title="FitMood API",
    description="Mood-based fitness and nutrition API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(workouts.router, prefix="/workouts", tags=["Workouts"])
app.include_router(nutrition.router, prefix="/nutrition", tags=["Nutrition"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to FitMood API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}