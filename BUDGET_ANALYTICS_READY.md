# Budget Analytics System - READY TO USE

## What We've Built

### Complete Budget Data System with:

✅ **9 MongoDB Collections** for comprehensive budget tracking
✅ **All amounts in crores** (₹ Cr.) as requested
✅ **Geo-location support** (latitude/longitude for contracts)
✅ **Complete metadata** tracking
✅ **Ready for anomaly detection & predictions**
✅ **Vendor and contract tracking**
✅ **Multi-fiscal year support** (FY 2024-25, 2025-26)

---

## Quick Start

### 1. Test the Models (REQUIRED FIRST)

```bash
python test_budget_models.py
```

**Expected Output:**
```
================================================================================
ALL TESTS PASSED!
================================================================================
Budget models are working correctly.
You can now run: python run_import.py
```

### 2. Import Budget Data from Excel

```bash
python run_import.py
```

This will:
- Parse all 103 sheets from `allsbe.xlsx`
- Extract ministry, department, scheme, and budget data
- Load everything into MongoDB with proper relationships
- Show detailed progress logging

**Expected Duration:** 5-15 minutes depending on data size

### 3. Verify Import Success

Check MongoDB collections:
- `ministries` - All central/state ministries
- `schemes` - Government schemes and programs
- `budget_allocations` - Budget data by fiscal year

---

## Data Models Created

### 1. Ministry (`ministries`)
```python
{
    "ministry_code": "MIN-0001",
    "ministry_name": "Ministry of Finance",
    "government_level": "central",  # or "state"
    "is_active": true
}
```

### 2. Department (`departments`)
```python
{
    "department_code": "DEA-MF-001",
    "department_name": "Department of Economic Affairs",
    "ministry_code": "MIN-0001",
    "ministry_name": "Ministry of Finance"
}
```

### 3. Scheme (`schemes`)
```python
{
    "scheme_code": "SCH-00001",
    "scheme_name": "PM-KISAN",
    "scheme_type": "central_sector",
    "scheme_status": "active",
    "ministry_code": "MIN-0001",
    "total_outlay": 75000.00  // Rs. 75,000 Cr
}
```

### 4. Budget Allocation (`budget_allocations`)
**All amounts in CRORES (₹ Cr.)**

```python
{
    "allocation_code": "ALLOC-2024-25-000001",
    "fiscal_year": "2024-25",
    "allocation_status": "allocated",
    "entity_type": "scheme",
    "ministry_name": "Ministry of Agriculture",
    "scheme_name": "PM-KISAN",

    // Financial Data (all in crores)
    "budget_estimate": 60000.00,      // BE: Rs. 60,000 Cr
    "revised_estimate": 65000.00,     // RE: Rs. 65,000 Cr
    "actual_expenditure": 58500.00,   // Actual: Rs. 58,500 Cr
    "previous_year_actual": 55000.00, // Last year: Rs. 55,000 Cr

    // Analytics
    "utilization_percentage": 97.5,   // 97.5% utilized
    "savings": 1500.00,              // Rs. 1,500 Cr saved
}
```

### 5. Vendor (`vendors`)
```python
{
    "vendor_code": "VEND-MH-12345",
    "vendor_name": "ABC Construction Pvt Ltd",
    "vendor_type": "private_company",
    "vendor_status": "active",
    "state_code": "MH",
    "state_name": "Maharashtra",
    "total_contracts_awarded": 15,
    "total_contract_value": 250.50,  // Rs. 250.50 Cr
    "is_msme": true,
    "performance_rating": 4.5
}
```

### 6. Contract (`contracts`)
**With GEO-LOCATION for mapping**

```python
{
    "contract_code": "CONT-PMGSY-MH-2024-001",
    "contract_title": "Rural Road Construction - Pune",
    "vendor_name": "ABC Construction",
    "ministry_name": "Ministry of Rural Development",
    "scheme_name": "PMGSY",

    // Financial (in crores)
    "contract_value": 15.50,    // Rs. 15.50 Cr
    "total_paid": 7.75,         // Rs. 7.75 Cr paid
    "pending_payment": 7.75,    // Rs. 7.75 Cr pending

    // Geographical Location
    "operation_state_name": "Maharashtra",
    "operation_district_name": "Pune",
    "latitude": 18.5204,
    "longitude": 73.8567,
    "geo_location": {
        "type": "Point",
        "coordinates": [73.8567, 18.5204]  // [lng, lat]
    },

    // Progress
    "completion_percentage": 50.0,
    "fiscal_year": "2024-25"
}
```

### 7. State (`states`)
```python
{
    "state_code": "MH",
    "state_name": "Maharashtra",
    "capital_city": "Mumbai",
    "total_districts": 36,
    "population": 112374333
}
```

### 8. District (`districts`)
```python
{
    "district_code": "MH-PUN",
    "district_name": "Pune",
    "state_code": "MH",
    "population": 9429408
}
```

### 9. Location (`locations`)
**Specific project/contract locations**

