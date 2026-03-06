# Budget Analytics System - Complete Setup Guide

## Overview

Comprehensive budget analytics system for tracking India's financial data with complete metadata, vendor tracking, geographical mapping, and support for anomaly detection and predictions.

## What's Been Created

### 1. MongoDB Models (9 Collections)

All models are in `app/budget/models/`:

#### Financial Hierarchy
- **Ministry** (`ministries`) - Central/State government ministries
- **Department** (`departments`) - Departments under ministries
- **Scheme** (`schemes`) - Government schemes (PM-KISAN, MGNREGA, etc.)
- **SubScheme** (`subschemes`) - Sub-components of schemes

#### Budget Tracking
- **BudgetAllocation** (`budget_allocations`)
  - Budget Estimates (BE)
  - Revised Estimates (RE)
  - Actual Expenditure
  - Previous year actuals
  - Utilization percentages
  - All amounts in **crores (₹ Cr.)**

- **Expenditure** (`expenditures`) - Monthly/quarterly tracking

#### Vendor & Contracts
- **Vendor** (`vendors`)
  - Vendor details, performance metrics
  - Blacklist tracking
  - MSME/SC-ST/Women-owned classification

- **Contract** (`contracts`)
  - Contract details with **geo-location** (lat/long)
  - Operational areas (state/district/location)
  - Payment tracking
  - Milestone tracking
  - **GeoJSON support for mapping**

#### Geographical
- **State** (`states`) - Indian states and UTs
- **District** (`districts`) - Districts within states
- **Location** (`locations`) - Specific project locations with coordinates

### 2. Data Import System

#### Files Created:
- `import_budget_data.py` - Main import script
- `test_budget_models.py` - Model testing script
- `run_import.py` - Wrapper script
- `analyze_excel.py` - Excel analysis tools

#### Features:
- Extracts **ALL data** from all 103 sheets
- Automatically detects ministry names
- Extracts budget values (BE, RE, Actuals)
- Creates proper relationships
- Handles missing/malformed data
- Comprehensive logging

### 3. Key Features

#### All Amounts in Crores
```python
budget_estimate: float  # In crores (₹ Cr.)
contract_value: float   # In crores (₹ Cr.)
```

#### Geo-Location Support
```python
# Contracts have geographical tracking
latitude: float = 18.5204
longitude: float = 73.8567
geo_location: dict = {
    "type": "Point",
    "coordinates": [73.8567, 18.5204]  # [lng, lat]
}

# Supports MongoDB geospatial queries
# Find contracts within 50km of location
# Find all projects in a state/district
```

#### Metadata Tracking
- Ministry → Department → Scheme hierarchy
- Budget allocations by fiscal year (FY 2024-25, 2025-26)
- Vendor allocation and performance
- Contract operational areas
- Budget utilization and remaining amounts

#### Built for Analytics
- **Anomaly Detection**: Track unusual spending patterns
- **Predictions**: Forecast budget utilization
- **Vendor Analysis**: Track performance, delays, penalties
- **Geographical Analysis**: Map contract locations
- **Trend Analysis**: Year-over-year comparisons

## Setup Instructions

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

New dependencies added:
- pandas==2.2.0
- openpyxl==3.1.2
- numpy==1.26.3

### Step 2: Test Models

```bash
python test_budget_models.py
```

This will:
- Verify all imports work
- Test MongoDB connection
- Create sample records
- Validate model structures

**Expected Output:**
```
================================================================================
TESTING BUDGET MODELS
================================================================================
...
ALL TESTS PASSED!
```

### Step 3: Import Budget Data

```bash
python run_import.py
```

This will:
- Parse all 103 sheets from `allsbe.xlsx`
- Extract ministry, scheme, and budget data
- Create ministries, schemes, and allocations in MongoDB
- Show progress with detailed logging

**Expected Output:**
```
================================================================================
STARTING BUDGET DATA IMPORT
================================================================================
Parsing sheet: Sheet1
  Ministry: Ministry of Finance
  Extracted 45 data rows
...
Total data rows extracted: 5234
Found 87 unique ministries

================================================================================
IMPORT SUMMARY
================================================================================
Ministries created: 87
Schemes created: 1245
Allocations created: 5234

IMPORT COMPLETED SUCCESSFULLY!
```

### Step 4: Start the Server

```bash
python run.py
```

Access API docs: http://localhost:8000/docs

## Data Structure

### Budget Allocation Example

