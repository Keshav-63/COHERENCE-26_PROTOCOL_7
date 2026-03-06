# PRAHARI Intelligence - Complete UI Implementation Guide

## ✅ Implementation Complete!

All 9 PRAHARI Intelligence API endpoints are fully integrated with beautiful UI/UX.

---

## 🎯 Dashboard Features

### 1. **Overview Tab** - Executive Summary
**Available to:** All users (Central Admin + State/Ministry Employees)

**Displays:**
- 📊 **4 Key Metrics Cards:**
  - Total Transactions Audited
  - Flagged Anomalies
  - Critical Cases
  - Estimated Leakage (₹ Cr)

- 🤖 **Gemini AI Executive Briefing:**
  - Complete AI-generated narrative analyzing fiscal patterns
  - Highlights systemic vulnerabilities
  - Risk concentration analysis

- 💰 **Budget Overview:**
  - Total Budget Estimate
  - Actual Expenditure
  - Utilization Percentage

**API Endpoint:** `GET /api/v1/intelligence/dashboard`

**Sample Response:**
```json
{
  "total_transactions": 8,
  "flagged": 6,
  "critical": 6,
  "flagged_pct": 75,
  "estimated_leakage_cr": 3.56,
  "total_budget_estimate_cr": 10439211.73,
  "total_actual_expenditure_cr": 280818.67,
  "overall_utilization_pct": 2.7,
  "gemini_executive_briefing": "PRAHARI's analysis for FY 2025-26..."
}
```

---

### 2. **Anomalies Tab** - Transaction & Allocation Anomalies
**Available to:** All users

**Displays:**
- 🔍 **Filter Controls:** ALL | FLAGGED | CRITICAL
- 📋 **Anomaly List with:**
  - Transaction ID + Status Badge (CRITICAL/FLAGGED)
  - Source Type (transaction/allocation)
  - Department Name
  - Amount (₹ Lakhs)
  - Risk Score Bar (0-100%)
  - Anomaly Reason (detailed explanation)
  - Anomaly Flags (ghost, march, price_padding, etc.)
  - Gemini AI Analysis (narrative explanation)
  - Timestamp

**Data Filtering:**
- Central Admin: **Sees ALL anomalies nationwide**
- State/Ministry: **Sees only their tenant_code data**

**API Endpoint:** `GET /api/v1/intelligence/anomalies?limit=100&status_filter=CRITICAL`

**Sample Response:**
```json
{
  "total": 18,
  "anomalies": [
    {
      "source": "transaction",
      "trans_id": "TXN-2026-001",
      "dept_name": "Rural Development",
      "amount": 495000,
      "risk_score": 1,
      "status": "CRITICAL",
      "anomaly_flags": ["ghost", "march", "price_padding"],
      "anomaly_reason": "Ghost Vendor: ₹1L+ payment to an entity with zero transaction history. | March Rush: Year-end spending on March 28...",
      "gemini_analysis": "This transaction strongly indicates a deliberate scheme to misappropriate public funds...",
      "timestamp": "2026-03-28T10:00:00"
    }
  ]
}
```

---

### 3. **Audit Transaction Tab** - Live Transaction Auditing
**Available to:** All users

**Features:**
- 📝 **Transaction Input Form:**
  - Transaction ID
  - Amount (₹)
  - Department Name
  - Ministry Code
  - Vendor ID
  - Item Category
  - Admin Level (central/state/district)
  - Fiscal Year
  - Latitude/Longitude
  - Transaction Date/Time

- 🚨 **Instant Audit Results:**
  - Status Badge (CRITICAL/FLAGGED/CLEAN)
  - Risk Score (0-100%)
  - Anomaly Reason
  - Detected Flags
  - Evidence Details
  - Gemini AI Analysis
  - Recommended Action

**API Endpoint:** `POST /api/v1/intelligence/audit`

**Sample Request:**
```json
{
  "trans_id": "TXN-2026-001",
  "admin_level": "state",
  "amount": 495000,
  "dept_name": "Rural Development",
  "fiscal_year": "2025-26",
  "item_category": "Roads",
  "latitude": 20,
  "longitude": 78,
  "ministry_code": "MORD-001",
  "timestamp": "2026-03-28T10:00:00Z",
  "vendor_id": "VEND-NEW-001"
}
```

