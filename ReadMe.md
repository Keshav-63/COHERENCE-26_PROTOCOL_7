# AI Budget Reallocation Service

An AI-assisted system that automatically reallocates unused budgets between government departments after verifying financial integrity using anomaly detection.

This service integrates with an existing anomaly detection system and uses historical financial data to intelligently determine the most suitable departments to contribute funds.

---

# Problem Statement

Government departments often face situations where:

- Some departments exhaust their allocated budget early
- Other departments have large unused funds
- Manual reallocation is slow and inefficient
- Financial anomalies may indicate fraud or misuse

This system solves the problem by:

1. Running anomaly detection first
2. Blocking reallocation if critical anomalies exist
3. Scanning all departments and available budgets
4. Determining the best way to redistribute funds
5. Recording all reallocations in a transaction ledger

---

# Project Structure

```
reallocation-service/
│
├── api/
│   └── app.py                 # FastAPI API endpoints
│
├── src/
│   ├── db.py                  # MongoDB connection and queries
│   ├── allocation_engine.py   # Core reallocation logic
│   ├── learning_model.py      # Model that learns allocation patterns
│   ├── anomaly_client.py      # Calls anomaly detection service
│   ├── transaction_logger.py  # Stores reallocation transactions
│   └── utils.py               # Helper utilities
│
├── models/
│   └── allocation_model.pkl   # Saved trained model
│
├── config.py                  # Configuration variables
├── run.py                     # Entry point for the API
├── requirements.txt           # Python dependencies
└── README.md
```

---

# Database Schema

The system uses **MongoDB**.

## Departments Collection

Example document:

```json
{
  "dept_id": "DPT-01",
  "dept_name": "Mumbai Health Dept",
  "district": "Mumbai",
  "allocated_budget": 58691803.37,
  "utilized_budget": 23476721.35,
  "required_budget": 64560983.71
}
```

---

## Transactions Collection

Example document:

```json
{
  "trans_id": "TX-001",
  "dept_id": "DPT-01",
  "dept_name": "Mumbai Health Dept",
  "vendor_id": "VND-03",
  "vendor_name": "Phantom Medical Corp",
  "item_name": "N95 Masks (box of 50)",
  "quantity": 41,
  "amount": 67291.15,
  "latitude": 19.07,
  "longitude": 72.87,
  "timestamp": "2026-02-04T10:00:00Z"
}
```

Reallocation transactions are also stored in this collection for transparency and auditing.

---

# System Workflow

1. A department requests additional funds.

2. The system runs anomaly detection.

3. If critical anomalies ≥ 2

   Reallocation is blocked.

4. If anomalies are within safe limits

   The system:

   - scans all departments
   - finds departments with remaining budget
   - determines optimal fund contribution
   - reallocates funds from one or multiple departments

5. A transaction entry is recorded in the database.

---

# Example Allocation Scenario

If **Department A needs ₹10,000,000**

The system may allocate funds like this:

```
Department B → ₹4,000,000
Department C → ₹3,000,000
Department D → ₹3,000,000
```

This prevents disruption to any single department.

---

# Installation

Clone the repository

```bash
git clone https://github.com/your-repo/reallocation-service.git
cd reallocation-service
```

Install dependencies

```bash
pip install -r requirements.txt
```

---

# Configuration

Update the MongoDB settings in `config.py`

```python
MONGO_URI = "mongodb://localhost:27017"
DATABASE_NAME = "budget_db"
DEPARTMENTS_COLLECTION = "departments"
TRANSACTIONS_COLLECTION = "transactions"
```

---

# Running the Service

Start the API server

```bash
python run.py
```

Server will run at:

```
http://localhost:8000
```

API documentation (Swagger UI):

```
http://localhost:8000/docs
```

---

# API Endpoint

## POST /reallocate

Requests budget reallocation.

### Example Request

```json
{
  "dept_id": "DPT-01",
  "required_amount": 10000000
}
```

### Example Response

```json
{
  "status": "success",
  "message": "Budget reallocated successfully",
  "contributors": [
    {
      "dept_id": "DPT-02",
      "amount": 4000000
    },
    {
      "dept_id": "DPT-03",
      "amount": 3000000
    },
    {
      "dept_id": "DPT-04",
      "amount": 3000000
    }
  ]
}
```

---

# Safety Mechanisms

- Anomaly detection gate before allocation
- Prevents allocation during suspicious activity
- Full transaction audit trail
- Multi-department fund sharing
- Budget balance validation

---

# Tech Stack

Backend
- Python
- FastAPI
- MongoDB
- Uvicorn

Data Processing
- Historical transaction analysis
- Allocation pattern learning

Tools
- Postman
- Swagger API Docs

---

# Future Improvements

- Reinforcement learning for allocation optimization
- Administrative dashboard
- Fraud heatmap visualization
- Automated audit reporting
- Regional budget balancing

---

# Author

Saumya Shah  
Computer Engineering  
Vidyavardhini’s College of Engineering & Technology