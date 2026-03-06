import subprocess
import json
from config import ANOMALY_SCRIPT


def run_anomaly_detection():

    try:

        result = subprocess.run(
            ["python", ANOMALY_SCRIPT],
            capture_output=True,
            text=True
        )

        output = json.loads(result.stdout)

        return output.get("critical", 0)

    except Exception:
        return 0