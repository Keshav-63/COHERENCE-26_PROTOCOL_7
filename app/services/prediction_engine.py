import math
from typing import List, Dict, Any

class PredictionEngine:
    """
    Rule-based and trend-based prediction engine for scheme-level budget utilization.
    """
    
    @staticmethod
    def calculate_lapse_risk(utilization_percent: float, current_month: int) -> Dict[str, Any]:
        time_elapsed_percent = (current_month / 12) * 100
        util_gap = time_elapsed_percent - utilization_percent
        
        # Base risk score calculation
        if util_gap <= 0:
            risk_score = 0.0
        else:
            # Scale gap to a 0.0-1.0 base
            # A 50% gap is considered maximum risk (score 1.0)
            base_score = min(util_gap / 50.0, 1.0)
            # Adjust by time elapsed (late year gaps are riskier than early year gaps)
            time_factor = current_month / 12.0
            risk_score = min(base_score * (0.5 + 0.5 * time_factor), 1.0)
            
        # Determine Tiers and Explanation
        explanation = ""
        if util_gap > 25 and current_month >= 6:
            risk_level = "High"
            explanation = f"High risk: Utilization ({utilization_percent:.1f}%) is lagging behind time elapsed ({time_elapsed_percent:.1f}%) significantly in the second half of the year."
        elif util_gap > 10:
             risk_level = "Medium"
             explanation = f"Medium risk: Utilization ({utilization_percent:.1f}%) is moderately lagging behind time elapsed ({time_elapsed_percent:.1f}%)."
        else:
            risk_level = "Low"
            explanation = f"Low risk: Utilization ({utilization_percent:.1f}%) is tracking well with time elapsed ({time_elapsed_percent:.1f}%)."
            
        return {
            "level": risk_level,
            "score": round(risk_score, 2),
            "gap": round(util_gap, 2),
            "explanation": explanation
        }

    @staticmethod
    def forecast_underutilization(total_allocation: float, total_spent: float, current_month: int, recent_spending: List[float]) -> Dict[str, Any]:
        if current_month == 12:
            return {
                "predicted_spend": total_spent,
                "predicted_utilization": (total_spent / total_allocation) * 100,
                "predicted_unspent": max(0, total_allocation - total_spent),
                "confidence": "High",
                "explanation": "Year is complete. Forecast equals actual spending."
            }
            
        months_remaining = 12 - current_month
        
        if current_month < 3 or not recent_spending:
            # Fallback for early year or missing data: use flat average
            avg_monthly_burn = total_spent / max(1, current_month)
            predicted_final_spend = total_spent + (avg_monthly_burn * months_remaining)
            confidence = "Low"
            explanation = "Low confidence forecast using flat average due to less than 3 months of data."
        else:
            # Weighted Recent Burn Rate
            recent_3_months_spend = sum(recent_spending[-3:])
            older_spend = total_spent - recent_3_months_spend
            
            recent_burn = recent_3_months_spend / min(3, current_month)
            older_burn = older_spend / max(1, current_month - 3) if current_month > 3 else 0
            
            # 70% weight to recent 3 months, 30% to older spending
            weighted_burn_rate = (recent_burn * 0.7) + (older_burn * 0.3)
            predicted_final_spend = total_spent + (weighted_burn_rate * months_remaining)
            confidence = "Medium" if current_month < 6 else "High"
            explanation = f"Forecast based on weighted burn rate, prioritizing recent 3 months spending."
            
        # Cap at allocation
        predicted_final_spend = min(predicted_final_spend, total_allocation)
        predicted_utilization = (predicted_final_spend / total_allocation) * 100
        predicted_unspent = total_allocation - predicted_final_spend
        
        return {
            "predicted_spend": round(predicted_final_spend, 2),
            "predicted_utilization": round(predicted_utilization, 2),
            "predicted_unspent": round(predicted_unspent, 2),
            "confidence": confidence,
            "explanation": explanation
        }

    @staticmethod
    def predict_next_period_trend(recent_spending: List[float]) -> Dict[str, Any]:
        if len(recent_spending) < 3:
            return {
                "trend": "STABLE",
                "explanation": "Insufficient data (need 3 months) to determine a robust trend."
            }
            
        month_n = recent_spending[-1]
        month_not1 = recent_spending[-2]
        month_not2 = recent_spending[-3]
        
        # Calculate % changes. Handle division by zero.
        change_1 = ((month_n - month_not1) / month_not1) * 100 if month_not1 > 0 else 0
        change_2 = ((month_not1 - month_not2) / month_not2) * 100 if month_not2 > 0 else 0
        
        avg_change = (change_1 + change_2) / 2
        
        if avg_change > 5.0:
            trend = "UP"
            explanation = f"Spending trend is significantly UP (avg {avg_change:.1f}% period-over-period growth in last 3 months)."
        elif avg_change < -5.0:
            trend = "DOWN"
            explanation = f"Spending trend is significantly DOWN (avg {avg_change:.1f}% period-over-period decline in last 3 months)."
        else:
            trend = "STABLE"
            explanation = f"Spending trend is STABLE (fluctuations within +/- 5% threshold)."
            
        return {
            "trend": trend,
            "avg_change": round(avg_change, 2),
            "explanation": explanation
        }

    @classmethod
    def analyze_scheme(cls, entity_id: str, entity_name: str, total_allocation: float, total_spent: float, current_month: int, recent_spending: List[float]) -> dict:
        """
        Main entry point to assemble the full prediction response for a scheme.
        """
        # Data validation and base calculations
        if total_allocation <= 0:
            return {"error": "Total allocation must be greater than 0"}
            
        utilization_percent = (total_spent / total_allocation) * 100
        
        # Run individual predictors
        risk_data = cls.calculate_lapse_risk(utilization_percent, current_month)
        forecast_data = cls.forecast_underutilization(total_allocation, total_spent, current_month, recent_spending)
        trend_data = cls.predict_next_period_trend(recent_spending)
        
        # Collect explanation factors
        explanation_factors = []
        if risk_data["explanation"]: explanation_factors.append(risk_data["explanation"])
        if forecast_data["explanation"]: explanation_factors.append(forecast_data["explanation"])
        if trend_data["explanation"]: explanation_factors.append(trend_data["explanation"])

        return {
            "entity_id": entity_id,
            "entity_name": entity_name,
            "current_status": {
                "allocation": total_allocation,
                "spent": total_spent,
                "utilization_percent": round(utilization_percent, 2),
                "current_month": current_month
            },
            "predictions": {
                "lapse_risk": risk_data["level"],
                "risk_score": risk_data["score"],
                "forecast": {
                    "predicted_spend": forecast_data["predicted_spend"],
                    "predicted_utilization": forecast_data["predicted_utilization"],
                    "predicted_unspent": forecast_data["predicted_unspent"],
                    "confidence": forecast_data["confidence"]
                },
                "next_period_trend": trend_data["trend"]
            },
            "explanation_factors": explanation_factors
        }
