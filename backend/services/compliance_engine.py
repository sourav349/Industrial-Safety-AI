from typing import Any


class ComplianceEngine:
    DEFAULT_REQUIRED_PPE = [
        "helmet",
        "safety-vest",
        "gloves",
        "shoes",
    ]

    def __init__(
        self,
        required_ppe: list[str] | None = None,
    ) -> None:
        self.required_ppe = required_ppe or self.DEFAULT_REQUIRED_PPE

    def evaluate_worker(self, worker: dict[str, Any]) -> dict[str, Any]:
        detected = set(worker.get("detected_ppe", []))

        missing = [
            item
            for item in self.required_ppe
            if item not in detected
        ]

        return {
            **worker,
            "required_ppe": self.required_ppe,
            "missing_ppe": missing,
            "is_compliant": len(missing) == 0,
            "compliance_percentage": round(
                (
                    (len(self.required_ppe) - len(missing))
                    / len(self.required_ppe)
                )
                * 100,
                2,
            ),
        }

    def evaluate_all(
        self,
        workers: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        return [
            self.evaluate_worker(worker)
            for worker in workers
        ]