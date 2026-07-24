from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.camera import router as camera_router
from api.dashboard import router as dashboard_router
from api.health import router as health_router
from api.incidents import router as incidents_router


app = FastAPI(
    title="HumanShield AI",
    description=(
        "Real-time PPE compliance and "
        "industrial safety monitoring"
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(camera_router)
app.include_router(incidents_router)
app.include_router(dashboard_router)
app.include_router(health_router)


@app.get("/")
def root() -> dict:
    return {
        "project": "HumanShield AI",
        "status": "running",
        "docs": "/docs",
    }