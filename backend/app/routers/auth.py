from fastapi import APIRouter, HTTPException, status
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import json, os, random, smtplib
from email.mime.text import MIMEText
from app.models.user import UserCreate, RegisterUser, Token, UserResponse, ForgotRequest, VerifyOTP

router = APIRouter()

DB_FILE = "users_db.json"
OTP_STORE = {}

def load_db():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, "r") as f:
            return json.load(f)
    return {}

def save_db(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f)

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

@router.post("/register", response_model=Token)
async def register(user: RegisterUser):
    users_db = load_db()
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    now = datetime.utcnow().strftime("%Y-%m-%d")
    new_user = {
        "id": len(users_db) + 1,
        "name": user.name,
        "dob": user.dob,
        "email": user.email,
        "hashed_password": pwd_context.hash(user.password),
        "workouts": 0,
        "lastMood": "neutral",
        "joined": now,
        "created_at": now,
        "last_login": now,
        "activity_log": [{"action": "Registered", "time": datetime.utcnow().isoformat()}],
    }
    users_db[user.email] = new_user
    save_db(users_db)
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = jwt.encode({"sub": user.email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer", "user": {"id": new_user["id"], "email": new_user["email"]}}

@router.post("/login", response_model=Token)
async def login(user: UserCreate):
    users_db = load_db()
    stored_user = users_db.get(user.email)
    if not stored_user or not pwd_context.verify(user.password, stored_user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    now = datetime.utcnow()
    stored_user["last_login"] = now.strftime("%Y-%m-%d %H:%M")
    log = stored_user.get("activity_log", [])
    log.append({"action": "Logged in", "time": now.isoformat()})
    stored_user["activity_log"] = log[-10:]
    users_db[user.email] = stored_user
    save_db(users_db)
    expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = jwt.encode({"sub": stored_user["email"], "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer", "user": {"id": stored_user["id"], "email": stored_user["email"]}}

@router.post("/forgot-password")
async def forgot_password(req: ForgotRequest):
    users_db = load_db()
    if req.email not in users_db:
        raise HTTPException(status_code=404, detail="Email not found")
    otp = str(random.randint(100000, 999999))
    OTP_STORE[req.email] = {"otp": otp, "expires": (datetime.utcnow() + timedelta(minutes=10)).isoformat()}
    sent = send_otp_email(req.email, otp)
    if not sent:
        print(f"\n==== OTP for {req.email}: {otp} ====\n")
    return {"message": "OTP sent! Check your email (or backend terminal if email not configured)."}

@router.post("/reset-password")
async def reset_password(req: VerifyOTP):
    stored = OTP_STORE.get(req.email)
    if not stored:
        raise HTTPException(status_code=400, detail="No OTP requested for this email")
    if datetime.utcnow() > datetime.fromisoformat(stored["expires"]):
        raise HTTPException(status_code=400, detail="OTP has expired")
    if stored["otp"] != req.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    users_db = load_db()
    users_db[req.email]["hashed_password"] = pwd_context.hash(req.new_password)
    save_db(users_db)
    del OTP_STORE[req.email]
    return {"message": "Password reset successful"}

@router.get("/admin/users")
async def get_all_users():
    users_db = load_db()
    safe_users = []
    for u in users_db.values():
        safe_users.append({
            "id": u["id"],
            "email": u["email"],
            "name": u.get("name", ""),
            "dob": u.get("dob", ""),
            "age": calc_age(u.get("dob", "")),
            "joined": u.get("joined", "N/A"),
            "created_at": u.get("created_at", u.get("joined", "N/A")),
            "last_login": u.get("last_login", "N/A"),
            "workouts": u.get("workouts", 0),
            "lastMood": u.get("lastMood", "neutral"),
            "activity_log": u.get("activity_log", []),
        })
    safe_users.sort(key=lambda x: x["id"])
    return safe_users

@router.get("/admin/stats")
async def get_stats():
    users_db = load_db()
    users = list(users_db.values())
    total_users = len(users)
    total_workouts = sum(u.get("workouts", 0) for u in users)
    avg_workouts = round(total_workouts / total_users, 1) if total_users > 0 else 0
    mood_counts = {}
    for u in users:
        mood = u.get("lastMood", "neutral")
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
    users_db = load_db()
    if email not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    del users_db[email]
    save_db(users_db)
    return {"message": f"User {email} deleted successfully"}

@router.put("/admin/users/{email}")
async def update_user(email: str, updates: dict):
    users_db = load_db()
    if email not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    for key, value in updates.items():
        if key not in ("hashed_password", "id"):
            users_db[email][key] = value
    log = users_db[email].get("activity_log", [])
    log.append({"action": "Profile updated by admin", "time": datetime.utcnow().isoformat()})
    users_db[email]["activity_log"] = log[-10:]
    save_db(users_db)
    return {"message": "User updated"}

@router.post("/admin/users")
async def create_user(user: RegisterUser):
    users_db = load_db()
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already exists")
    now = datetime.utcnow().strftime("%Y-%m-%d")
    new_user = {
        "id": len(users_db) + 1,
        "name": user.name,
        "dob": user.dob,
        "email": user.email,
        "hashed_password": pwd_context.hash(user.password),
        "workouts": 0,
        "lastMood": "neutral",
        "joined": now,
        "created_at": now,
        "last_login": "Never",
        "activity_log": [{"action": "Created by admin", "time": datetime.utcnow().isoformat()}],
    }
    users_db[user.email] = new_user
    save_db(users_db)
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