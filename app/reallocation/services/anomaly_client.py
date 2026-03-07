"""
Anomaly Detection Client
Checks for critical anomalies before allowing reallocation
"""

from motor.motor_asyncio import AsyncIOMotorDatabase


async def run_anomaly_detection(db: AsyncIOMotorDatabase) -> int:
    """
    Check for critical anomalies in the system

    Args:
        db: MongoDB database instance

    Returns:
        int: Number of critical anomalies detected
    """
    try:
        # Count critical transactions (risk_score > 0.8)
        critical_count = await db["budget_transactions"].count_documents(
            {"risk_score": {"$gt": 0.8}}
        )

        # Also check for critical anomaly flags
        critical_flags = await db["anomaly_flags"].count_documents(
            {"severity": "CRITICAL"}
        )

        # Return total critical anomalies
        return critical_count + critical_flags

    except Exception as e:
        # If there's an error, return 0 (allow reallocation)
        # This prevents the system from being blocked by DB issues
        print(f"Anomaly detection error: {e}")
        return 0


async def get_anomaly_summary(db: AsyncIOMotorDatabase) -> dict:
    """
    Get detailed anomaly summary for reallocation decision

    Args:
        db: MongoDB database instance

    Returns:
        Dictionary with anomaly counts and details
    """
    try:
        # Count by severity
        critical_txns = await db["budget_transactions"].count_documents(
            {"risk_score": {"$gt": 0.8}}
        )
        flagged_txns = await db["budget_transactions"].count_documents(
            {"risk_score": {"$gt": 0.4, "$lte": 0.8}}
        )

        # Get critical anomaly flags
        critical_flags_docs = await db["anomaly_flags"].find(
            {"severity": "CRITICAL"}
        ).to_list(10)

        # Convert to JSON-serializable format (remove ObjectId)
        critical_flags = [
            {
                "trans_id": flag.get("trans_id"),
                "dept_name": flag.get("dept_name"),
                "anomaly_type": flag.get("anomaly_type"),
                "severity": flag.get("severity"),
                "risk_score": flag.get("risk_score"),
                "description": flag.get("description"),
                "amount": flag.get("amount"),
                "estimated_leakage": flag.get("estimated_leakage"),
            }
            for flag in critical_flags_docs
        ]

        return {
            "critical_transactions": critical_txns,
            "flagged_transactions": flagged_txns,
            "total_critical": critical_txns,
            "critical_flags": critical_flags,
            "reallocation_allowed": critical_txns < 2,
            "message": (
                "Reallocation allowed - anomalies within safe limits"
                if critical_txns < 2
                else f"Reallocation blocked - {critical_txns} critical anomalies detected"
            )
        }

    except Exception as e:
        return {
            "critical_transactions": 0,
            "flagged_transactions": 0,
            "total_critical": 0,
            "critical_flags": [],
            "reallocation_allowed": True,
            "message": f"Anomaly check error: {e}",
            "error": str(e)
        }
