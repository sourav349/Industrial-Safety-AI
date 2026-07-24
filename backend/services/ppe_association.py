from typing import Any


class PPEAssociationService:
    PPE_CLASSES = {
        "helmet",
        "gloves",
        "shoes",
        "safety-vest",
        "face-mask",
        "face-guard",
        "glasses",
        "ear-mufs",
        "medical-suit",
        "safety-suit",
        "tool",
    }

    @staticmethod
    def get_center(bbox: dict[str, int]) -> tuple[float, float]:
        center_x = (bbox["x1"] + bbox["x2"]) / 2
        center_y = (bbox["y1"] + bbox["y2"]) / 2
        return center_x, center_y

    @staticmethod
    def point_inside_box(
        point: tuple[float, float],
        bbox: dict[str, int],
        margin: float = 0.10,
    ) -> bool:
        x1 = bbox["x1"]
        y1 = bbox["y1"]
        x2 = bbox["x2"]
        y2 = bbox["y2"]

        width = x2 - x1
        height = y2 - y1

        expanded_x1 = x1 - (width * margin)
        expanded_y1 = y1 - (height * margin)
        expanded_x2 = x2 + (width * margin)
        expanded_y2 = y2 + (height * margin)

        point_x, point_y = point

        return (
            expanded_x1 <= point_x <= expanded_x2
            and expanded_y1 <= point_y <= expanded_y2
        )

    @staticmethod
    def get_body_region(
        person_bbox: dict[str, int],
        region: str,
    ) -> dict[str, int]:
        x1 = person_bbox["x1"]
        y1 = person_bbox["y1"]
        x2 = person_bbox["x2"]
        y2 = person_bbox["y2"]

        height = y2 - y1

        if region == "head":
            return {
                "x1": x1,
                "y1": y1,
                "x2": x2,
                "y2": int(y1 + height * 0.30),
            }

        if region == "torso":
            return {
                "x1": x1,
                "y1": int(y1 + height * 0.20),
                "x2": x2,
                "y2": int(y1 + height * 0.70),
            }

        if region == "feet":
            return {
                "x1": x1,
                "y1": int(y1 + height * 0.70),
                "x2": x2,
                "y2": y2,
            }

        return person_bbox

    def get_region_for_ppe(self, ppe_name: str) -> str:
        head_items = {
            "helmet",
            "face-mask",
            "face-guard",
            "glasses",
            "ear-mufs",
        }

        torso_items = {
            "safety-vest",
            "medical-suit",
            "safety-suit",
            "gloves",
            "tool",
        }

        feet_items = {"shoes"}

        if ppe_name in head_items:
            return "head"

        if ppe_name in torso_items:
            return "torso"

        if ppe_name in feet_items:
            return "feet"

        return "full"

    def associate(self, detections: list[dict[str, Any]]) -> list[dict]:
        people = [
            detection
            for detection in detections
            if detection["class_name"] == "person"
        ]

        ppe_items = [
            detection
            for detection in detections
            if detection["class_name"] in self.PPE_CLASSES
        ]

        workers: list[dict] = []

        for index, person in enumerate(people):
            worker_id = person["track_id"]

            if worker_id is None:
                worker_id = index + 1

            worker = {
                "worker_id": worker_id,
                "person_bbox": person["bbox"],
                "detected_ppe": [],
                "ppe_confidences": {},
            }

            for item in ppe_items:
                ppe_name = item["class_name"]
                ppe_center = self.get_center(item["bbox"])

                region_name = self.get_region_for_ppe(ppe_name)
                worker_region = self.get_body_region(
                    person["bbox"],
                    region_name,
                )

                if self.point_inside_box(ppe_center, worker_region):
                    worker["detected_ppe"].append(ppe_name)
                    worker["ppe_confidences"][ppe_name] = item["confidence"]

            workers.append(worker)

        return workers