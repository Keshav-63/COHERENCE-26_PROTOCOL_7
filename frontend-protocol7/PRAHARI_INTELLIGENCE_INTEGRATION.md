# PRAHARI Intelligence API Integration

## Overview

Complete integration of PRAHARI Intelligence endpoints into the frontend with role-based access control for Central Government, State Government, and Ministry users.

---

## Files Created/Modified

### 1. API Configuration
**File:** `src/config/api.config.js`

Added intelligence endpoints:
```javascript
INTELLIGENCE: {
  AUDIT: 'intelligence/audit',
  ANOMALIES: 'intelligence/anomalies',
  PHANTOM_UTILIZATION: (entityCode) => `intelligence/phantom-utilization/${entityCode}`,
  MARCH_RUSH: 'intelligence/march-rush',
  VENDOR_INTELLIGENCE: 'intelligence/vendor-intelligence',
  REALLOCATION_ENGINE: 'intelligence/reallocation-engine',
  DASHBOARD: 'intelligence/dashboard',
  LEAKAGE_RISKS: 'intelligence/leakage-risks',
  FISCAL_FLOW_GRAPH: 'intelligence/fiscal-flow-graph',
}
```

### 2. Intelligence Service
**File:** `src/services/intelligence.service.js` (NEW)

Complete service layer for all 9 PRAHARI Intelligence endpoints:

#### Available Functions:

1. **auditTransaction(transactionData)**
   - Audits transaction through all 8 anomaly layers + Gemini AI
   - POST /api/v1/intelligence/audit

2. **getAnomalies(params)**
   - Gets all detected anomalies
   - Supports filtering: FLAGGED, CRITICAL
   - GET /api/v1/intelligence/anomalies

3. **getPhantomUtilization(entityCode, fiscalYear)**
   - Detects phantom (paper) spending
   - GET /api/v1/intelligence/phantom-utilization/{entity_code}

4. **getMarchRushRisks(params)**
   - Identifies March Rush panic spending departments
   - GET /api/v1/intelligence/march-rush

5. **getVendorIntelligence(params)**
   - Vendor risk analysis with cartel detection
   - GET /api/v1/intelligence/vendor-intelligence

6. **getReallocationSuggestions(params)**
   - AI-optimized fund reallocation suggestions
   - GET /api/v1/intelligence/reallocation-engine

7. **getIntelligenceDashboard()**
   - Executive dashboard with Gemini AI briefing
   - GET /api/v1/intelligence/dashboard

8. **getLeakageRisks(fiscalYear)**
   - Ministry-level leakage risk heatmap
   - GET /api/v1/intelligence/leakage-risks

9. **getFiscalFlowGraph(params)**
   - Fiscal cascade graph (money flow visualization)
   - GET /api/v1/intelligence/fiscal-flow-graph

### 3. Intelligence Dashboard Page
**File:** `src/pages/admin/IntelligenceDashboard.jsx` (NEW)

Complete dashboard with:
- **Role-based filtering**: Central admins see all data, state/ministry users see only their data
- **Real-time stats**: Audited transactions, flagged anomalies, critical cases, estimated leakage
- **Gemini AI Briefing**: Executive summary with AI insights
- **Anomaly List**: Detailed view of detected anomalies with risk scores
- **Leakage Risk Heatmap**: Ministry-level risk visualization (central admins only)
- **Filter Controls**: ALL, FLAGGED, CRITICAL

### 4. Service Index
**File:** `src/services/index.js`

Added export:
```javascript
export * as intelligenceService from './intelligence.service'
```

### 5. App Routes
**File:** `src/App.jsx`

Added routes:
```javascript
// Central Admin
/admin/intelligence → IntelligenceDashboard (full access)

// State/Ministry Users
/employee/intelligence → IntelligenceDashboard (filtered data)
```

---

## Role-Based Access Control

### Central Government Admin
**tenant_type:** `central_government` or `central_admin`

**Access:**
- ✅ All anomalies across all ministries
- ✅ Complete leakage risk heatmap
- ✅ Full vendor intelligence network
- ✅ March Rush predictions for all departments
- ✅ Reallocation suggestions across ministries
- ✅ Fiscal flow graph for entire government

**Dashboard View:**
```
PRAHARI Intelligence Dashboard
Complete oversight across all ministries and departments

Stats:
- Total Transactions Audited: 1,234,567
- Flagged Anomalies: 5,678
- Critical Cases: 234
- Estimated Leakage: ₹456.78 Cr

AI Executive Briefing:
[Gemini AI comprehensive analysis for Finance Ministry]

Anomalies: All departments nationwide
Ministry Leakage Risk Heatmap: Shows all ministries
```