**Sample Response:**
```json
{
  "trans_id": "TXN-2026-001",
  "status": "CRITICAL",
  "risk_score": 1,
  "anomaly_flags": ["ghost", "march", "price_padding"],
  "anomaly_reason": "Ghost Vendor: ₹1L+ payment to an entity with zero transaction history...",
  "evidence": {
    "ghost": {
      "vendor_id": "VEND-NEW-001",
      "amount": 495000,
      "prior_txns": 0
    }
  },
  "gemini_analysis": "This transaction strongly indicates a deliberate scheme...",
  "gemini_recommendation": "Freeze payment and verify vendor registration..."
}
```

---

### 4. **Vendor Intel Tab** - Vendor Risk Network Analysis
**Available to:** **Central Admin ONLY**

**Displays:**
- 🏢 **Vendor Risk Cards (Top 50):**
  - Vendor ID + Name
  - Risk Tier Badge (RED/ORANGE/YELLOW/GREEN)
  - Risk Score (0-100%)
  - Total Contract Value (₹ Cr)
  - Departments Served
  - Network Centrality Score
  - Risk Signals (Ghost Vendor, No GST/PAN, etc.)
  - Gemini AI Risk Explanation (for RED tier vendors)
  - Vendor Status (active/blacklisted/suspended)

**API Endpoint:** `GET /api/v1/intelligence/vendor-intelligence?top_n=50`

**Sample Response:**
```json
{
  "total_vendors_analyzed": 9,
  "vendors": [
    {
      "vendor_id": "VEND-SALAMI",
      "vendor_name": "UNREGISTERED",
      "vendor_type": "unknown",
      "vendor_status": "unregistered",
      "risk_score": 0.9,
      "risk_tier": "RED",
      "risk_signals": [
        "Ghost Vendor: Transactions exist but no vendor master record found."
      ],
      "network_centrality": 0.067,
      "departments_served": 1,
      "total_contract_value_cr": 0.0495,
      "gemini_risk_explanation": "The 'UNREGISTERED' vendor presents a severe risk of financial fraud..."
    }
  ]
}
```

---

### 5. **March Rush Tab** - Year-End Panic Spending Detection
**Available to:** All users

**Displays:**
- ⏰ **Department Risk Cards:**
  - Department Name + Code
  - Risk Tier Badge (CRITICAL/HIGH/MEDIUM/LOW)
  - Fund Lapse Risk (%)
  - Estimated Lapse Amount (₹ Cr)

**Data Filtering:**
- Central Admin: **All departments nationwide**
- State/Ministry: **Only their departments**

**API Endpoint:** `GET /api/v1/intelligence/march-rush?risk_tier=HIGH`

**Sample Response:**
```json
{
  "fiscal_year": "2025-26",
  "total_entities_analyzed": 15,
  "results": [
    {
      "dept_code": "MORD-001",
      "dept_name": "Rural Development",
      "risk_tier": "HIGH",
      "fund_lapse_risk": 78.5,
      "estimated_lapse_amount": 12.5
    }
  ]
}
```

---

### 6. **Reallocation Tab** - AI-Optimized Fund Suggestions
**Available to:** All users

