
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path
from typing import Optional
from uuid import uuid4

import httpx
from bson import ObjectId
from fastapi import (
    FastAPI,
    Form,
    File,
    UploadFile,
    HTTPException,
    Query,
    Request,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from PIL import Image
from ultralytics import YOLO

from database import client, complaints_collection


# for authentication 
import os
import jwt

from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from pwdlib import PasswordHash
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


# --------------------------------------------------
# Configuration
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Verify MongoDB when FastAPI starts
    await client.admin.command("ping")
    print("MongoDB connected successfully!")

    try:
        yield
    finally:
        await client.close()


app = FastAPI(
    title="Bandra Civic AI API",
    lifespan=lifespan,
)

# =========================
# ADMIN AUTHENTICATION
# =========================

load_dotenv()

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "").strip().lower()
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH", "")
JWT_SECRET = os.getenv("JWT_SECRET", "")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

password_hasher = PasswordHash.recommended()
bearer_scheme = HTTPBearer(auto_error=False)


# admin route 


from pydantic import BaseModel

# login req model 
class AdminLoginRequest(BaseModel):
    email: str
    password: str

# create jwt
def create_access_token(email: str) -> str:
    now = datetime.now(timezone.utc)

    payload = {
        "sub": email,
        "role": "admin",
        "iat": now,
        "exp": now + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        ),
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )


# 3. Verify JWT
async def require_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        bearer_scheme
    ),
):
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Admin authentication required",
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
        )

        email = payload.get("sub")
        role = payload.get("role")

        if (
            not email
            or email != ADMIN_EMAIL
            or role != "admin"
        ):
            raise HTTPException(
                status_code=403,
                detail="Admin access required",
            )

        return {"email": email, "role": role}

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )


# 4. Login endpoint
@app.post("/api/admin/login")
async def admin_login(credentials: AdminLoginRequest):
    if not ADMIN_EMAIL or not ADMIN_PASSWORD_HASH or not JWT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Admin authentication is not configured",
        )

    email = credentials.email.strip().lower()

    if email != ADMIN_EMAIL:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    try:
        password_is_valid = password_hasher.verify(
            credentials.password,
            ADMIN_PASSWORD_HASH,
        )
    except Exception:
        password_is_valid = False

    if not password_is_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    return {
        "access_token": create_access_token(email),
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "admin": {"email": email, "role": "admin"},
    }


# 5. Current admin endpoint — must come last
@app.get("/api/admin/me")
async def get_current_admin(
    admin: dict = Depends(require_admin),
):
    return admin


@app.post("/api/admin/login")
async def admin_login(credentials: AdminLoginRequest):
    from fastapi import HTTPException

    # Ensure required configuration exists.
    if not ADMIN_EMAIL or not ADMIN_PASSWORD_HASH or not JWT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Admin authentication is not configured",
        )

    email = credentials.email.strip().lower()

    # Check email and password hash.
    if email != ADMIN_EMAIL:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    try:
        password_is_valid = password_hasher.verify(
            credentials.password,
            ADMIN_PASSWORD_HASH,
        )
    except Exception:
        password_is_valid = False

    if not password_is_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token(email)

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "admin": {
            "email": email,
            "role": "admin",
        },
    }


@app.get("/api/admin/me")
async def get_current_admin(
    admin: dict = Depends(require_admin),
):
    return admin


@app.get("api/admin/complaints")
async def get_admin_complaints(
    admin:dict = Depends(require_admin)

):
    complaints=await complaint_collection.find().to_list(length=1000)
    return [
        serialize_complaint(complaint)
        for complaint in complaints
    ]







app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads once, not inside the create endpoint
app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="uploads",
)


# --------------------------------------------------
# YOLO model
# --------------------------------------------------

model = YOLO("yolo26n.pt")
print("YOLO model loaded successfully")


# --------------------------------------------------
# Helpers
# --------------------------------------------------

def serialize_complaint(document: dict) -> dict:
    """Convert MongoDB BSON values to JSON-compatible values."""
    document["_id"] = str(document["_id"])
    return document