### State Government / Ministry Users
**tenant_type:** `state_government`, `minister`, `department`

**Access:**
- ✅ Anomalies for their tenant only (filtered by tenant_code)
- ✅ Leakage risks for their ministry/department
- ✅ Vendor intelligence for their transactions
- ✅ March Rush predictions for their department
- ✅ Reallocation suggestions within their scope
- ✅ Fiscal flow graph for their ministry

**Dashboard View:**
```
PRAHARI Intelligence Dashboard
Intelligence for Maharashtra State Government

Stats:
- Total Transactions Audited: 12,345 (their dept only)
- Flagged Anomalies: 56
- Critical Cases: 3
- Estimated Leakage: ₹4.56 Cr

AI Executive Briefing:
[Gemini AI analysis for their department only]

Anomalies: Only their department's data
Ministry Leakage Risk Heatmap: Hidden (central admin only)
```

---

## Data Filtering Logic

### Automatic Tenant Filtering

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
```

**Applied to:**
- Anomalies list
- Leakage risks
- Vendor intelligence
- March Rush predictions
- Reallocation suggestions

**Not filtered (central admin only):**
- Complete executive briefing
- Ministry heatmap
- Cross-ministry analytics

---

## Usage Examples

### 1. Access Intelligence Dashboard

**Central Admin:**
```
Navigate to: /admin/intelligence
Shows: All data across government
```

**State Admin:**
```
Navigate to: /employee/intelligence
Shows: Only Maharashtra State data (filtered by tenant_code: MH1)
```

### 2. Audit a Transaction

```javascript
import { intelligenceService } from '../../services'

const auditResult = await intelligenceService.auditTransaction({
  trans_id: "TXN-2026-001",
  admin_level: "state",
  amount: 495000,
  dept_name: "Rural Development",
  fiscal_year: "2025-26",
  item_category: "Roads",
  latitude: 20,
  longitude: 78,
  ministry_code: "MORD-001",
  timestamp: "2026-03-28T10:00:00Z",
  vendor_id: "VEND-NEW-001"
})

// Response includes:
// - flags: ["SALAMI_SLICING", "MARCH_RUSH"]
// - risk_score: 85.4
// - ai_narrative: "This transaction shows..."
```

### 3. Get Anomalies with Filters

```javascript
// Get only critical anomalies
const criticalOnly = await intelligenceService.getAnomalies({
  status_filter: 'CRITICAL',
  limit: 50
})

// Get all flagged anomalies
const flaggedOnly = await intelligenceService.getAnomalies({
  status_filter: 'FLAGGED',
  limit: 100
})
```

### 4. Check March Rush Risks

```javascript
// Get departments at high risk
const marchRushRisks = await intelligenceService.getMarchRushRisks({
  fiscal_year: '2025-26',
  risk_tier: 'HIGH'
})

// Response:
// [
//   {
//     dept_code: "MORD-001",
//     dept_name: "Rural Development",
//     risk_tier: "HIGH",
//     fund_lapse_risk: 78.5,
//     estimated_lapse_amount: 12.5 // Cr
//   }
// ]
```

### 5. Get Reallocation Suggestions

```javascript
const suggestions = await intelligenceService.getReallocationSuggestions({
  fiscal_year: '2025-26',
  max_suggestions: 10
})

// Response:
// [
//   {
//     from_scheme: "Scheme-A",
//     to_scheme: "Scheme-B",
//     suggested_amount: 5.6, // Cr
//     beneficiary_impact: "Reach 50,000 more families",
//     rationale: "Scheme-A has 60% unutilized funds..."
//   }
// ]
```

### 6. Vendor Intelligence

```javascript
// Get top 50 risky vendors
const vendorRisks = await intelligenceService.getVendorIntelligence({
  top_n: 50,
  risk_tier: 'RED'
})

// Response includes:
// - vendor_id, vendor_name
// - risk_tier: RED/ORANGE/YELLOW/GREEN
// - network_centrality_score
// - blacklist_status
// - ai_explanation: "This vendor is flagged because..."
```

---

## UI Components Used

### Cards
```javascript
<Card className="p-6">
  <!-- Content -->
</Card>
```

### Stat Display
```javascript
<Card className="p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-neutral-600">Total Audited</p>
      <p className="text-3xl font-bold">1,234,567</p>
    </div>
    <div className="p-3 bg-blue-100 rounded-lg">
      <Activity size={24} />
    </div>
  </div>
