from collections import Counter
from pathlib import Path

from fastapi import APIRouter

from services.report_service import ReportService


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

PROJECT_ROOT = Path(__file__).resolve().parents[2]

report_service = ReportService(
    incidents_directory=str(PROJECT_ROOT / "backend" / "data" / "incidents"),
    snapshots_directory=str(PROJECT_ROOT / "backend" / "data" / "snapshots"),
)


@router.get("/summary")
def dashboard_summary() -> dict:
    incidents = report_service.get_all_incidents()

    risk_counter = Counter(
        incident.get("risk_level", "UNKNOWN")
        for incident in incidents
    )

    violation_counter: Counter = Counter()

    for incident in incidents:
        violation_counter.update(
            incident.get("missing_ppe", [])
        )

    return {
        "total_incidents": len(incidents),
        "critical_incidents": risk_counter.get("CRITICAL", 0),
        "high_risk_incidents": risk_counter.get("HIGH", 0),
        "risk_distribution": dict(risk_counter),
        "violation_distribution": dict(violation_counter),
    }