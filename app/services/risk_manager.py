# import numpy as np
# import networkx as nx
# from datetime import timedelta
# from motor.motor_asyncio import AsyncIOMotorDatabase

# class AegisWatcher:
#     def __init__(self):
#         # Directed Graph to detect Circular Collusion
#         self.G = nx.DiGraph() 

#     async def audit(self, db: AsyncIOMotorDatabase, tx: dict):
#         risk_map = {} # Stores individual anomaly scores
#         logs = []     # Stores human-readable reasons

#         # --- 1. SALAMI SLICING (Structuring) ---
#         # Checks for multiple payments just under the 5L audit limit in 3 days
#         window = tx['timestamp'] - timedelta(days=3)
#         salami_hits = await db["transactions"].count_documents({
#             "vendor_id": tx['vendor_id'],
#             "amount": {"$gte": 480000, "$lt": 500000},
#             "timestamp": {"$gte": window}
#         })
#         if salami_hits >= 1:
#             risk_map['salami'] = 0.85
#             logs.append("Salami Slicing: Pattern of sub-limit structuring.")

#         # --- 2. GHOST VENDOR (Zero History + High Value) ---
#         history = await db["transactions"].count_documents({"vendor_id": tx['vendor_id']})
#         if history == 0 and tx['amount'] > 100000:
#             risk_map['ghost'] = 0.90
#             logs.append("Ghost Vendor: Large payment to an unknown entity.")

#         # --- 3. MARCH RUSH (Budget Dumping) ---
#         if tx['timestamp'].month == 3 and tx['timestamp'].day > 25:
#             risk_map['march'] = 0.70
#             logs.append("March Rush: Critical year-end spending spike.")

#         # --- 4. IMPOSSIBLE TRAVEL (Geolocation Velocity) ---
#         prev = await db["transactions"].find_one({"dept_name": tx['dept_name']}, sort=[("timestamp", -1)])
#         if prev:
#             dist = np.sqrt((tx['latitude']-prev['latitude'])**2 + (tx['longitude']-prev['longitude'])**2) * 111
#             hours = (tx['timestamp'] - prev['timestamp']).total_seconds() / 3600
#             if hours > 0 and (dist / hours) > 120:
#                 risk_map['travel'] = 0.80
#                 logs.append(f"Impossible Travel: Speed {int(dist/hours)}km/h exceeds logic.")

#         # --- 5. CIRCULAR TRADING (GNN/Graph Logic) ---
#         self.G.add_edge(tx['dept_name'], tx['vendor_id'])
#         try:
#             cycle = nx.find_cycle(self.G)
#             risk_map['circular'] = 1.0
#             logs.append(f"Circular Trading: Collusion loop {cycle}")
#         except: pass

#         # --- 6. PRICE PADDING (Market Benchmarking) ---
#         base = await db["baselines"].find_one({"item_category": tx['item_category']})
#         if base and tx['amount'] > (base['avg_annual_spend'] * 2.5):
#             risk_map['padding'] = 0.95
#             logs.append("Price Padding: 2.5x variance from market baseline.")

#         # --- 7. CORRELATION (Unicorn Score) ---
#         final_score = self._calculate_final(risk_map)

#         return {
#             "risk_score": final_score,
#             "anomaly_reason": " | ".join(logs),
#             "status": "CRITICAL" if final_score > 0.8 else "FLAGGED" if final_score > 0.4 else "SAFE",
#             "metadata": {"flags": list(risk_map.keys())}
#         }

#     def _calculate_final(self, risks):
#         if not risks: return 0.0
#         # Formula: Highest risk + (Bonus for multiple flags)
#         return min(max(risks.values()) + (len(risks)-1)*0.1, 1.0)

import numpy as np
import networkx as nx
from datetime import datetime, timedelta

class AegisWatcher:
    def __init__(self):
        # Directed Graph to detect Circular Collusion
        self.G = nx.DiGraph() 

    async def audit(self, db, tx: dict):
        risk_map = {} # Stores individual anomaly scores
        logs = []     # Stores human-readable reasons

        # --- PRE-PROCESSING ---
        # Ensure timestamp is a datetime object (FastAPI sometimes passes it as a string)
        if isinstance(tx['timestamp'], str):
            try:
                tx['timestamp'] = datetime.fromisoformat(tx['timestamp'].replace('Z', '+00:00'))
            except:
                tx['timestamp'] = datetime.utcnow()

        # --- 1. SALAMI SLICING (Structuring) ---
        # Search through the local JSON list (db.data)
        window_start = tx['timestamp'] - timedelta(days=3)
        salami_hits = [
            d for d in db.data 
            if d['vendor_id'] == tx['vendor_id'] and 
            480000 <= d['amount'] < 500000
        ]
        
        if len(salami_hits) >= 1:
            risk_map['salami'] = 0.85
            logs.append("Salami Slicing: Pattern of sub-limit structuring.")

        # --- 2. GHOST VENDOR (Zero History + High Value) ---
        # Check if vendor exists in our mock history
        history_exists = any(d['vendor_id'] == tx['vendor_id'] for d in db.data)
        if not history_exists and tx['amount'] > 100000:
            risk_map['ghost'] = 0.90
            logs.append("Ghost Vendor: Large payment to an unknown entity.")

        # --- 3. MARCH RUSH (Budget Dumping) ---
        if tx['timestamp'].month == 3 and tx['timestamp'].day > 25:
            risk_map['march'] = 0.70
            logs.append("March Rush: Critical year-end spending spike.")

        # --- 4. IMPOSSIBLE TRAVEL (Geolocation Velocity) ---
        # Get previous transactions for this dept from our JSON list
        dept_history = [d for d in db.data if d['dept_name'] == tx['dept_name']]
        if dept_history:
            prev = dept_history[-1]
            # Handle potential string timestamps in JSON
            prev_ts = prev['timestamp']
            if isinstance(prev_ts, str):
                prev_ts = datetime.fromisoformat(prev_ts.replace('Z', '+00:00'))
            
            dist = np.sqrt((tx['latitude']-prev['latitude'])**2 + (tx['longitude']-prev['longitude'])**2) * 111
            time_diff = (tx['timestamp'] - prev_ts).total_seconds() / 3600
            
            if time_diff > 0 and (dist / time_diff) > 120:
                risk_map['travel'] = 0.80
                logs.append(f"Impossible Travel: Speed {int(dist/time_diff)}km/h exceeds logic.")

        # --- 5. CIRCULAR TRADING (Graph Logic) ---
        self.G.add_edge(tx['dept_name'], tx['vendor_id'])
        try:
            cycle = nx.find_cycle(self.G)
            risk_map['circular'] = 1.0
            logs.append(f"Circular Trading: Collusion loop detected.")
        except: pass

        # --- 6. PRICE PADDING (Market Benchmarking) ---
        # Call the helper method we added to your JSONDatabase class
        baseline = db.get_baseline(tx['item_category'])
        if baseline and tx['amount'] > (baseline['avg_annual_spend'] * 2.5):
            risk_map['padding'] = 0.95
            logs.append("Price Padding: 2.5x variance from market baseline.")

        # --- 7. CORRELATION (Unicorn Score) ---
        final_score = self._calculate_final(risk_map)

        return {
            "risk_score": final_score,
            "anomaly_reason": " | ".join(logs),
            "status": "CRITICAL" if final_score > 0.8 else "FLAGGED" if final_score > 0.4 else "SAFE",
            "metadata": {"flags": list(risk_map.keys())}
        }

    def _calculate_final(self, risks):
        if not risks: return 0.0
        return min(max(risks.values()) + (len(risks)-1)*0.1, 1.0)