def validate_complaint_id(complaint_id: str) -> ObjectId:
    if not ObjectId.is_valid(complaint_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid complaint ID",
        )
    return ObjectId(complaint_id)


# --------------------------------------------------
# Reverse geocoding
# --------------------------------------------------

@app.get("/api/geocode/reverse")
async def reverse_geocode(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
):
    url = "https://nominatim.openstreetmap.org/reverse"

    params = {
        "format": "jsonv2",
        "lat": lat,
        "lon": lon,
        "addressdetails": 1,
        "zoom": 18,
    }

    headers = {
        "User-Agent": "BandraCivicAI/1.0 (civic complaint prototype)"
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as http:
            response = await http.get(
                url,
                params=params,
                headers=headers,
            )
            response.raise_for_status()
            result = response.json()

    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=502,
            detail="Address lookup service is temporarily unavailable.",
        ) from exc

    address = result.get("display_name")

    if not address:
        raise HTTPException(
            status_code=404,
            detail="No address found for these coordinates.",
        )

    return {
        "latitude": lat,
        "longitude": lon,
        "address": address,
        "address_details": result.get("address", {}),
        "source": "OpenStreetMap Nominatim",
    }


# --------------------------------------------------
# CREATE complaint
# --------------------------------------------------

@app.post("/api/complaints")
async def create_complaint(
    request: Request,
    title: str = Form(...),
    description: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    area: str = Form(...),
    address: str = Form(...),
    image: UploadFile = File(...),
):
    area = area.strip()

    if area not in ["Bandra East", "Bandra West"]:
        raise HTTPException(
            status_code=400,
            detail="Area must be Bandra East or Bandra West",
        )

    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a valid image",
        )

    image_bytes = await image.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty",
        )

    # Verify that the uploaded file is actually an image
    try:
        with Image.open(BytesIO(image_bytes)) as uploaded_image:
            uploaded_image.verify()
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid image",
        ) from exc

    # Use a unique filename to avoid overwriting other uploads
    extension = Path(image.filename or "").suffix.lower()
    if extension not in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
        extension = ".jpg"

    stored_filename = f"{uuid4().hex}{extension}"
    file_path = UPLOAD_DIR / stored_filename

    file_path.write_bytes(image_bytes)

    now = datetime.now(timezone.utc)

    complaint = {
        "title": title,
        "description": description,
        "location": {
            "latitude": latitude,
            "longitude": longitude,
            "area": area,
            "address": address,
        },
        "image": (
            f"{str(request.base_url).rstrip('/')}"
            f"/uploads/{stored_filename}"
        ),
        "ai": {
            "category": "Not analyzed",
            "confidence": 0.0,
            "severity": "Medium",
            "isDuplicate": False,
            "duplicateComplaintId": None,
        },
        "status": "Pending",
        "createdAt": now,
        "updatedAt": now,
    }

    try:
        result = await complaints_collection.insert_one(complaint)
    except Exception as exc:
        # Avoid leaving an orphaned image if insertion fails
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=500,
            detail="Could not save complaint to the database",
        ) from exc

    complaint["_id"] = str(result.inserted_id)

    return {
        "message": "Complaint Created Successfully",
        "complaint": complaint,
    }


# --------------------------------------------------
# READ all complaints
# --------------------------------------------------

@app.get("/api/complaints")
async def get_complaints():
    cursor = complaints_collection.find().sort("createdAt", -1)
    documents = await cursor.to_list(length=1000)

    return [serialize_complaint(doc) for doc in documents]


# --------------------------------------------------
# READ one complaint
# --------------------------------------------------

@app.get("/api/complaints/{complaint_id}")
async def get_complaint(complaint_id: str):
    mongo_id = validate_complaint_id(complaint_id)

    complaint = await complaints_collection.find_one(
        {"_id": mongo_id}
    )

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found",
        )

    return serialize_complaint(complaint)


# --------------------------------------------------
# UPDATE complaint
# --------------------------------------------------

class ComplaintUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


