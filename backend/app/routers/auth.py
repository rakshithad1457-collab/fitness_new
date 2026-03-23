"""
app/routers/auth.py
-------------------
Authentication router — MongoDB + Brevo HTTP API for OTP email.
Now includes /me endpoint for streak, and richer /admin/stats for graphs.
"""

from fastapi import APIRouter, HTTPException, status, Header
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional
import os, random, json, requests
from app.models.user import UserCreate, RegisterUser, Token, UserResponse, ForgotRequest, VerifyOTP
from app.database import users_collection

router = APIRouter()
OTP_STORE = {}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "fitmood-secret-key-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

EMAIL_SENDER = os.environ.get("EMAIL_SENDER", "")
BREVO_API_KEY = os.environ.get("BREVO_API_KEY", "")


# ─── Helpers ─────────────────────────────────────────────────────────────────

def send_otp_email(to_email: str, otp: str) -> bool:
    try:
        print(f"[EMAIL] Sending OTP to {to_email} via Brevo")

        url = "https://api.brevo.com/v3/smtp/email"

        headers = {
            "accept": "application/json",
            "api-key": BREVO_API_KEY,
            "content-type": "application/json"
        }

        payload = {
            "sender": {
                "name": "FitMood",
                "email": EMAIL_SENDER
            },
            "to": [{"email": to_email}],
            "subject": "FitMood — Your Password Reset OTP",
            "htmlContent": f"""
<html>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 30px;">
  <div style="max-width: 400px; margin: auto; background: white; border-radius: 12px; padding: 30px; text-align: center;">
    <h2 style="color: #FF6B35;">FitMood</h2>
    <p style="color: #555;">Your password reset OTP code is:</p>
    <div style="font-size: 36px; font-weight: bold; color: #FF6B35; letter-spacing: 8px; margin: 20px 0;">
      {otp}
    </div>
    <p style="color: #999; font-size: 13px;">Valid for 10 minutes. Do not share this code.</p>
  </div>
</body>
</html>
""",
            "textContent": f"Your FitMood OTP is: {otp}\n\nValid for 10 minutes. Do not share this code."
        }

        response = requests.post(url, json=payload, headers=headers, timeout=10)

        if response.status_code in (200, 201):
            print(f"[EMAIL] OTP sent successfully to {to_email}")
            return True
        else:
            print(f"[EMAIL ERROR] Brevo API error: {response.status_code} — {response.text}")
            return False

    except Exception as e:
        print(f"[EMAIL ERROR] Unexpected error: {e}")
        return False


def calc_age(dob_str):
    try:
        dob = datetime.strptime(dob_str, "%Y-%m-%d")
        today = datetime.utcnow()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    except:
        return None


def get_user(email: str):
    return users_collection.find_one({"email": email}, {"_id": 0})


def get_next_id():
    last = users_collection.find_one(sort=[("id", -1)], projection={"_id": 0, "id": 1})
    return (last["id"] + 1) if last else 1


# ─── Auth Routes ─────────────────────────────────────────────────────────────

