from pydantic import BaseModel, Field
from typing import Optional

class LoginRequest(BaseModel):
    email: str = Field(..., min_length=1)
    password: str = Field(..., min_length=6)

class RegisterRequest(BaseModel):
    email: str = Field(..., min_length=1)
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=1)
    role: str = "healthcare_worker"
    phone: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    name: str
    role: str

class FirebaseAuthRequest(BaseModel):
    id_token: str = Field(..., min_length=1)

class UserProfile(BaseModel):
    id: str
    email: str
    name: str
    role: str
    phone: str
    is_active: bool
    created_at: str
