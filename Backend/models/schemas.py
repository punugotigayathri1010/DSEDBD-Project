from pydantic import BaseModel, EmailStr
from typing import Optional

class SignupSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    secretKey: Optional[str] = None

class SigninSchema(BaseModel):
    username: str  # Kept as username to match standard OAuth2/Login forms
    password: str

class AddStudentSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
    course: str
    year: int

class UpdateMetricsSchema(BaseModel):
    studentId: int
    marks: float
    attendance: float