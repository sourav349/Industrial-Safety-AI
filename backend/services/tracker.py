from typing import Any


class DetectionTracker:
    def extract_detections(self, result: Any) -> list[dict]:
        detections: list[dict] = []

        if result.boxes is None:
            return detections

        boxes = result.boxes

        for index in range(len(boxes)):
            class_id = int(boxes.cls[index].item())
            confidence = float(boxes.conf[index].item())
            coordinates = boxes.xyxy[index].tolist()

            track_id = None

            if boxes.id is not None:
                track_id = int(boxes.id[index].item())

            class_name = result.names[class_id]

            detections.append(
                {
                    "class_id": class_id,
                    "class_name": class_name,
                    "confidence": round(confidence, 3),
                    "track_id": track_id,
                    "bbox": {
                        "x1": int(coordinates[0]),
                        "y1": int(coordinates[1]),
                        "x2": int(coordinates[2]),
                        "y2": int(coordinates[3]),
                    },
                }
            )

        return detections