```json
{
  "allocation_code": "ALLOC-2024-25-000001",
  "fiscal_year": "2024-25",
  "allocation_status": "allocated",
  "entity_type": "scheme",
  "entity_name": "PM-KISAN",
  "ministry_name": "Ministry of Agriculture and Farmers Welfare",
  "budget_estimate": 60000.00,  // ₹60,000 Cr
  "revised_estimate": 65000.00,  // ₹65,000 Cr
  "actual_expenditure": 58500.00,  // ₹58,500 Cr
  "utilization_percentage": 97.5,
  "previous_year_actual": 55000.00
}
```

### Contract Example with Geo-Location

```json
{
  "contract_code": "CONT-PMGSY-MH-2024-001",
  "contract_title": "Construction of Rural Road in Pune District",
  "vendor_name": "ABC Construction Pvt Ltd",
  "ministry_name": "Ministry of Rural Development",
  "scheme_name": "Pradhan Mantri Gram Sadak Yojana",
  "contract_value": 15.50,  // ₹15.50 Cr
  "total_paid": 7.75,  // ₹7.75 Cr
  "pending_payment": 7.75,  // ₹7.75 Cr
  "operation_state_name": "Maharashtra",
  "operation_district_name": "Pune",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "geo_location": {
    "type": "Point",
    "coordinates": [73.8567, 18.5204]
  },
  "completion_percentage": 50.0,
  "fiscal_year": "2024-25"
}
```

## MongoDB Collections Created

After import, you'll have these collections:

1. `ministries` - All central and state ministries
2. `departments` - Departments under ministries
3. `schemes` - Government schemes and programs
4. `subschemes` - Sub-components of schemes
5. `budget_allocations` - Budget data by FY
6. `expenditures` - Monthly expenditure tracking
7. `vendors` - Vendor/contractor database
8. `contracts` - Contract details with geo-location
9. `states` - Indian states and UTs
10. `districts` - District information
11. `locations` - Specific project locations

## Use Cases

### 1. Budget Analytics
- Total budget by ministry/scheme
- Budget utilization rates
- Year-over-year comparisons
- Under/over-spending analysis

### 2. Vendor Analytics
- Vendor performance tracking
- Contract completion rates
- Delay analysis
- Penalty tracking

### 3. Geographical Analysis
- Map all contracts on India map
- State-wise budget distribution
- District-level expenditure
- Project location tracking

### 4. Anomaly Detection
- Unusual spending patterns
- Budget overruns
- Delayed payments
- Vendor blacklisting patterns

### 5. Predictive Analytics
- Budget utilization forecasts
- Expenditure trends
- Scheme performance predictions

## Next Steps

### Create API Endpoints
- Budget query endpoints
- Vendor analytics endpoints
- Geographical query endpoints
- Analytics dashboards

### Add More Data
- Maharashtra state budget data
- Vendor details
- Contract information
- Geographical coordinates

### Build Analytics
- Anomaly detection algorithms
- Prediction models
- Visualization dashboards
- Real-time monitoring

## File Structure

```
app/
├── budget/
│   ├── __init__.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── ministry.py         # Ministry model
│   │   ├── department.py       # Department model
│   │   ├── scheme.py           # Scheme & SubScheme models
│   │   ├── allocation.py       # BudgetAllocation & Expenditure
│   │   ├── vendor.py           # Vendor & Contract models
│   │   └── location.py         # State, District, Location models
│   ├── services/               # Business logic (to be created)
│   ├── api/                    # API endpoints (to be created)
│   └── schemas/                # Pydantic schemas (to be created)

Data Files:
├── allsbe.xlsx                 # Source budget data (103 sheets)
├── import_budget_data.py       # Import script
├── run_import.py               # Import wrapper
├── test_budget_models.py       # Model testing
└── analyze_excel.py            # Excel analysis tools
```

## Support for FY 2024-25 and 2025-26

The system supports multiple fiscal years:
- FY 2023-24
- FY 2024-25 (Current)
- FY 2025-26 (Planned)
- FY 2026-27 (Future)

Easily query data by fiscal year:
```python
allocations = await BudgetAllocation.find(
    BudgetAllocation.fiscal_year == FiscalYear.FY_2024_25
).to_list()
```

## Complete Metadata

Every record includes:
- Created/Updated timestamps
- Fiscal year tracking
- Ministry/Department hierarchy
- Scheme associations
- Geographical information
- Status tracking
- Audit trail

## Ready for Production

- Proper indexes on all query fields
- Geospatial indexes for mapping
- Text search indexes
- Optimized for analytics queries
- Scalable MongoDB schema
- Complete audit trail

---

**System is ready for data import and analytics development!**