</Card>
```

### Risk Tier Badges
```javascript
const getRiskColor = (tier) => {
  const colors = {
    CRITICAL: 'bg-red-100 text-red-800 border-red-300',
    HIGH: 'bg-orange-100 text-orange-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-green-100 text-green-800',
  }
  return colors[tier]
}

<span className={getRiskColor(anomaly.status)}>
  {anomaly.status}
</span>
```

---

## API Request Examples

### POST /api/v1/intelligence/audit
```json
Request:
{
  "admin_level": "state",
  "amount": 495000,
  "dept_name": "Rural Development",
  "fiscal_year": "2025-26",
  "item_category": "Roads",
  "latitude": 20,
  "longitude": 78,
  "ministry_code": "MORD-001",
  "timestamp": "2026-03-28T10:00:00Z",
  "trans_id": "TXN-2026-001",
  "vendor_id": "VEND-NEW-001"
}

Response:
{
  "trans_id": "TXN-2026-001",
  "status": "FLAGGED",
  "risk_score": 85.4,
  "flags": ["SALAMI_SLICING", "MARCH_RUSH", "GHOST_VENDOR"],
  "layer_results": {
    "salami_slicing": true,
    "ghost_vendor": false,
    "march_rush": true,
    // ... other layers
  },
  "ai_narrative": "This transaction of ₹4.95L shows suspicious patterns...",
  "recommended_action": "INVESTIGATE"
}
```

### GET /api/v1/intelligence/anomalies?status_filter=CRITICAL&limit=100
```json
Response:
{
  "total": 234,
  "anomalies": [
    {
      "id": "ANOM-001",
      "trans_id": "TXN-2026-001",
      "status": "CRITICAL",
      "risk_score": 95.2,
      "amount": 495000,
      "dept_name": "Rural Development",
      "tenant_code": "MH1",
      "ministry_code": "MORD-001",
      "flags": ["SALAMI_SLICING", "CIRCULAR_TRADING"],
      "ai_narrative": "High-risk transaction detected...",
      "detected_at": "2026-03-28T10:15:00Z"
    }
  ]
}
```

---

## Testing

### 1. Central Admin Access
```bash
# Login as central admin
Email: admin@gov.in
Password: CentralAdminPass123

# Navigate to
http://localhost:5173/admin/intelligence

# Should see:
✅ All anomalies nationwide
✅ Ministry leakage heatmap
✅ Complete AI briefing
```

### 2. State Admin Access
```bash
# Login as state admin
Email: keshavdv241@gmail.com
Password: vVY!fmWVOdr%08HA

# Navigate to
http://localhost:5173/employee/intelligence

# Should see:
✅ Only MH1 (Maharashtra) data
✅ Filtered anomalies
✅ Department-specific briefing
❌ Ministry heatmap hidden
```

### 3. API Testing
```javascript
// In browser console after login
const { intelligenceService } = await import('./services')

// Get dashboard data
const dashboard = await intelligenceService.getIntelligenceDashboard()
console.log(dashboard)

// Get anomalies
const anomalies = await intelligenceService.getAnomalies({ limit: 10 })
console.log(anomalies)
```

---

## Error Handling

All intelligence service functions include comprehensive error handling:

```javascript
try {
  const data = await intelligenceService.getAnomalies()
} catch (error) {
  // Error is already formatted by handleIntelligenceError
  console.error(error.message)
  // Shows user-friendly message:
  // - "Validation error" for 422
  // - "Unauthorized access" for 401
  // - "Network error" for connection issues
}
```

---

## Summary

**✅ Completed:**
1. All 9 PRAHARI Intelligence endpoints integrated
2. Complete service layer with error handling
3. Role-based dashboard with data filtering
4. Routes for admin and employee access
5. Real-time stats and AI briefing display
6. Anomaly list with risk scoring
7. Ministry leakage risk heatmap (central only)

**🎯 Features:**
- Central admins see ALL data
- State/ministry users see ONLY their data
- Automatic tenant-based filtering
- Gemini AI executive briefings
- Risk tier badges and color coding
- Filter controls (ALL/FLAGGED/CRITICAL)

**📍 Access URLs:**
- Central Admin: `/admin/intelligence`
- State/Ministry: `/employee/intelligence`

**Ready to use!** The PRAHARI Intelligence system is now fully integrated into your frontend with proper role-based access control.
