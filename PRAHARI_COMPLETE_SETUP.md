# PRAHARI Intelligence - Complete Setup & Testing Guide

## ✅ All Issues Fixed!

### Issue 1: API Calls Not Being Made
**Problem:** Intelligence Dashboard link was missing from navigation menu
**Fix:** Added "PRAHARI Intelligence" link to both admin and employee navigation

### Issue 2: Navigation Not Showing
**Problem:** IntelligenceDashboard component had no navigation sidebar
**Fix:** Added `<Navigation role={userRole} />` component

### Issue 3: Role Detection
**Problem:** Component didn't detect user role
**Fix:** Added `useAuth()` hook and role detection

---

## 🎯 How to Access Intelligence Dashboard

### For Central Admin:
1. Login with central admin credentials
2. Click **"PRAHARI Intelligence"** in sidebar (2nd menu item with Shield icon)
3. URL: `http://localhost:5173/admin/intelligence`

### For State/Ministry Employee:
1. Login with state government credentials
2. Click **"Intelligence Reports"** in sidebar (2nd menu item with Shield icon)
3. URL: `http://localhost:5173/employee/intelligence`

---

## 📊 What Each Role Sees

### Central Admin (Full Access)
**Dashboard View:**
- ✅ Total Transactions Audited (nationwide)
- ✅ Flagged Anomalies (all states)
- ✅ Critical Cases (all ministries)
- ✅ Estimated Leakage (₹ Cr)
- ✅ Gemini AI Executive Briefing (complete)
- ✅ All Anomalies (every department)
- ✅ Ministry Leakage Risk Heatmap (all ministries)

**API Calls Made:**
```javascript
GET /api/v1/intelligence/dashboard
GET /api/v1/intelligence/anomalies?limit=100
GET /api/v1/intelligence/leakage-risks
```

**Data Filtering:** NONE - sees everything

**Sample UI:**
```
PRAHARI Intelligence Dashboard
Complete oversight across all ministries and departments

[Stats Cards]
Total Transactions: 1,234,567 | Flagged: 5,678 | Critical: 234 | Leakage: ₹456.78 Cr

[AI Briefing]
Gemini AI: "Nationwide analysis shows..."

[Anomalies]
- TXN-001 | Rural Development | ₹4.95L | CRITICAL | [SALAMI_SLICING, MARCH_RUSH]
- TXN-002 | Health Ministry | ₹12.3L | FLAGGED | [GHOST_VENDOR]

[Ministry Heatmap]
[RED] Finance - 95.2
[ORANGE] Health - 78.4
[YELLOW] Education - 45.1
```

---

### State/Ministry Employee (Filtered Access)
**Dashboard View:**
- ✅ Total Transactions Audited (their state only)
- ✅ Flagged Anomalies (their department only)
- ✅ Critical Cases (their ministry only)
- ✅ Estimated Leakage (their scope)
- ✅ Gemini AI Executive Briefing (filtered)
- ✅ Anomalies (filtered by tenant_code: MH1)
- ❌ Ministry Leakage Risk Heatmap (HIDDEN)

**API Calls Made:**
```javascript
GET /api/v1/intelligence/dashboard
GET /api/v1/intelligence/anomalies?limit=100
GET /api/v1/intelligence/leakage-risks
```

**Data Filtering:**
```javascript
// Only show data where:
item.tenant_code === "MH1" ||
item.ministry_code === "MH1" ||
item.dept_code === "MH1"
```

**Sample UI:**
```
PRAHARI Intelligence Dashboard
Intelligence for Maharashtra State Government

[Stats Cards]
Total Transactions: 12,345 | Flagged: 56 | Critical: 3 | Leakage: ₹4.56 Cr

[AI Briefing]
Gemini AI: "Maharashtra analysis shows..."

[Anomalies - Only MH1]
- TXN-MH-001 | Rural Development | ₹4.95L | FLAGGED | [MARCH_RUSH]
- TXN-MH-002 | Health Dept | ₹2.3L | CRITICAL | [PRICE_PADDING]

[Ministry Heatmap] - HIDDEN (central admin only)
```

---

## 🎨 UI Components Used

### Navigation Links
```
Admin Menu:
📍 Command Center
🛡️ PRAHARI Intelligence  ← NEW!
🔑 Access Control
📊 Fiscal Analytics
⚠️ Threat Detection
📈 AI Forecasting

Employee Menu:
📍 State Dashboard
🛡️ Intelligence Reports  ← NEW!
🔒 Security Setup
📊 My Allocations
📝 Report Logs
📈 Growth Models
```

### Dashboard Components
1. **Header with Shield Icon**
   - Title: "PRAHARI Intelligence Dashboard"
   - Subtitle: Role-specific description

2. **Stats Cards (4 columns)**
   - Total Audited (blue)
   - Flagged Anomalies (orange)
   - Critical Cases (red)
   - Estimated Leakage (purple)

