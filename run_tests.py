import json
import asyncio
from pathlib import Path
from app.services.risk_manager import AegisWatcher

# Create a dummy database class for the test
class TestDatabase:
    def __init__(self):
        self.data = [] # This will grow dynamically as tests run!
        self.baselines = [{"item_category": "Infrastructure", "avg_annual_spend": 200000}]
        
    def get_baseline(self, category):
        return next((b for b in self.baselines if b["item_category"] == category), None)

async def run_integration_tests():
    watcher = AegisWatcher()
    db = TestDatabase()
    
    # Load the suite
    with open("test_suite.json", "r") as f:
        test_cases = json.load(f)
        
    print(f"\n🚀 STARTING AEGIS-FIN INTEGRATION TESTS: {len(test_cases)} Cases\n" + "="*60)
    
    for tx in test_cases:
        test_name = tx.pop('test_name') # Remove the name before feeding to AI
        
        # 1. Run the AI Audit
        result = await watcher.audit(db, tx)
        
        # 2. Append to history so the AI "remembers" it for the next loop
        db.data.append(tx) 
        
        # 3. Print beautiful terminal output
        status = result['status']
        score = result['risk_score']
        reason = result['anomaly_reason'] if result['anomaly_reason'] else "Clean transaction."
        
        # Color coding for terminal
        color = "\033[92m" if status == "SAFE" else "\033[93m" if status == "FLAGGED" else "\033[91m"
        reset = "\033[0m"
        
        print(f"[{test_name.ljust(25)}] -> {color}{status.ljust(8)} | Score: {score:.2f}{reset}")
        if status != "SAFE":
            print(f"   └─ Reason: {reason}")
            
    print("\n" + "="*60 + "\n✅ ALL TESTS COMPLETED.")

if __name__ == "__main__":
    asyncio.run(run_integration_tests())