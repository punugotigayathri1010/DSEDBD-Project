from fastapi import APIRouter, Depends, HTTPException # Make sure to import HTTPException!
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.schemas import SigninSchema, SignupSchema, AddStudentSchema, UpdateMetricsSchema
import httpx

router = APIRouter(prefix="/api")
SPRING_URL = "http://localhost:1821/api/"
NODE_URL = "http://localhost:5000/api/"
security = HTTPBearer()

# --- UPDATE THIS FUNCTION ---
def safe_response(response):
    # If Spring Boot rejects it (401, 403, 404, etc), FastAPI should too!
    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    
    try:
        return response.json()
    except:
        return {"message": response.text}

# ---------------- AUTH ENDPOINTS ----------------
@router.post("/auth/signup")
async def signup(req: SignupSchema):
    async with httpx.AsyncClient() as client:
        response = await client.post(SPRING_URL + "auth/signup", json=req.model_dump())
    return safe_response(response)

@router.post("/auth/signin")
async def signin(req: SigninSchema):
    async with httpx.AsyncClient() as client:
        payload = {"email": req.username, "password": req.password}
        response = await client.post(SPRING_URL + "auth/signin", json=payload)
    return safe_response(response)


# ---------------- FACULTY ENDPOINTS ----------------
@router.post("/faculty/add-student")
async def add_student(req: AddStudentSchema, token: HTTPAuthorizationCredentials = Depends(security)):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            SPRING_URL + "faculty/add-student",
            json=req.model_dump(),
            # Fix: Just pass the raw credentials, Spring Boot expects standard format
            headers={"Authorization": f"Bearer {token.credentials}"} 
        )
    return safe_response(response)

@router.put("/faculty/update-metrics")
async def update_metrics(req: UpdateMetricsSchema, token: HTTPAuthorizationCredentials = Depends(security)):
    async with httpx.AsyncClient() as client:
        response = await client.put(
            SPRING_URL + "faculty/update-metrics",
            json=req.model_dump(),
            headers={"Authorization": f"Bearer {token.credentials}"}
        )
    return safe_response(response)

@router.get("/faculty/all-students")
async def all_students(token: HTTPAuthorizationCredentials = Depends(security)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            SPRING_URL + "faculty/all-students",
            headers={"Authorization": f"Bearer {token.credentials}"}
        )
    return safe_response(response)

@router.delete("/faculty/delete-student/{id}")
async def delete_student(id: int, token: HTTPAuthorizationCredentials = Depends(security)):
    async with httpx.AsyncClient() as client:
        response = await client.delete(
            f"{SPRING_URL}faculty/delete-student/{id}",
            headers={"Authorization": f"Bearer {token.credentials}"}
        )
    return safe_response(response)


@router.get("/faculty/student-metrics/{student_id}")
async def faculty_student_metrics(student_id: int, token: HTTPAuthorizationCredentials = Depends(security)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SPRING_URL}faculty/student-metrics/{student_id}",
            headers={"Authorization": f"Bearer {token.credentials}"}
        )
    return safe_response(response)

# ---------------- NODE.JS + MONGODB VIEW ENDPOINTS ----------------
@router.get("/node/student-view/{student_id}")
async def get_node_student_view(student_id: int, token: HTTPAuthorizationCredentials = Depends(security)):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{NODE_URL}student-view/{student_id}")
    return safe_response(response)

@router.post("/node/student-view")
async def save_node_student_view(req: dict, token: HTTPAuthorizationCredentials = Depends(security)):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{NODE_URL}student-view", json=req)
    return safe_response(response)

@router.put("/node/student-view/{student_id}")
async def update_node_student_view(student_id: int, req: dict, token: HTTPAuthorizationCredentials = Depends(security)):
    async with httpx.AsyncClient() as client:
        response = await client.put(f"{NODE_URL}student-view/{student_id}", json=req)
    return safe_response(response)

@router.delete("/node/student-view/{student_id}")
async def delete_node_student_view(student_id: int, token: HTTPAuthorizationCredentials = Depends(security)):
    async with httpx.AsyncClient() as client:
        response = await client.delete(f"{NODE_URL}student-view/{student_id}")
    return safe_response(response)


# ---------------- STUDENT ENDPOINTS ----------------
@router.get("/student/profile")
async def student_profile(token: HTTPAuthorizationCredentials = Depends(security)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            SPRING_URL + "student/profile",
            headers={"Authorization": f"Bearer {token.credentials}"}
        )
    return safe_response(response)

@router.get("/student/marks")
async def student_marks(token: HTTPAuthorizationCredentials = Depends(security)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            SPRING_URL + "student/marks",
            headers={"Authorization": f"Bearer {token.credentials}"}
        )
    return safe_response(response)

@router.get("/student/attendance")
async def student_attendance(token: HTTPAuthorizationCredentials = Depends(security)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            SPRING_URL + "student/attendance",
            headers={"Authorization": f"Bearer {token.credentials}"}
        )
    return safe_response(response)