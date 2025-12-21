from pydantic import BaseModel, EmailStr

class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    display_name: str | None = None

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