@router.post("/register", response_model=Token)
async def register(user: RegisterUser):
    if get_user(user.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    now = datetime.utcnow().strftime("%Y-%m-%d")
    new_user = {
        "id": get_next_id(),
        "name": user.name,
        "dob": user.dob,
        "email": user.email,
        "hashed_password": pwd_context.hash(user.password[:72]),
        "workouts": 0,
        "streak": 0,
        "last_workout_date": None,
        "workout_log": [],
        "last_mood": "neutral",
        "joined": now,
        "created_at": now,
        "last_login": now,
        "activity_log": [{"action": "Registered", "time": datetime.utcnow().isoformat()}],
    }
    users_collection.insert_one({**new_user})

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = jwt.encode({"sub": user.email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer", "user": {"id": new_user["id"], "email": new_user["email"], "name": new_user["name"]}}

@router.post("/login", response_model=Token)
async def login(user: UserCreate):
    stored_user = get_user(user.email)
    if not stored_user or not pwd_context.verify(user.password, stored_user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    now = datetime.utcnow()
    log = stored_user.get("activity_log") or []
    if isinstance(log, str):
        log = json.loads(log)
    log.append({"action": "Logged in", "time": now.isoformat()})

    users_collection.update_one(
        {"email": user.email},
        {"$set": {
            "last_login": now.strftime("%Y-%m-%d %H:%M"),
            "activity_log": log[-10:],
        }}
    )

    expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = jwt.encode({"sub": stored_user["email"], "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)
   return {"access_token": token, "token_type": "bearer", "user": {"id": stored_user["id"], "email": stored_user["email"], "name": stored_user.get("name", "")}}

# ─── Me Route (for dashboard streak) ─────────────────────────────────────────

@router.get("/me")
async def get_me(authorization: Optional[str] = Header(None)):
    """Returns the logged-in user's profile including streak and workouts."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = get_user(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user["id"],
        "email": user["email"],
        "name": user.get("name", ""),
        "workouts": user.get("workouts", 0),
        "streak": user.get("streak", 0),
        "last_mood": user.get("last_mood", "neutral"),
        "last_workout_date": user.get("last_workout_date", None),
        "joined": user.get("joined", ""),
    }


@router.post("/forgot-password")
async def forgot_password(req: ForgotRequest):
    if not get_user(req.email):
        raise HTTPException(status_code=404, detail="Email not found")

    otp = str(random.randint(100000, 999999))
    OTP_STORE[req.email] = {
        "otp": otp,
        "expires": (datetime.utcnow() + timedelta(minutes=10)).isoformat()
    }

    sent = send_otp_email(req.email, otp)

    if sent:
        return {"message": "OTP sent! Check your email."}
    else:
        print(f"\n==== FALLBACK OTP for {req.email}: {otp} ====\n")
        return {"message": "OTP sent! Check your email or backend terminal."}


@router.post("/reset-password")
async def reset_password(req: VerifyOTP):
    stored = OTP_STORE.get(req.email)
    if not stored:
        raise HTTPException(status_code=400, detail="No OTP requested for this email")
    if datetime.utcnow() > datetime.fromisoformat(stored["expires"]):
        raise HTTPException(status_code=400, detail="OTP has expired")
    if stored["otp"] != req.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    users_collection.update_one(
        {"email": req.email},
        {"$set": {"hashed_password": pwd_context.hash(req.new_password[:72])}}
    )
    del OTP_STORE[req.email]
    return {"message": "Password reset successful"}


# ─── Admin Routes ─────────────────────────────────────────────────────────────

@router.get("/admin/users")
async def get_all_users():
    users = list(users_collection.find({}, {"_id": 0}).sort("id", 1))
    return [
        {
            "id": u["id"],
            "email": u["email"],
            "name": u.get("name", ""),
            "dob": u.get("dob", ""),
            "age": calc_age(u.get("dob", "")),
            "joined": u.get("joined", "N/A"),
            "created_at": u.get("created_at", "N/A"),
            "last_login": u.get("last_login", "N/A"),
            "workouts": u.get("workouts", 0),
            "streak": u.get("streak", 0),
            "lastMood": u.get("last_mood", "neutral"),
            "activity_log": u.get("activity_log", []),
        }
        for u in users
    ]


@router.get("/admin/stats")
async def get_stats():
    users = list(users_collection.find({}, {"_id": 0}))
    total_users = len(users)
    total_workouts = sum(u.get("workouts", 0) for u in users)
    avg_workouts = round(total_workouts / total_users, 1) if total_users > 0 else 0

    # Mood distribution
    mood_counts: dict = {}
    for u in users:
        mood = u.get("last_mood", "neutral")
        mood_counts[mood] = mood_counts.get(mood, 0) + 1

    top_mood = max(mood_counts, key=mood_counts.get) if mood_counts else "neutral"

    # Registrations by date
    reg_by_date: dict = {}
    for u in users:
        date = u.get("created_at", u.get("joined", "unknown"))
        reg_by_date[date] = reg_by_date.get(date, 0) + 1

    # Workout activity over time — aggregate all workout_log entries across all users
    workout_trend: dict = {}
    for u in users:
        for entry in u.get("workout_log", []):
            date = entry.get("date", "")
            if date:
                workout_trend[date] = workout_trend.get(date, 0) + 1

    # Age group distribution — derived from dob
    age_groups = {"13-17": 0, "18-35": 0, "36-55": 0, "56+": 0}
    for u in users:
        age = calc_age(u.get("dob", ""))
        if age is not None:
            if age <= 17:
                age_groups["13-17"] += 1
            elif age <= 35:
                age_groups["18-35"] += 1
            elif age <= 55:
                age_groups["36-55"] += 1
            else:
                age_groups["56+"] += 1

    # Streak leaderboard — top 10 users by streak
    streak_leaders = sorted(
        [{"name": u.get("name", u["email"].split("@")[0]), "streak": u.get("streak", 0)} for u in users],
        key=lambda x: x["streak"],
        reverse=True
    )[:10]

    return {
        "total_users": total_users,
        "total_workouts": total_workouts,
        "avg_workouts": avg_workouts,
        "top_mood": top_mood,
        "mood_counts": mood_counts,
        "registrations_by_date": reg_by_date,
        "workout_trend": workout_trend,
        "age_groups": age_groups,
        "streak_leaders": streak_leaders,
    }


@router.delete("/admin/users/{email}")
async def delete_user(email: str):
    if not get_user(email):
        raise HTTPException(status_code=404, detail="User not found")
    users_collection.delete_one({"email": email})
    return {"message": f"User {email} deleted successfully"}


@router.put("/admin/users/{email}")
async def update_user(email: str, updates: dict):
    if not get_user(email):
        raise HTTPException(status_code=404, detail="User not found")
    safe = {k: v for k, v in updates.items() if k not in ("hashed_password", "id")}
    if "lastMood" in safe:
        safe["last_mood"] = safe.pop("lastMood")
    users_collection.update_one({"email": email}, {"$set": safe})
    return {"message": "User updated"}


@router.post("/admin/users")
async def create_user(user: RegisterUser):
    if get_user(user.email):
        raise HTTPException(status_code=400, detail="Email already exists")
    now = datetime.utcnow().strftime("%Y-%m-%d")
    new_user = {
        "id": get_next_id(),
        "name": user.name,
        "dob": user.dob,
        "email": user.email,
        "hashed_password": pwd_context.hash(user.password[:72]),
        "workouts": 0,
        "streak": 0,
        "last_workout_date": None,
        "workout_log": [],
        "last_mood": "neutral",
        "joined": now,
        "created_at": now,
        "last_login": "Never",
        "activity_log": [{"action": "Created by admin", "time": datetime.utcnow().isoformat()}],
    }
    users_collection.insert_one({**new_user})
    new_user.pop("hashed_password", None)
    return {"message": "User created", "user": new_user}


@router.post("/admin/email")
async def send_email_to_user(payload: dict):
    to_email = payload.get("email")
    subject = payload.get("subject", "Message from FitMood")
    body = payload.get("body", "")
    if not to_email or not body:
        raise HTTPException(status_code=400, detail="Email and body are required")

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }
    payload_data = {
        "sender": {"name": "FitMood", "email": EMAIL_SENDER},
        "to": [{"email": to_email}],
        "subject": subject,
        "textContent": body
    }
    response = requests.post(url, json=payload_data, headers=headers, timeout=10)
    if response.status_code in (200, 201):
        return {"message": "Email sent successfully"}
    raise HTTPException(status_code=500, detail=f"Failed to send email: {response.text}")