3. **Gemini AI Briefing**
   - Gradient card (blue to purple)
   - AI-generated executive summary
   - Full text narrative

4. **Filter Buttons**
   - ALL | FLAGGED | CRITICAL
   - Reloads data on click

5. **Anomalies List**
   - Transaction ID + risk badge
   - Department name
   - Amount in Lakhs
   - Timestamp
   - Anomaly flags (red chips)
   - AI narrative (blue box)

6. **Ministry Heatmap** (Central Only)
   - 3-column grid
   - Color-coded risk cards
   - Risk score + tier

---

## 🧪 Testing Steps

### Step 1: Login as Employee
```bash
Email: keshavdv241@gmail.com
Password: vVY!fmWVOdr%08HA
```

### Step 2: Navigate to Intelligence
1. After login, you should see the sidebar
2. Look for **"Intelligence Reports"** (2nd menu item with Shield icon)
3. Click it

### Step 3: Watch Console
Open F12 → Console, you should see:
```
🎯 IntelligenceDashboard mounted
👤 Admin data: {email: "...", role: "employee", tenant_code: "MH1"}
🔑 Has access token: true
🚀 useEffect triggered - calling loadDashboardData
```

### Step 4: Watch Network Tab
Open F12 → Network, you should see:
```
GET http://localhost:8000/api/v1/intelligence/dashboard
GET http://localhost:8000/api/v1/intelligence/anomalies?limit=100
GET http://localhost:8000/api/v1/intelligence/leakage-risks
```

### Step 5: Expected Result
✅ Dashboard loads with stats
✅ Shows only MH1 data
✅ AI briefing appears
✅ Anomalies list shows filtered data
✅ Ministry heatmap is HIDDEN

---

## 🔍 If API Calls Still Don't Work

### Check 1: Backend Running?
```bash
# Backend should be running on port 8000
curl http://localhost:8000/health
```

### Check 2: Endpoints Exist?
```bash
# Test if endpoints are implemented
curl http://localhost:8000/api/v1/intelligence/dashboard
```

**Expected:** 200 OK or data response
**If 404:** Backend hasn't implemented these endpoints yet

### Check 3: CORS Configured?
**Error in console:** "CORS policy"
**Solution:** Backend needs to allow `http://localhost:5173`

### Check 4: Auth Token Valid?
**Error in console:** "401 Unauthorized"
**Solution:** Refresh token or login again

---

## 📱 Navigation Menu Updated

### Files Changed:
1. **Navigation.jsx**
   - Added Shield icon import
   - Added `/admin/intelligence` link (2nd position)
   - Added `/employee/intelligence` link (2nd position)

2. **IntelligenceDashboard.jsx**
   - Added `<Navigation role={userRole} />` component
   - Made component role-aware
   - Added proper layout with sidebar space

3. **BudgetAnalytics.jsx, RiskAnomalies.jsx, PredictiveModeling.jsx**
   - Made role-aware (detect user/admin)
   - Dynamic navigation based on actual role

---

## 🚀 Quick Start Guide

1. **Start Backend**
   ```bash
   # Make sure backend is running with PRAHARI endpoints
   ```

2. **Start Frontend**
   ```bash
   cd coherence-frontend/COHERENCE-26_PROTOCOL_7/frontend-protocol7
   npm run dev
   ```

3. **Login**
   - Go to `http://localhost:5173/login`
   - Select "Employee"
   - Login with credentials

4. **Click Intelligence Reports**
   - 2nd menu item in sidebar
   - Shield icon
   - Should see dashboard load

5. **Check Console + Network**
   - F12 → Console (see logs)
   - F12 → Network (see API calls)

---

## 📊 Expected Console Output

```
🔄 AuthContext: Initializing auth...
✅ Restoring ADMIN from localStorage: {role: "employee", ...}
🎯 IntelligenceDashboard mounted
👤 Admin data: {email: "keshavdv241@gmail.com", tenant_code: "MH1", role: "employee"}
🔑 Has access token: true
🚀 useEffect triggered - calling loadDashboardData

[Network Request] GET /api/v1/intelligence/dashboard
[Network Request] GET /api/v1/intelligence/anomalies?limit=100
[Network Request] GET /api/v1/intelligence/leakage-risks

✅ Dashboard loaded successfully
```

---

## 🎯 Summary

**Before:**
- ❌ No Intelligence link in menu
- ❌ Couldn't access Intelligence Dashboard
- ❌ No API calls being made
- ❌ No way to see PRAHARI data

**After:**
- ✅ Intelligence link in both admin and employee menus
- ✅ Can click and access Intelligence Dashboard
- ✅ API calls trigger automatically on page load
- ✅ Beautiful UI shows filtered data based on role
- ✅ Navigation sidebar works correctly
- ✅ Role-aware across all pages

**Now you can access PRAHARI Intelligence Dashboard and see the API calls in action!** 🎉
