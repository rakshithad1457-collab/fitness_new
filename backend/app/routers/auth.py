from fastapi import APIRouter, HTTPException, status
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os, random, smtplib, json
from email.mime.text import MIMEText
from supabase import create_client
from app.models.user import UserCreate, RegisterUser, Token, UserResponse, ForgotRequest, VerifyOTP

router = APIRouter()
OTP_STORE = {}

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "fitmood-secret-key-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

EMAIL_SENDER = "rakshithad1457@gmail.com"
EMAIL_PASSWORD = "qvnz jwhz cldt dxyg"

def send_otp_email(to_email, otp):
    try:
        msg = MIMEText(f"Your FitMood OTP is: {otp}\n\nValid for 10 minutes.")
        msg["Subject"] = "FitMood Password Reset OTP"
        msg["From"] = EMAIL_SENDER
        msg["To"] = to_email
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

def calc_age(dob_str):
    try:
        dob = datetime.strptime(dob_str, "%Y-%m-%d")
        today = datetime.utcnow()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    except:
        return None

def get_user(email):
    res = supabase.table("users").select("*").eq("email", email).execute()
    return res.data[0] if res.data else None

def get_next_id():
    res = supabase.table("users").select("id").order("id", desc=True).limit(1).execute()
    return (res.data[0]["id"] + 1) if res.data else 1

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
        "hashed_password": pwd_context.hash(user.password),
        "workouts": 0,
        "last_mood": "neutral",
        "joined": now,
        "created_at": now,
        "last_login": now,
        "activity_log": [{"action": "Registered", "time": datetime.utcnow().isoformat()}],
    }
    supabase.table("users").insert(new_user).execute()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = jwt.encode({"sub": user.email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer", "user": {"id": new_user["id"], "email": new_user["email"]}}

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
    supabase.table("users").update({
        "last_login": now.strftime("%Y-%m-%d %H:%M"),
        "activity_log": log[-10:],
    }).eq("email", user.email).execute()
    expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = jwt.encode({"sub": stored_user["email"], "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer", "user": {"id": stored_user["id"], "email": stored_user["email"]}}

@router.post("/forgot-password")
async def forgot_password(req: ForgotRequest):
    if not get_user(req.email):
        raise HTTPException(status_code=404, detail="Email not found")
    otp = str(random.randint(100000, 999999))
    OTP_STORE[req.email] = {"otp": otp, "expires": (datetime.utcnow() + timedelta(minutes=10)).isoformat()}
    sent = send_otp_email(req.email, otp)
    if not sent:
        print(f"\n==== OTP for {req.email}: {otp} ====\n")
    return {"message": "OTP sent! Check your email."}

@router.post("/reset-password")
async def reset_password(req: VerifyOTP):
    stored = OTP_STORE.get(req.email)
    if not stored:
        raise HTTPException(status_code=400, detail="No OTP requested for this email")
    if datetime.utcnow() > datetime.fromisoformat(stored["expires"]):
        raise HTTPException(status_code=400, detail="OTP has expired")
    if stored["otp"] != req.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    supabase.table("users").update({
        "hashed_password": pwd_context.hash(req.new_password)
    }).eq("email", req.email).execute()
    del OTP_STORE[req.email]
    return {"message": "Password reset successful"}

@router.post("/update-mood")
async def update_mood(payload: dict):
    email = payload.get("email")
    mood = payload.get("mood")
    if not email or not mood:
        raise HTTPException(status_code=400, detail="Email and mood required")
    supabase.table("users").update({"last_mood": mood}).eq("email", email).execute()
    return {"message": "Mood updated"}

@router.get("/admin/users")
async def get_all_users():
    res = supabase.table("users").select("*").order("id").execute()
    users = []
    for u in res.data:
        users.append({
            "id": u["id"],
            "email": u["email"],
            "name": u.get("name", ""),
            "dob": u.get("dob", ""),
            "age": calc_age(u.get("dob", "")),
            "joined": u.get("joined", "N/A"),
            "created_at": u.get("created_at", "N/A"),
            "last_login": u.get("last_login", "N/A"),
            "workouts": u.get("workouts", 0),
            "lastMood": u.get("last_mood", "neutral"),
            "activity_log": u.get("activity_log", []),
        })
    return users

@router.get("/admin/stats")
async def get_stats():
    res = supabase.table("users").select("*").execute()
    users = res.data
    total_users = len(users)
    total_workouts = sum(u.get("workouts", 0) for u in users)
    avg_workouts = round(total_workouts / total_users, 1) if total_users > 0 else 0
    mood_counts = {}
    for u in users:
        mood = u.get("last_mood", "neutral")
        mood_counts[mood] = mood_counts.get(mood, 0) + 1
    top_mood = max(mood_counts, key=mood_counts.get) if mood_counts else "neutral"
    reg_by_date = {}
    for u in users:
        date = u.get("created_at", u.get("joined", "unknown"))
        reg_by_date[date] = reg_by_date.get(date, 0) + 1
    return {
        "total_users": total_users,
        "total_workouts": total_workouts,
        "avg_workouts": avg_workouts,
        "top_mood": top_mood,
        "mood_counts": mood_counts,
        "registrations_by_date": reg_by_date,
    }

@router.delete("/admin/users/{email}")
async def delete_user(email: str):
    if not get_user(email):
        raise HTTPException(status_code=404, detail="User not found")
    supabase.table("users").delete().eq("email", email).execute()
    return {"message": f"User {email} deleted successfully"}

@router.put("/admin/users/{email}")
async def update_user(email: str, updates: dict):
    if not get_user(email):
        raise HTTPException(status_code=404, detail="User not found")
    safe = {k: v for k, v in updates.items() if k not in ("hashed_password", "id")}
    if "lastMood" in safe:
        safe["last_mood"] = safe.pop("lastMood")
    supabase.table("users").update(safe).eq("email", email).execute()
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
        "hashed_password": pwd_context.hash(user.password),
        "workouts": 0,
        "last_mood": "neutral",
        "joined": now,
        "created_at": now,
        "last_login": "Never",
        "activity_log": [{"action": "Created by admin", "time": datetime.utcnow().isoformat()}],
    }
    supabase.table("users").insert(new_user).execute()
    return {"message": "User created", "user": new_user}

@router.post("/admin/email")
async def send_email_to_user(payload: dict):
    to_email = payload.get("email")
    subject = payload.get("subject", "Message from FitMood")
    body = payload.get("body", "")
    if not to_email or not body:
        raise HTTPException(status_code=400, detail="Email and body are required")
    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = EMAIL_SENDER
        msg["To"] = to_email
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.send_message(msg)
        return {"message": "Email sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")