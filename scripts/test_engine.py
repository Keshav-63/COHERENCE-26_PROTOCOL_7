import requests
import json
import time

URL = "http://127.0.0.1:8000/api/audit"

with open("test_anomalies.json", "r") as f:
    test_cases = json.load(f)

for case in test_cases:
    print(f"--- Testing: {case['description']} ---")
    # Remove description before sending
    desc = case.pop('description')
    
    response = requests.post(URL, json=case)
    result = response.json()
    
    print(f"Result Status: {result['status']}")
    print(f"Risk Score: {result['risk_score']}")
    print(f"Anomalies Detected: {result['anomaly_reason']}")
    print("-" * 30)
    time.sleep(1) # Delay to allow DB processing