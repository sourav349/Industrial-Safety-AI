import threading
import time
from collections.abc import Generator
from typing import Any

import cv2
import numpy as np

from services.compliance_engine import ComplianceEngine
from services.detector import PPEDetector
from services.incident_service import IncidentService
from services.ppe_association import PPEAssociationService
from services.risk_engine import RiskEngine
from services.tracker import DetectionTracker


class StreamService:
    """
    Handles real-time video processing.

    Flow:
    Video source
        -> YOLO detection and ByteTrack tracking
        -> PPE-to-worker association
        -> Compliance checking
        -> Risk calculation
        -> Incident generation
        -> MJPEG video stream
    """

    def __init__(
        self,
        detector: PPEDetector,
        tracker: DetectionTracker,
        ppe_association: PPEAssociationService,
        compliance_engine: ComplianceEngine,
        risk_engine: RiskEngine,
        incident_service: IncidentService,
        alert_cooldown_seconds: int = 10,
    ) -> None:
        self.detector = detector
        self.tracker = tracker
        self.ppe_association = ppe_association
        self.compliance_engine = compliance_engine
        self.risk_engine = risk_engine
        self.incident_service = incident_service

        self.alert_cooldown_seconds = alert_cooldown_seconds

        self.capture: cv2.VideoCapture | None = None
        self.processing_thread: threading.Thread | None = None

        self.running = False
        self.source: int | str | None = None

        self.latest_frame: np.ndarray | None = None
        self.latest_workers: list[dict[str, Any]] = []
        self.latest_detections: list[dict[str, Any]] = []

        self.last_alert_time: dict[int, float] = {}

        self.lock = threading.Lock()

    def start(self, source: int | str = 0) -> dict[str, Any]:
        """
        Starts video processing in a background thread.
        """
        if self.running:
            return {
                "message": "Stream is already running",
                "running": True,
                "source": self.source,
            }

        capture = cv2.VideoCapture(source)

        if not capture.isOpened():
            capture.release()
            raise RuntimeError(f"Unable to open video source: {source}")

        self.capture = capture
        self.source = source
        self.running = True

        self.processing_thread = threading.Thread(
            target=self._process_stream,
            daemon=True,
            name="human-shield-stream-thread",
        )
        self.processing_thread.start()

        return {
            "message": "Stream started",
            "running": True,
            "source": source,
        }

    def stop(self) -> dict[str, Any]:
        """
        Stops the video processing thread and releases resources.
        """
        self.running = False

        if self.processing_thread is not None:
            self.processing_thread.join(timeout=3)
            self.processing_thread = None

        if self.capture is not None:
            self.capture.release()
            self.capture = None

        with self.lock:
            self.latest_frame = None
            self.latest_workers = []
            self.latest_detections = []

        stopped_source = self.source
        self.source = None

        return {
            "message": "Stream stopped",
            "running": False,
            "source": stopped_source,
        }

    def _process_stream(self) -> None:
        """
        Continuously reads and processes video frames.
        """
        try:
            while self.running and self.capture is not None:
                success, frame = self.capture.read()

                if not success:
                    print("Video frame could not be read")
                    break

                try:
                    result = self.detector.detect_and_track(frame)

                    detections = self.tracker.extract_detections(result)

                    workers = self.ppe_association.associate(detections)
                    workers = self.compliance_engine.evaluate_all(workers)
                    workers = self.risk_engine.calculate_all(workers)

                    annotated_frame = result.plot()

                    self._draw_worker_status(
                        frame=annotated_frame,
                        workers=workers,
                    )

                    self._create_incidents(
                        original_frame=frame,
                        workers=workers,
                    )

                    with self.lock:
                        self.latest_frame = annotated_frame.copy()
                        self.latest_workers = workers
                        self.latest_detections = detections

                except Exception as error:
                    print(f"Frame processing error: {error}")
                    time.sleep(0.05)

        finally:
            if self.capture is not None:
                self.capture.release()
                self.capture = None

            self.running = False

    def _draw_worker_status(
        self,
        frame: np.ndarray,
        workers: list[dict[str, Any]],
    ) -> None:
        """
        Draws worker risk information and missing PPE on the frame.
        """
        for worker in workers:
            bbox = worker.get("person_bbox")

            if not bbox:
                continue

            worker_id = worker.get("worker_id", "Unknown")
            risk_level = worker.get("risk_level", "SAFE")
            risk_score = worker.get("risk_score", 0)
            missing_ppe = worker.get("missing_ppe", [])

            color = self._get_risk_color(risk_level)

            x1 = int(bbox["x1"])
            y1 = int(bbox["y1"])
            x2 = int(bbox["x2"])
            y2 = int(bbox["y2"])

            title = (
                f"Worker {worker_id} | "
                f"{risk_level} | "
                f"Risk {risk_score}"
            )

            cv2.putText(
                frame,
                title,
                (x1, max(25, y1 - 12)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                color,
                2,
            )

            if missing_ppe:
                missing_text = "Missing: " + ", ".join(missing_ppe)

                cv2.putText(
                    frame,
                    missing_text,
                    (x1, min(frame.shape[0] - 10, y2 + 22)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    color,
                    2,
                )

    def _create_incidents(
        self,
        original_frame: np.ndarray,
        workers: list[dict[str, Any]],
    ) -> None:
        """
        Creates an incident only after the alert cooldown expires.
        """
        current_time = time.time()

        for worker in workers:
            if not worker.get("requires_alert", False):
                continue

            worker_id = worker.get("worker_id")

            if worker_id is None:
                continue

            worker_id = int(worker_id)

            previous_alert_time = self.last_alert_time.get(
                worker_id,
                0,
            )

            time_since_last_alert = (
                current_time - previous_alert_time
            )

            if time_since_last_alert < self.alert_cooldown_seconds:
                continue

            try:
                self.incident_service.create_incident(
                    worker=worker,
                    frame=original_frame,
                )

                self.last_alert_time[worker_id] = current_time

            except Exception as error:
                print(
                    f"Unable to create incident for worker "
                    f"{worker_id}: {error}"
                )

    @staticmethod
    def _get_risk_color(
        risk_level: str,
    ) -> tuple[int, int, int]:
        """
        Returns OpenCV BGR color based on risk level.
        """
        colors = {
            "SAFE": (0, 255, 0),
            "LOW": (0, 255, 255),
            "MEDIUM": (0, 165, 255),
            "HIGH": (0, 0, 255),
            "CRITICAL": (0, 0, 180),
        }

        return colors.get(risk_level.upper(), (255, 255, 255))

    def generate_mjpeg(self) -> Generator[bytes, None, None]:
        """
        Generates MJPEG frames for browser streaming.
        """
        while self.running:
            with self.lock:
                frame = (
                    self.latest_frame.copy()
                    if self.latest_frame is not None
                    else None
                )

            if frame is None:
                time.sleep(0.05)
                continue

            success, encoded_frame = cv2.imencode(
                ".jpg",
                frame,
                [cv2.IMWRITE_JPEG_QUALITY, 80],
            )

            if not success:
                continue

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n"
                + encoded_frame.tobytes()
                + b"\r\n"
            )

    def get_status(self) -> dict[str, Any]:
        with self.lock:
            return {
                "running": self.running,
                "source": self.source,
                "workers_detected": len(self.latest_workers),
                "detections_count": len(self.latest_detections),
            }

    def get_workers(self) -> list[dict[str, Any]]:
        with self.lock:
            return list(self.latest_workers)

    def get_detections(self) -> list[dict[str, Any]]:
        with self.lock:
            return list(self.latest_detections)