import json
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import cv2
import numpy as np


class IncidentService:
    """
    Creates, stores, reads, and updates PPE safety incidents.

    Current storage:
    - Incident metadata: JSON files
    - Incident snapshots: JPG files

    Later, this service can be replaced with PostgreSQL without changing
    the detection, tracking, or streaming logic.
    """

    def __init__(
        self,
        incidents_directory: str | Path,
        snapshots_directory: str | Path,
        camera_id: str = "camera-01",
    ) -> None:
        self.incidents_directory = Path(incidents_directory)
        self.snapshots_directory = Path(snapshots_directory)
        self.camera_id = camera_id

        self.incidents_directory.mkdir(parents=True, exist_ok=True)
        self.snapshots_directory.mkdir(parents=True, exist_ok=True)

        self._lock = threading.Lock()

    def create_incident(
        self,
        worker: dict[str, Any],
        frame: np.ndarray,
        camera_id: str | None = None,
    ) -> dict[str, Any]:
        """
        Saves the incident snapshot and JSON metadata.
        """
        timestamp = datetime.now(timezone.utc)
        incident_id = timestamp.strftime("%Y%m%d_%H%M%S_%f")

        active_camera_id = camera_id or self.camera_id

        snapshot_filename = f"{incident_id}.jpg"
        snapshot_path = self.snapshots_directory / snapshot_filename

        snapshot_saved = cv2.imwrite(str(snapshot_path), frame)

        if not snapshot_saved:
            raise RuntimeError(
                f"Unable to save incident snapshot: {snapshot_path}"
            )

        missing_ppe = list(worker.get("missing_ppe", []))
        detected_ppe = list(worker.get("detected_ppe", []))

        incident = {
            "incident_id": incident_id,
            "camera_id": active_camera_id,
            "worker_id": worker.get("worker_id"),
            "timestamp": timestamp.isoformat(),
            "missing_ppe": missing_ppe,
            "detected_ppe": detected_ppe,
            "risk_score": int(worker.get("risk_score", 0)),
            "risk_level": worker.get("risk_level", "SAFE"),
            "compliance_percentage": float(
                worker.get("compliance_percentage", 0.0)
            ),
            "is_compliant": bool(worker.get("is_compliant", False)),
            "requires_alert": bool(worker.get("requires_alert", False)),
            "snapshot_filename": snapshot_filename,
            "snapshot_path": str(snapshot_path),
            "status": "OPEN",
            "created_at": timestamp.isoformat(),
            "updated_at": timestamp.isoformat(),
        }

        incident_path = (
            self.incidents_directory / f"{incident_id}.json"
        )

        with self._lock:
            self._write_json(incident_path, incident)

        return incident

    def get_all_incidents(
        self,
        limit: int | None = None,
        status: str | None = None,
        risk_level: str | None = None,
    ) -> list[dict[str, Any]]:
        """
        Returns incidents sorted from newest to oldest.
        """
        incidents: list[dict[str, Any]] = []

        report_files = sorted(
            self.incidents_directory.glob("*.json"),
            reverse=True,
        )

        for report_path in report_files:
            incident = self._read_json(report_path)

            if incident is None:
                continue

            if status and incident.get("status") != status.upper():
                continue

            if (
                risk_level
                and incident.get("risk_level") != risk_level.upper()
            ):
                continue

            incidents.append(incident)

            if limit is not None and len(incidents) >= limit:
                break

        return incidents

    def get_incident(
        self,
        incident_id: str,
    ) -> dict[str, Any] | None:
        incident_path = (
            self.incidents_directory / f"{incident_id}.json"
        )

        return self._read_json(incident_path)

    def update_incident_status(
        self,
        incident_id: str,
        status: str,
    ) -> dict[str, Any]:
        allowed_statuses = {
            "OPEN",
            "ACKNOWLEDGED",
            "RESOLVED",
            "FALSE_POSITIVE",
        }

        normalized_status = status.upper()

        if normalized_status not in allowed_statuses:
            raise ValueError(
                f"Invalid status. Allowed values: "
                f"{', '.join(sorted(allowed_statuses))}"
            )

        incident_path = (
            self.incidents_directory / f"{incident_id}.json"
        )

        with self._lock:
            incident = self._read_json(incident_path)

            if incident is None:
                raise FileNotFoundError(
                    f"Incident not found: {incident_id}"
                )

            incident["status"] = normalized_status
            incident["updated_at"] = datetime.now(
                timezone.utc
            ).isoformat()

            self._write_json(incident_path, incident)

        return incident

    def delete_incident(
        self,
        incident_id: str,
    ) -> bool:
        incident_path = (
            self.incidents_directory / f"{incident_id}.json"
        )

        with self._lock:
            incident = self._read_json(incident_path)

            if incident is None:
                return False

            snapshot_path = Path(
                incident.get("snapshot_path", "")
            )

            if incident_path.exists():
                incident_path.unlink()

            if snapshot_path.exists():
                snapshot_path.unlink()

        return True

    def get_summary(self) -> dict[str, Any]:
        incidents = self.get_all_incidents()

        total_incidents = len(incidents)
        open_incidents = 0
        critical_incidents = 0
        high_risk_incidents = 0
        violation_counts: dict[str, int] = {}

        for incident in incidents:
            if incident.get("status") == "OPEN":
                open_incidents += 1

            risk_level = incident.get("risk_level")

            if risk_level == "CRITICAL":
                critical_incidents += 1

            if risk_level == "HIGH":
                high_risk_incidents += 1

            for violation in incident.get("missing_ppe", []):
                violation_counts[violation] = (
                    violation_counts.get(violation, 0) + 1
                )

        return {
            "total_incidents": total_incidents,
            "open_incidents": open_incidents,
            "high_risk_incidents": high_risk_incidents,
            "critical_incidents": critical_incidents,
            "violation_distribution": violation_counts,
        }

    @staticmethod
    def _write_json(
        file_path: Path,
        content: dict[str, Any],
    ) -> None:
        temporary_path = file_path.with_suffix(".tmp")

        with open(
            temporary_path,
            "w",
            encoding="utf-8",
        ) as file:
            json.dump(
                content,
                file,
                indent=4,
                ensure_ascii=False,
            )

        temporary_path.replace(file_path)

    @staticmethod
    def _read_json(
        file_path: Path,
    ) -> dict[str, Any] | None:
        if not file_path.exists():
            return None

        try:
            with open(
                file_path,
                "r",
                encoding="utf-8",
            ) as file:
                return json.load(file)

        except (OSError, json.JSONDecodeError):
            return None