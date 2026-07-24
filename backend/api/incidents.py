from pathlib import Path
from typing import Literal

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from services.incident_service import IncidentService


router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"],
)

PROJECT_ROOT = Path(__file__).resolve().parents[2]

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


IncidentStatus = Literal[
    "OPEN",
    "ACKNOWLEDGED",
    "RESOLVED",
    "FALSE_POSITIVE",
]


class IncidentStatusRequest(BaseModel):
    status: IncidentStatus = Field(
        description="Updated incident status",
    )


@router.get("")
def list_incidents(
    limit: int | None = Query(
        default=None,
        ge=1,
        le=500,
    ),
    status: str | None = Query(
        default=None,
        description=(
            "Filter by OPEN, ACKNOWLEDGED, "
            "RESOLVED or FALSE_POSITIVE."
        ),
    ),
    risk_level: str | None = Query(
        default=None,
        description=(
            "Filter by SAFE, LOW, MEDIUM, "
            "HIGH or CRITICAL."
        ),
    ),
) -> dict:
    incidents = incident_service.get_all_incidents(
        limit=limit,
        status=status,
        risk_level=risk_level,
    )

    return {
        "count": len(incidents),
        "incidents": incidents,
    }


@router.get("/summary")
def get_incident_summary() -> dict:
    return incident_service.get_summary()


@router.get("/{incident_id}")
def get_incident(
    incident_id: str,
) -> dict:
    incident = incident_service.get_incident(
        incident_id,
    )

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    return incident


@router.get("/{incident_id}/snapshot")
def get_incident_snapshot(
    incident_id: str,
) -> FileResponse:
    incident = incident_service.get_incident(
        incident_id,
    )

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    snapshot_path_value = incident.get(
        "snapshot_path",
    )

    if not snapshot_path_value:
        raise HTTPException(
            status_code=404,
            detail="Snapshot path is missing",
        )

    snapshot_path = Path(snapshot_path_value)

    if not snapshot_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Snapshot file not found",
        )

    return FileResponse(
        path=snapshot_path,
        media_type="image/jpeg",
        filename=snapshot_path.name,
    )


@router.patch("/{incident_id}/status")
def update_incident_status(
    incident_id: str,
    request: IncidentStatusRequest,
) -> dict:
    try:
        updated_incident = (
            incident_service.update_incident_status(
                incident_id=incident_id,
                status=request.status,
            )
        )

        return {
            "message": "Incident status updated",
            "incident": updated_incident,
        }

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error


@router.delete("/{incident_id}")
def delete_incident(
    incident_id: str,
) -> dict:
    deleted = incident_service.delete_incident(
        incident_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    return {
        "message": "Incident deleted",
        "incident_id": incident_id,
    }