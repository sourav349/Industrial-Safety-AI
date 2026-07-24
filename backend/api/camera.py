from pathlib import Path

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse

from services.compliance_engine import ComplianceEngine
from services.detector import PPEDetector
from services.incident_service import IncidentService
from services.ppe_association import PPEAssociationService
from services.risk_engine import RiskEngine
from services.stream_service import StreamService
from services.tracker import DetectionTracker


router = APIRouter(
    prefix="/camera",
    tags=["Camera"],
)

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = PROJECT_ROOT / "models" / "best.pt"

INCIDENTS_DIRECTORY = (
    PROJECT_ROOT / "backend" / "data" / "incidents"
)

SNAPSHOTS_DIRECTORY = (
    PROJECT_ROOT / "backend" / "data" / "snapshots"
)


incident_service = IncidentService(
    incidents_directory=INCIDENTS_DIRECTORY,
    snapshots_directory=SNAPSHOTS_DIRECTORY,
    camera_id="camera-01",
)

stream_service = StreamService(
    detector=PPEDetector(
        model_path=str(MODEL_PATH),
        confidence=0.25,
        iou_threshold=0.50,
    ),
    tracker=DetectionTracker(),
    ppe_association=PPEAssociationService(),
    compliance_engine=ComplianceEngine(),
    risk_engine=RiskEngine(),
    incident_service=incident_service,
    alert_cooldown_seconds=10,
)


def parse_video_source(
    source: str,
) -> int | str:
    """
    Converts webcam source '0' into integer 0.

    File paths and RTSP URLs remain strings.
    """
    cleaned_source = source.strip()

    if not cleaned_source:
        raise ValueError("Video source cannot be empty")

    if cleaned_source.isdigit():
        return int(cleaned_source)

    return cleaned_source


@router.post("/start")
def start_camera(
    source: str = Query(
        default="0",
        description=(
            "Use 0 for webcam, a file path for video, "
            "or an RTSP camera URL."
        ),
    ),
) -> dict:
    try:
        parsed_source = parse_video_source(source)

        return stream_service.start(parsed_source)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    except RuntimeError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error


@router.post("/stop")
def stop_camera() -> dict:
    return stream_service.stop()


@router.get("/stream")
def camera_stream() -> StreamingResponse:
    if not stream_service.running:
        raise HTTPException(
            status_code=400,
            detail=(
                "Camera stream is not running. "
                "Call POST /camera/start first."
            ),
        )

    return StreamingResponse(
        stream_service.generate_mjpeg(),
        media_type=(
            "multipart/x-mixed-replace; "
            "boundary=frame"
        ),
    )


@router.get("/status")
def camera_status() -> dict:
    return stream_service.get_status()


@router.get("/workers")
def get_current_workers() -> dict:
    workers = stream_service.get_workers()

    return {
        "camera_running": stream_service.running,
        "count": len(workers),
        "workers": workers,
    }


@router.get("/detections")
def get_current_detections() -> dict:
    detections = stream_service.get_detections()

    return {
        "camera_running": stream_service.running,
        "count": len(detections),
        "detections": detections,
    }