```python
{
    "location_code": "LOC-MH-PUN-001",
    "location_name": "Hadapsar",
    "location_type": "town",
    "state_code": "MH",
    "district_code": "MH-PUN",
    "latitude": 18.5089,
    "longitude": 73.9260,
    "geo_location": {
        "type": "Point",
        "coordinates": [73.9260, 18.5089]
    }
}
```

---

## Use Cases Enabled

### 1. Budget Analytics
- Track total budget by ministry/scheme
- Calculate utilization rates
- Compare year-over-year trends
- Identify under-spending/over-spending

### 2. Vendor Analytics
- Vendor performance tracking
- Contract completion rates
- Payment analysis
- Blacklist management

### 3. Geographical Analysis
- Map all contracts on India map
- State-wise budget distribution
- District-level expenditure tracking
- Project location visualization

### 4. Anomaly Detection
- Unusual spending patterns
- Budget overruns
- Delayed payments
- Contract delays and penalties

### 5. Predictions & Forecasting
- Budget utilization forecasts
- Expenditure trend analysis
- Scheme performance predictions
- Vendor performance predictions

---

## MongoDB Queries Examples

### Get all schemes under a ministry:
```python
from app.budget.models import Scheme

schemes = await Scheme.find(
    Scheme.ministry_code == "MIN-0001"
).to_list()
```

### Get budget allocations for FY 2024-25:
```python
from app.budget.models import BudgetAllocation

allocations = await BudgetAllocation.find(
    BudgetAllocation.fiscal_year == "2024-25"
).to_list()
```

### Find contracts in Maharashtra:
```python
from app.budget.models import Contract

contracts = await Contract.find(
    Contract.operation_state_code == "MH"
).to_list()
```

### Geo-spatial query (contracts within 50km):
```python
# Find all contracts within 50km of a location
contracts = await Contract.find({
    "geo_location": {
        "$near": {
            "$geometry": {
                "type": "Point",
                "coordinates": [73.8567, 18.5204]
            },
            "$maxDistance": 50000  # 50km in meters
        }
    }
}).to_list()
```

### Calculate total budget for a ministry:
```python
from app.budget.models import BudgetAllocation

pipeline = [
    {"$match": {"ministry_code": "MIN-0001", "fiscal_year": "2024-25"}},
    {"$group": {
        "_id": "$ministry_code",
        "total_budget": {"$sum": "$budget_estimate"},
        "total_actual": {"$sum": "$actual_expenditure"}
    }}
]

result = await BudgetAllocation.aggregate(pipeline).to_list()
```

---

## File Structure

```
app/
├── budget/
│   ├── models/
│   │   ├── ministry.py         # Ministry model
│   │   ├── department.py       # Department model
│   │   ├── scheme.py           # Scheme & SubScheme
│   │   ├── allocation.py       # BudgetAllocation & Expenditure
│   │   ├── vendor.py           # Vendor & Contract
│   │   └── location.py         # State, District, Location
│   ├── services/               # (To be created)
│   ├── api/                    # (To be created)
│   └── schemas/                # (To be created)

Scripts:
├── allsbe.xlsx                 # Source data (103 sheets)
├── import_budget_data.py       # Import script
├── run_import.py               # Import wrapper
├── test_budget_models.py       # Model testing
└── analyze_excel.py            # Excel analysis

Documentation:
├── BUDGET_SYSTEM_SETUP.md      # Detailed setup guide
└── BUDGET_ANALYTICS_READY.md   # This file
```

---

## Next Steps

### 1. Import the Data
```bash
python run_import.py
```

### 2. Create API Endpoints
- GET /api/v1/budget/ministries
- GET /api/v1/budget/schemes
- GET /api/v1/budget/allocations
- GET /api/v1/budget/vendors
- GET /api/v1/budget/contracts
- POST /api/v1/budget/analytics/trends
- POST /api/v1/budget/analytics/anomalies

### 3. Add Maharashtra State Data
- Import state-specific budget data
- Add state departments and schemes
- Track state-level expenditures

### 4. Build Analytics
- Anomaly detection algorithms
- Prediction models (ML)
- Trend analysis
- Visualization dashboards

### 5. Add More Features
- Real-time expenditure tracking
- Alert system for anomalies
- Vendor performance scoring
- Contract milestone tracking

---

## Key Features

✅ **All Financial Data in Crores** - Ready for Indian budget analysis
✅ **Geo-Location Support** - Map contracts and projects
✅ **Complete Metadata** - Track everything from ministry to location
✅ **Fiscal Year Support** - FY 2024-25, 2025-26, and beyond
✅ **Vendor Tracking** - Performance, payments, blacklists
✅ **Contract Management** - Progress, delays, penalties
✅ **Multi-Level Hierarchy** - Ministry → Department → Scheme
✅ **Ready for ML** - Structured data for predictions
✅ **Scalable MongoDB** - Optimized indexes for fast queries
✅ **Production Ready** - Complete audit trail and timestamps

---

## Support

For questions or issues:
1. Check [BUDGET_SYSTEM_SETUP.md](BUDGET_SYSTEM_SETUP.md) for detailed setup
2. Review model definitions in `app/budget/models/`
3. Check import logs for any errors

---

**System is READY for budget data import and analytics development!**

Run `python test_budget_models.py` to verify, then `python run_import.py` to start!
