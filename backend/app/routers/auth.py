"""
app/routers/auth.py
-------------------
Authentication router — MongoDB + improved OTP email sending.
"""

from fastapi import APIRouter, HTTPException, status
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os, random, smtplib, json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.models.user import UserCreate, RegisterUser, Token, UserResponse, ForgotRequest, VerifyOTP
from app.database import users_collection

router = APIRouter()
OTP_STORE = {}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "fitmood-secret-key-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

EMAIL_SENDER = os.environ.get("EMAIL_SENDER", "")
EMAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD", "")


# ─── Helpers ─────────────────────────────────────────────────────────────────

def send_otp_email(to_email: str, otp: str) -> bool:
    try:
        print(f"[EMAIL] Attempting to send OTP to {to_email}")
        print(f"[EMAIL] Using sender: {EMAIL_SENDER}")
        print(f"[EMAIL] Password set: {'YES' if EMAIL_PASSWORD else 'NO'}")

        msg = MIMEMultipart("alternative")
        msg["Subject"] = "FitMood — Your Password Reset OTP"
        msg["From"] = f"FitMood <{EMAIL_SENDER}>"
        msg["To"] = to_email

        # Plain text version
        text_body = f"""
Hi there!

Your FitMood OTP code is: {otp}

This code is valid for 10 minutes.
Do not share this code with anyone.

— FitMood Team
"""

        # HTML version (nicer looking email)
        html_body = f"""
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
"""

        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.send_message(msg)

        print(f"[EMAIL] OTP sent successfully to {to_email}")
        return True

    except smtplib.SMTPAuthenticationError:
        print(f"[EMAIL ERROR] Authentication failed — check EMAIL_SENDER and EMAIL_PASSWORD env vars")
        return False
    except smtplib.SMTPException as e:
        print(f"[EMAIL ERROR] SMTP error: {e}")
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
        "last_mood": "neutral",
        "joined": now,
        "created_at": now,
        "last_login": now,
        "activity_log": [{"action": "Registered", "time": datetime.utcnow().isoformat()}],
    }
    users_collection.insert_one({**new_user})

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

    users_collection.update_one(
        {"email": user.email},
        {"$set": {
            "last_login": now.strftime("%Y-%m-%d %H:%M"),
            "activity_log": log[-10:],
        }}
    )

    expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = jwt.encode({"sub": stored_user["email"], "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer", "user": {"id": stored_user["id"], "email": stored_user["email"]}}


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

    mood_counts: dict = {}
    for u in users:
        mood = u.get("last_mood", "neutral")
        mood_counts[mood] = mood_counts.get(mood, 0) + 1

    top_mood = max(mood_counts, key=mood_counts.get) if mood_counts else "neutral"

    reg_by_date: dict = {}
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
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"FitMood <{EMAIL_SENDER}>"
        msg["To"] = to_email
        msg.attach(MIMEText(body, "plain"))
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.send_message(msg)
        return {"message": "Email sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")