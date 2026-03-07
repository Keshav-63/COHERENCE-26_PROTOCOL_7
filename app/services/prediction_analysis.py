import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
import joblib
import os
import json
from motor.motor_asyncio import AsyncIOMotorDatabase

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(MODEL_DIR, exist_ok=True)

CLASS_MODEL_PATH = os.path.join(MODEL_DIR, "lapse_classifier.joblib")
REG_MODEL_PATH = os.path.join(MODEL_DIR, "spend_regressor.joblib")

FEATURES = [
    'allocated_budget', 
    'historical_utilization_pct', 
    'project_delays',
    'utilization_rate',
    'Q1_pct', 'Q2_pct', 'Q3_pct', 'Q4_pct'
]

async def fetch_training_data(db: AsyncIOMotorDatabase):
    """Fetches data from the DB for training."""
    # We use the admin mock data for the ML model
    alloc_cursor = db.budget_allocations.find({"is_admin_mock": True, "entity_type": "ministry"})
    ministries_raw = await alloc_cursor.to_list(length=100)
    
    # Needs matching transactions
    tx_cursor = db.budget_transactions.find({"is_admin_mock": True})
    transactions_raw = await tx_cursor.to_list(length=1000)
    
    # If we don't have enough data in the DB to train, use synthetic generation 
    # based on the original script's logic for the prototype
    
    print("Fetching training data...")
    # Because the DB might just have small sample data, we'll build a synthetic dataframe 
    # to train a robust model as per the original shah-predection logic.
    np.random.seed(42)
    
    num_samples = 200
    allocations = np.random.uniform(50000000, 500000000, num_samples)
    hist_util = np.random.uniform(0.4, 0.95, num_samples)
    delays = np.random.randint(0, 10, num_samples)
    
    # Simulate current utilization
    base_util = hist_util * allocations
    # Add noise
    utilizations = base_util * np.random.uniform(0.8, 1.2, num_samples)
    utilizations = np.minimum(utilizations, allocations)
    
    util_rate = utilizations / allocations
    
    # Simulate quarters
    q1 = utilizations * 0.15 * np.random.uniform(0.8, 1.2, num_samples)
    q2 = utilizations * 0.25 * np.random.uniform(0.8, 1.2, num_samples)
    q3 = utilizations * 0.30 * np.random.uniform(0.8, 1.2, num_samples)
    q4 = utilizations - (q1 + q2 + q3)
    
    df = pd.DataFrame({
        'dept_id': [f"DPT-{i:03d}" for i in range(num_samples)],
        'dept_name': [f"Dept {i}" for i in range(num_samples)],
        'allocated_budget': allocations,
        'utilized_budget': utilizations,
        'historical_utilization_pct': hist_util,
        'project_delays': delays,
        'utilization_rate': util_rate,
        'Q1_pct': q1 / allocations,
        'Q2_pct': q2 / allocations,
        'Q3_pct': q3 / allocations,
        'Q4_pct': q4 / allocations
    })
    
    median_util = df['utilization_rate'].median()
    df['actual_lapse'] = (df['utilization_rate'] < median_util).astype(int)
    
    return df

async def train_and_save_models(db: AsyncIOMotorDatabase):
    """Trains the models and saves them to disk using joblib."""
    print("Training Predictive Models...")
    df = await fetch_training_data(db)
    
    X = df[FEATURES]
    y_class = df['actual_lapse']
    y_reg = df['utilized_budget']
    
    # Model 1: Classifier for Lapse Probability
    clf = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    clf.fit(X, y_class)
    joblib.dump(clf, CLASS_MODEL_PATH)
    
    # Model 2: Regressor for Final Spend
    reg = RandomForestRegressor(n_estimators=100, max_depth=5, random_state=42)
    reg.fit(X, y_reg)
    joblib.dump(reg, REG_MODEL_PATH)
    
    print(f"Models saved to {MODEL_DIR}")
    return True

def get_models():
    """Loads models from disk."""
    if not os.path.exists(CLASS_MODEL_PATH) or not os.path.exists(REG_MODEL_PATH):
        return None, None
    clf = joblib.load(CLASS_MODEL_PATH)
    reg = joblib.load(REG_MODEL_PATH)
    return clf, reg

def calculate_next_budget(base_need, lapse_prob, hist_util):
    """Smart Zero-Based Budgeting Reallocation Logic"""
    if lapse_prob < 0.3 and hist_util > 0.8:
        return base_need * 1.10  # +10% for efficient
    elif lapse_prob > 0.7:
        return base_need * 1.02  # +2% for risky
    else:
        return base_need * 1.05  # +5% standard

async def run_inference(db: AsyncIOMotorDatabase):
    """Loads models, fetches current data, and runs prediction."""
    clf, reg = get_models()
    if not clf or not reg:
        # If models missing, train them now
        await train_and_save_models(db)
        clf, reg = get_models()
        
    # We will use the actual live data for inference
    alloc_cursor = db.budget_allocations.find({"is_admin_mock": True, "entity_type": "ministry"})
    ministries_raw = await alloc_cursor.to_list(length=100)
    
    results = []
    
    for m in ministries_raw:
        alloc_id = str(m["_id"])
        
        # Calculate real utilization
        exp_cursor = db.expenditures.find({"allocation_id": alloc_id}).sort("month", -1)
        exps = await exp_cursor.to_list(12)
        spent = exps[0]["cumulative_expenditure"] if exps else 0
        allocated = m.get("budget_estimate", 100000000)
        
        util_rate = spent / allocated if allocated > 0 else 0
        hist_util = 0.85 # Assume high historical util for mock
        delays = 2
        
        # Quarter metrics
        q_spent = [0, 0, 0, 0]
        # Distribute spent roughly 
        q_spent[0] = spent * 0.15
        q_spent[1] = spent * 0.25
        q_spent[2] = spent * 0.30
        q_spent[3] = spent - sum(q_spent[:3])
        
        features = pd.DataFrame([{
            'allocated_budget': allocated,
            'historical_utilization_pct': hist_util,
            'project_delays': delays,
            'utilization_rate': util_rate,
            'Q1_pct': q_spent[0] / allocated,
            'Q2_pct': q_spent[1] / allocated,
            'Q3_pct': q_spent[2] / allocated,
            'Q4_pct': q_spent[3] / allocated
        }])
        
        prob = clf.predict_proba(features)[0][1]
        pred_spend = reg.predict(features)[0]
        lapse_amount = max(0, allocated - pred_spend)
        
        next_budget = calculate_next_budget(pred_spend, prob, hist_util)
        
        results.append({
            "department": m["entity_name"],
            "allocated_budget": allocated,
            "current_spent": spent,
            "predicted_spend": float(pred_spend),
            "estimated_lapse": float(lapse_amount),
            "lapse_probability": float(prob),
            "recommended_next_budget": float(next_budget),
            "increase_pct": float(((next_budget / pred_spend) - 1) * 100) if pred_spend > 0 else 0
        })
        
    # Sort by risk
    results.sort(key=lambda x: x["lapse_probability"], reverse=True)
    return results