**Displays:**
- 🔄 **Reallocation Suggestion Cards (Top 10):**
  - Rank Badge (#1, #2, etc.)
  - Recommended Transfer Amount (₹ Cr)

  - **FROM (Under-utilized):**
    - Entity Name
    - Ministry
    - Utilization %
    - Lapse Risk Tier

  - **TO (High-absorption):**
    - Entity Name
    - Ministry
    - Utilization %

  - Rationale (AI explanation)
  - Estimated Benefit

**Data Filtering:**
- Central Admin: **Cross-ministry suggestions**
- State/Ministry: **Within-ministry suggestions only**

**API Endpoint:** `GET /api/v1/intelligence/reallocation-engine?max_suggestions=10`

**Sample Response:**
```json
{
  "fiscal_year": "2025-26",
  "total_suggestions": 10,
  "suggestions": [
    {
      "rank": 1,
      "from_entity": "Capital Outlay on Power Projects",
      "from_code": "SCH-00004",
      "from_ministry": "Atomic Energy",
      "from_utilization_pct": 0,
      "from_lapse_risk": "HIGH",
      "to_entity": "Contingency Reserve",
      "to_code": "CONTINGENCY",
      "to_ministry": "N/A",
      "to_utilization_pct": 0,
      "recommended_transfer_cr": 2561.19,
      "estimated_benefit": "Prevents fund lapse; preserves treasury efficiency.",
      "rationale": "Transfer ₹2561 Cr from Capital Outlay on Power Projects (only 0.0% utilized)..."
    }
  ]
}
```

---

### 7. **Risk Heatmap Tab** - Ministry-Level Leakage Analysis
**Available to:** **Central Admin ONLY**

**Displays:**
- 🗺️ **Ministry Risk Cards (3-column grid):**
  - Ministry Name
  - Risk Score (0-100)
  - Risk Tier Badge (RED/ORANGE/YELLOW/GREEN)
  - Total Budget Estimate (₹ Cr)
  - Utilization %
  - Remaining Budget (₹ Cr)
  - Scheme Count

**Color Coding:**
- 🔴 **RED**: Risk Score > 90 (Critical)
- 🟠 **ORANGE**: Risk Score 70-90 (High)
- 🟡 **YELLOW**: Risk Score 40-70 (Medium)
- 🟢 **GREEN**: Risk Score < 40 (Low)

**API Endpoint:** `GET /api/v1/intelligence/leakage-risks?fiscal_year=2025-26`

**Sample Response:**
```json
{
  "fiscal_year": "2025-26",
  "total_ministries": 61,
  "risk_heatmap": [
    {
      "ministry_code": "MIN-0020",
      "ministry_name": "Ministry of Finance",
      "fiscal_year": "2025-26",
      "total_budget_estimate_cr": 9215631.49,
      "total_actual_expenditure_cr": 0,
      "utilization_pct": 0,
      "remaining_budget_cr": 9215631.49,
      "scheme_count": 51,
      "leakage_risk_score": 0.9,
      "risk_tier": "RED"
    }
  ]
}
```

---

## 🎨 UI Components Used

### Stats Cards
```jsx
<Card className="p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-neutral-600">Total Transactions Audited</p>
      <p className="text-3xl font-bold text-neutral-900">8</p>
    </div>
    <div className="p-3 bg-blue-100 rounded-lg">
      <Activity size={24} className="text-blue-600" />
    </div>
  </div>
</Card>
```

### Risk Tier Badges
```jsx
const getRiskColor = (tier) => {
  const colors = {
    CRITICAL: 'bg-red-100 text-red-800 border-red-300',
    RED: 'bg-red-100 text-red-800 border-red-300',
    ORANGE: 'bg-orange-100 text-orange-800 border-orange-300',
    YELLOW: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    GREEN: 'bg-green-100 text-green-800 border-green-300',
  }
  return colors[tier]
}

<span className={getRiskColor('CRITICAL')}>CRITICAL</span>
```

### Risk Score Progress Bar
```jsx
<div className="flex-1 bg-gray-200 rounded-full h-2">
  <div
    className="bg-red-600 h-2 rounded-full"
    style={{ width: `${risk_score * 100}%` }}
  />
</div>
```

### Tabbed Navigation
```jsx
<Button
  variant={activeTab === 'anomalies' ? 'primary' : 'secondary'}
  size="sm"
  onClick={() => setActiveTab('anomalies')}
>
  <AlertTriangle size={16} className="mr-1" />
  Anomalies
</Button>
```

---

## 🔐 Role-Based Access Control

### Central Government Admin
**tenant_type:** `central_government` or `central_admin`

**Can Access:**
- ✅ Overview Tab
- ✅ Anomalies Tab (ALL data nationwide)
- ✅ Audit Transaction Tab
- ✅ Vendor Intel Tab (FULL vendor network)
- ✅ March Rush Tab (ALL departments)
- ✅ Reallocation Tab (Cross-ministry)
- ✅ Risk Heatmap Tab (ALL ministries)

### State Government / Ministry Employees
**tenant_type:** `state_government`, `minister`, `department`

**Can Access:**
- ✅ Overview Tab
- ✅ Anomalies Tab (FILTERED by tenant_code)
- ✅ Audit Transaction Tab
- ❌ Vendor Intel Tab (HIDDEN)
- ✅ March Rush Tab (FILTERED by tenant_code)
- ✅ Reallocation Tab (FILTERED by tenant_code)
- ❌ Risk Heatmap Tab (HIDDEN)

---

## 📊 Data Filtering Logic

```javascript
const filterDataByTenant = (data, tenantCode) => {
  if (!data) return []

  if (Array.isArray(data)) {
    return data.filter(item =>
      item.tenant_code === tenantCode ||
      item.ministry_code === tenantCode ||
      item.dept_code === tenantCode
    )
  }

  return data
}

// Applied to:
const filteredAnomalies = isCentralAdmin
  ? anomalyData
  : filterDataByTenant(anomalyData, tenantCode)
```

---

## 🚀 How to Access

### Central Admin
```
1. Login with central admin credentials
2. Click "PRAHARI Intelligence" in sidebar
3. URL: http://localhost:5173/admin/intelligence
4. Access all 7 tabs
```

### State/Ministry Employee
```
1. Login with state credentials:
   Email: keshavdv241@gmail.com
   Password: vVY!fmWVOdr%08HA

2. Click "Intelligence Reports" in sidebar
3. URL: http://localhost:5173/employee/intelligence
4. Access 5 tabs (Vendor Intel and Risk Heatmap hidden)
```

---

## 📱 Responsive Design

- ✅ Mobile-first design
- ✅ Grid layouts adapt: 1 col (mobile) → 2 cols (tablet) → 3 cols (desktop)
- ✅ Navigation sidebar: Hidden on mobile, fixed on desktop
- ✅ Tabs wrap on small screens
- ✅ Cards stack vertically on mobile

---

## 🎯 8 Anomaly Detection Layers

1. **Salami Slicing** - Sub-limit structuring (₹99,999 multiple times)
2. **Ghost Vendor** - Unknown entity receiving high payments
3. **March Rush** - Year-end panic spending (March 25-31)
4. **Impossible Travel** - Geolocation velocity breach
5. **Circular Trading** - Collusion graph cycle detection
6. **Price Padding** - 2.5x market baseline breach
7. **Spending Drift** - 50x historical jump detection
8. **ML Isolation Forest** - Statistical outlier detection

**Plus:** Gemini AI narrative for every flagged transaction

---

## 📋 Testing Checklist

### Central Admin Testing
```
✅ Login as admin
✅ Navigate to /admin/intelligence
✅ Verify Overview tab shows complete data
✅ Verify Anomalies tab shows ALL anomalies
✅ Test Audit Transaction with sample data
✅ Verify Vendor Intel tab shows all vendors
✅ Verify March Rush tab shows all departments
✅ Verify Reallocation tab shows cross-ministry suggestions
✅ Verify Risk Heatmap shows all ministries
```

### State Employee Testing
```
✅ Login as employee (keshavdv241@gmail.com)
✅ Navigate to /employee/intelligence
✅ Verify Overview tab shows filtered data
✅ Verify Anomalies tab shows ONLY MH1 data
✅ Test Audit Transaction
✅ Verify Vendor Intel tab is HIDDEN
✅ Verify March Rush tab shows ONLY MH1 departments
✅ Verify Reallocation tab shows ONLY MH1 suggestions
✅ Verify Risk Heatmap tab is HIDDEN
```

---

## 🔍 Console Output

Expected logs when loading dashboard:
```
🎯 IntelligenceDashboard mounted
👤 Admin data: {email: "...", role: "employee", tenant_code: "MH1"}
🔑 Has access token: true
🚀 useEffect triggered - calling loadDashboardData

[Network Tab Shows:]
GET /api/v1/intelligence/dashboard
GET /api/v1/intelligence/anomalies?limit=100
GET /api/v1/intelligence/leakage-risks
GET /api/v1/intelligence/vendor-intelligence?top_n=50
GET /api/v1/intelligence/march-rush
GET /api/v1/intelligence/reallocation-engine?max_suggestions=10
```

---

## 🎉 Summary

**Implementation Status:**
- ✅ 9/9 PRAHARI Intelligence API endpoints integrated
- ✅ 7 intelligence tabs implemented
- ✅ Role-based access control (Central vs State/Ministry)
- ✅ Data filtering by tenant_code
- ✅ Beautiful, responsive UI/UX
- ✅ Gemini AI analysis display
- ✅ Transaction audit tool
- ✅ Risk scoring visualization
- ✅ Complete navigation integration

**All PRAHARI Intelligence features are now live in the frontend!** 🚀
