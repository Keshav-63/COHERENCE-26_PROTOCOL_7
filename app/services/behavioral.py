from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase

class BehavioralService:
    @staticmethod
    async def get_historical_stats(db: AsyncIOMotorDatabase, dept_name: str, category: str):
        """
        Fetch the 5-year average for a specific department and category.
        In a real scenario, this would aggregate data from the 'baselines' collection.
        """
        baseline = await db["baselines"].find_one({
            "dept_name": dept_name,
            "item_category": category
        })
        
        # If no baseline exists, we return a default (neutral) value
        if not baseline:
            return None
        return baseline.get("avg_annual_spend", 0)

    @staticmethod
    def analyze_spending_drift(current_amount: float, avg_spend: float):
        """
        Logic for the '50x Jump'.
        Returns a risk score (0 to 1) and a reason.
        """
        if avg_spend == 0 or avg_spend is None:
            return 0.1, "No historical baseline found. New spending pattern."

        drift_ratio = current_amount / avg_spend

        # The '50x Jump' logic
        if drift_ratio >= 50.0:
            return 1.0, f"Critical Anomaly: {int(drift_ratio)}x jump vs 5-year average."
        
        # Moderate drift (e.g., 5x to 10x)
        if drift_ratio >= 5.0:
            return 0.6, f"Suspicious Spike: {round(drift_ratio, 1)}x increase detected."
        
        return 0.0, "Spending within normal historical limits."

    @staticmethod
    def check_march_rush(timestamp: datetime):
        """
        Detects if the transaction is happening in the final week of the fiscal year.
        (Assuming Indian Fiscal Year ends March 31st).
        """
        if timestamp.month == 3 and timestamp.day > 24:
            return 0.4, "Fiscal Year-End 'March Rush' detected."
        return 0.0, None

# Usage in the main logic:
# risk, reason = BehavioralService.analyze_spending_drift(450000, 9000)