from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import traceback
from dotenv import load_dotenv
load_dotenv()

from app.routers import auth, workouts, nutrition

app = FastAPI(title="FitMood API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://fitness-new-git-main-rakshithad1457-2434s-projects.vercel.app",
        "https://fitness-new.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def crash_catcher(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        print("\n!!! BACKEND CRASH DETECTED !!!")
        print(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(workouts.router, prefix="/api/workouts", tags=["Workouts"])
app.include_router(nutrition.router, prefix="/api/nutrition", tags=["Nutrition"])

@app.get("/")
async def root():
    return {"message": "FitMood API is Running"}