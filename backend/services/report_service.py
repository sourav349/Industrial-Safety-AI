import json
from datetime import datetime
from pathlib import Path
from typing import Any

import cv2


class ReportService:
    def __init__(
        self,
        incidents_directory: str = "data/incidents",
        snapshots_directory: str = "data/snapshots",
    ) -> None:
        self.incidents_directory = Path(incidents_directory)
        self.snapshots_directory = Path(snapshots_directory)

        self.incidents_directory.mkdir(parents=True, exist_ok=True)
        self.snapshots_directory.mkdir(parents=True, exist_ok=True)

    def create_incident(
        self,
        worker: dict[str, Any],
        frame: Any,
        camera_id: str = "camera-01",
    ) -> dict[str, Any]:
        timestamp = datetime.now()
        incident_id = timestamp.strftime("%Y%m%d_%H%M%S_%f")

        snapshot_name = f"{incident_id}.jpg"
        snapshot_path = self.snapshots_directory / snapshot_name

        cv2.imwrite(str(snapshot_path), frame)

        incident = {
            "incident_id": incident_id,
            "camera_id": camera_id,
            "worker_id": worker["worker_id"],
            "timestamp": timestamp.isoformat(),
            "missing_ppe": worker.get("missing_ppe", []),
            "detected_ppe": worker.get("detected_ppe", []),
            "risk_score": worker.get("risk_score", 0),
            "risk_level": worker.get("risk_level", "SAFE"),
            "snapshot_path": str(snapshot_path),
            "status": "OPEN",
        }

        report_path = self.incidents_directory / f"{incident_id}.json"

        with open(report_path, "w", encoding="utf-8") as file:
            json.dump(incident, file, indent=4)

        return incident

    def get_all_incidents(self) -> list[dict[str, Any]]:
        incidents: list[dict[str, Any]] = []

        for report_path in sorted(
            self.incidents_directory.glob("*.json"),
            reverse=True,
        ):
            try:
                with open(report_path, "r", encoding="utf-8") as file:
                    incidents.append(json.load(file))
            except (json.JSONDecodeError, OSError):
                continue

        return incidents