@app.patch("/api/complaints/{complaint_id}")
async def update_complaint(
    complaint_id: str,
    data: ComplaintUpdate,
):
    mongo_id = validate_complaint_id(complaint_id)

    updates = data.model_dump(
        exclude_unset=True,
        exclude_none=True,
    )

    if not updates:
        raise HTTPException(
            status_code=400,
            detail="Provide a title or description to update",
        )

    updates["updatedAt"] = datetime.now(timezone.utc)

    result = await complaints_collection.update_one(
        {"_id": mongo_id},
        {"$set": updates},
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found",
        )

    complaint = await complaints_collection.find_one(
        {"_id": mongo_id}
    )

    return {
        "message": "Complaint updated successfully",
        "complaint": serialize_complaint(complaint),
    }


# --------------------------------------------------
# DELETE complaint
# --------------------------------------------------

@app.delete("/api/complaints/{complaint_id}")
async def delete_complaint(complaint_id: str):
    mongo_id = validate_complaint_id(complaint_id)

    complaint = await complaints_collection.find_one_and_delete(
        {"_id": mongo_id}
    )

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found",
        )

    return {
        "message": "Complaint deleted successfully",
        "complaint": serialize_complaint(complaint),
    }


# --------------------------------------------------
# AI image analysis
# --------------------------------------------------

@app.post("/api/ai/analyze")
async def analyze_complaint_image(
    image: UploadFile = File(...),
):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a valid image",
        )

    try:
        image_bytes = await image.read()

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="The uploaded image is empty",
            )

        img = Image.open(BytesIO(image_bytes)).convert("RGB")

        results = model.predict(
            source=img,
            device=0,
            conf=0.10,
            verbose=False,
        )

        result = results[0]
        detections = []

        for box in result.boxes:
            class_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())

            detections.append({
                "category": result.names[class_id],
                "confidence": round(confidence, 4),
                "box": [
                    round(float(value), 2)
                    for value in box.xyxy[0].tolist()
                ],
            })

        return {
            "message": "Image analyzed successfully",
            "filename": image.filename,
            "model": "YOLO26n",
            "device": "cuda:0",
            "detections": detections,
            "total_detections": len(detections),
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Image analysis failed: {str(exc)}",
        ) from exc




@app.get("/api/admin/complaints")
async def get_admin_complaints(
    admin: dict = Depends(require_admin),
):
    documents = await complaints_collection.find().sort(
        "createdAt", -1
    ).to_list(length=1000)

    return [
        serialize_complaint(document)
        for document in documents
    ]


# powerbi

# --------------------------------------------------
# POWER BI — Public-safe analytics data
# --------------------------------------------------

@app.get("/api/analytics/powerbi")
async def get_powerbi_analytics():
    try:
        cursor = complaints_collection.find(
            {},
            {
                "_id": 1,
                "location.area": 1,
                "ai.category": 1,
                "ai.severity": 1,
                "status": 1,
                "createdAt": 1,
                "updatedAt": 1,
            },
        ).sort("createdAt", -1)

        documents = await cursor.to_list(length=10000)

        rows = []

        for document in documents:
            location = document.get("location") or {}
            ai = document.get("ai") or {}

            created_at = document.get("createdAt")
            updated_at = document.get("updatedAt")

            rows.append({
                "complaintId": str(document["_id"]),
                "area": location.get("area", "Unknown"),
                "category": ai.get("category", "Unclassified"),
                "severity": ai.get("severity", "Unknown"),
                "status": str(
                    document.get("status", "Unknown")
                ).strip(),
                "createdAt": (
                    created_at.isoformat()
                    if isinstance(created_at, datetime)
                    else None
                ),
                "updatedAt": (
                    updated_at.isoformat()
                    if isinstance(updated_at, datetime)
                    else None
                ),
            })

        return rows




    
    except Exception as exc:
        import traceback
        traceback.print_exc()
        print(f"Power BI analytics error: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Could not retrieve analytics data",
        ) from exc




# --------------------------------------------------
# Root
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Bandra Civic AI is running"
    }
