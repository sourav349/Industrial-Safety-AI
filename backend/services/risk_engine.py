from typing import Any


class RiskEngine:
    RISK_WEIGHTS = {
        "helmet": 40,
        "safety-vest": 20,
        "gloves": 15,
        "shoes": 10,
        "face-mask": 5,
        "face-guard": 10,
        "glasses": 5,
        "ear-mufs": 5,
        "medical-suit": 20,
        "safety-suit": 25,
    }

    def calculate_risk(
        self,
        worker: dict[str, Any],
    ) -> dict[str, Any]:
        missing_ppe = worker.get("missing_ppe", [])

        risk_score = sum(
            self.RISK_WEIGHTS.get(item, 5)
            for item in missing_ppe
        )

        detected_ppe = set(worker.get("detected_ppe", []))

        # Context-aware risk increase
        if "tool" in detected_ppe and "gloves" in missing_ppe:
            risk_score += 15

        if "tool" in detected_ppe and "helmet" in missing_ppe:
            risk_score += 20

        risk_score = min(risk_score, 100)

        if risk_score == 0:
            risk_level = "SAFE"
        elif risk_score <= 20:
            risk_level = "LOW"
        elif risk_score <= 40:
            risk_level = "MEDIUM"
        elif risk_score <= 70:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"

        return {
            **worker,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "requires_alert": risk_score >= 40,
        }

    def calculate_all(
        self,
        workers: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        return [
            self.calculate_risk(worker)
            for worker in workers
        ]