from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, FirebaseAuthRequest, UserProfile
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user
from app.core.firebase import verify_firebase_token
from app.services.firestore_service import firestore_service
from datetime import timedelta, datetime
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest):
    existing = firestore_service.query_by_field("users", "email", request.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    user_data = {
        "id": user_id,
        "email": request.email,
        "password": get_password_hash(request.password),
        "name": request.name,
        "role": request.role,
        "phone": request.phone or "",
        "is_active": True,
        "created_at": datetime.now().isoformat(),
    }
    firestore_service.create_document("users", user_id, user_data)

    access_token = create_access_token(
        data={"sub": user_id, "email": request.email, "role": request.role},
        expires_delta=timedelta(hours=24),
    )

    return TokenResponse(
        access_token=access_token,
        user_id=user_id,
        email=request.email,
        name=request.name,
        role=request.role,
    )

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    users = firestore_service.query_by_field("users", "email", request.email)
    if not users:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = users[0]
    if not verify_password(request.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")

    access_token = create_access_token(
        data={"sub": user["id"], "email": user["email"], "role": user.get("role", "")},
        expires_delta=timedelta(hours=24),
    )

    return TokenResponse(
        access_token=access_token,
        user_id=user["id"],
        email=user["email"],
        name=user.get("name", ""),
        role=user.get("role", ""),
    )

@router.post("/firebase", response_model=TokenResponse)
async def firebase_auth(request: FirebaseAuthRequest):
    try:
        decoded = verify_firebase_token(request.id_token)
        email = decoded.get("email", "")
        name = decoded.get("name", email.split("@")[0])

        users = firestore_service.query_by_field("users", "email", email)
        if users:
            user = users[0]
            user_id = user["id"]
        else:
            user_id = str(uuid.uuid4())
            firestore_service.create_document("users", user_id, {
                "id": user_id,
                "email": email,
                "name": name,
                "role": "healthcare_worker",
                "phone": "",
                "is_active": True,
                "created_at": datetime.now().isoformat(),
            })

        access_token = create_access_token(
            data={"sub": user_id, "email": email},
            expires_delta=timedelta(hours=24),
        )

        return TokenResponse(
            access_token=access_token,
            user_id=user_id,
            email=email,
            name=name,
            role="healthcare_worker",
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Firebase auth failed: {str(e)}")

@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: dict = Depends(get_current_user)):
    user = firestore_service.get_document("users", current_user["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserProfile(
        id=user["id"],
        email=user.get("email", ""),
        name=user.get("name", ""),
        role=user.get("role", ""),
        phone=user.get("phone", ""),
        is_active=user.get("is_active", True),
        created_at=user.get("created_at", ""),
    )
