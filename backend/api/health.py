from pathlib import Path

import cv2
import torch
from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["Health"])

PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = PROJECT_ROOT / "models" / "best.pt"


@router.get("")
def health_check() -> dict:
    model_exists = MODEL_PATH.exists()
    mps_available = torch.backends.mps.is_available()

    camera = cv2.VideoCapture(0)
    camera_available = camera.isOpened()
    camera.release()

    overall_status = (
        "healthy"
        if model_exists and camera_available
        else "degraded"
    )

    return {
        "status": overall_status,
        "service": "HumanShield AI Backend",
        "model": {
            "available": model_exists,
            "path": str(MODEL_PATH),
        },
        "device": {
            "mps_available": mps_available,
            "selected": "mps" if mps_available else "cpu",
        },
        "camera": {
            "available": camera_available,
            "source": 0,
        },
    }


@router.get("/live")
def liveness_check() -> dict:
    return {
        "status": "alive",
        "service": "HumanShield AI Backend",
    }


@router.get("/ready")
def readiness_check() -> dict:
    model_exists = MODEL_PATH.exists()

    return {
        "status": "ready" if model_exists else "not_ready",
        "model_available": model_exists,
    }