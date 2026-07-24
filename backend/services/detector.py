from pathlib import Path
from typing import Any

import torch
from ultralytics import YOLO


class PPEDetector:
    def __init__(
        self,
        model_path: str,
        confidence: float = 0.25,
        iou_threshold: float = 0.50,
    ) -> None:
        path = Path(model_path)

        if not path.exists():
            raise FileNotFoundError(f"Model not found: {path}")

        self.device = "mps" if torch.backends.mps.is_available() else "cpu"
        self.confidence = confidence
        self.iou_threshold = iou_threshold
        self.model = YOLO(str(path))

        print(f"Model loaded from: {path}")
        print(f"Using device: {self.device}")

    def detect_and_track(self, frame: Any) -> Any:
        """
        Runs YOLO detection and ByteTrack tracking.
        """
        results = self.model.track(
            source=frame,
            conf=self.confidence,
            iou=self.iou_threshold,
            device=self.device,
            tracker="bytetrack.yaml",
            persist=True,
            verbose=False,
        )

        return results[0]