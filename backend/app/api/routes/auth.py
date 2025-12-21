from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session


from sqlalchemy.orm import Session
from app.api.deps import get_db


from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.auth import RegisterIn, TokenOut
from fastapi import Depends
from app.core.auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=TokenOut)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    # email var mı?
    exists = db.execute(
        text("SELECT id FROM users WHERE email = :email LIMIT 1"),
        {"email": payload.email}
    ).mappings().first()

    if exists:
        raise HTTPException(status_code=409, detail="Email already registered")

    pw_hash = hash_password(payload.password)

    # Insert + id döndür
    row = db.execute(
        text("""
            INSERT INTO users (email, password_hash, display_name, role)
            VALUES (:email, :password_hash, :display_name, 'user')
            RETURNING id, role
        """),
        {
            "email": payload.email,
            "password_hash": pw_hash,
            "display_name": payload.display_name,
        }
    ).mappings().first()
    db.commit()

    token = create_access_token(user_id=str(row["id"]), role=row["role"])
    return TokenOut(access_token=token)

@router.post("/login", response_model=TokenOut)
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = db.execute(
        text("SELECT id, role, password_hash FROM users WHERE email = :email LIMIT 1"),
        {"email": email}
    ).mappings().first()

    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user_id=str(user["id"]), role=user["role"])
    return TokenOut(access_token=token)

@router.get("/me")
def me(user=Depends(get_current_user)):
    return user
