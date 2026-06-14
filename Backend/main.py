from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.init import *

app = FastAPI(title="FastAPI Gateway to Spring Boot")

# Enable CORS for frontend (e.g., React/Vite)
origins = ["http://localhost:5173", "*"] 

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Register all routes from the init.py file
app.include_router(DashboardRouter)

@app.get("/")
def home():
    return {"status": "FastAPI Gateway is running..."}