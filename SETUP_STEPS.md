# Step-by-Step Execution Guide

## Complete Setup Instructions for Budget Intelligence Platform

---

## ✅ STEP 1: Environment Setup

### 1.1 Check Node.js Installation
```bash
node --version  # Should be v16 or higher
npm --version   # Should be v7 or higher
```

If not installed, download from: https://nodejs.org/

### 1.2 Verify Project Structure
The project includes all necessary files:
- ✅ `package.json` - Dependencies configured
- ✅ `vite.config.js` - Vite configuration
- ✅ `tailwind.config.js` - Tailwind setup
- ✅ `postcss.config.js` - PostCSS configuration
- ✅ `index.html` - Entry HTML file
- ✅ `src/` - All React components and pages

---

## ✅ STEP 2: Install Dependencies

### 2.1 Using npm (Recommended)
```bash
cd /path/to/project
npm install
```

### 2.2 Alternative - Using pnpm (Faster)
```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install dependencies
pnpm install
```

### 2.3 Alternative - Using yarn
```bash
# Install yarn if not already installed
npm install -g yarn

# Install dependencies
yarn install
```

### 2.4 Verify Installation
After installation, check that `node_modules` folder is created:
```bash
ls node_modules  # On Linux/macOS
dir node_modules # On Windows
```

---

## ✅ STEP 3: Start Development Server

### 3.1 Run Development Server
```bash
npm run dev
```

Expected output:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### 3.2 Open in Browser
- Automatically opens at `http://localhost:5173/`
- If not, manually visit: `http://localhost:5173/`

### 3.3 Troubleshooting Port Issues
If port 5173 is already in use:
```bash
# Vite will automatically use next available port
# Or specify custom port:
npm run dev -- --port 3000
```

---

## ✅ STEP 4: Access the Application

### 4.1 Landing Page
You should see the login page with:
- BIP logo and title
- "Budget Intelligence" heading
- Role selection (Admin/Employee)
- Login form

### 4.2 Test Admin Login

1. Select "Admin" role
2. Enter credentials:
   - Email: `admin@government.in`
   - Password: `password123`
3. Click "Sign In" or press Enter
4. You'll see the Admin Dashboard

### 4.3 Test Employee Login

1. Go back to login (click logo or use browser back)
2. Select "Employee" role
3. Enter credentials:
   - Email: `employee@state.gov.in`
   - Password: `password123`
   - Public Key: (paste any text - for demo only)
4. Click "Sign In" or press Enter
5. You'll see the Employee Dashboard

---

## ✅ STEP 5: Explore Admin Features

### 5.1 Dashboard (Home)
- View total budget allocation and spending
- See key statistics in cards
- Access quick action buttons
- Navigate to all admin features

### 5.2 Key Management
1. Click "Key Management" in sidebar
2. Enter an email: `test.official@state.gov.in`
3. Select official type (State Government or Ministry)
4. Click "Send Invitation"
5. A modal appears with:
   - Invitation link
   - Temporary password
6. Copy the link and password

### 5.3 Budget Analytics
1. Click "Budget Analytics" in sidebar
2. Switch between tabs:
   - **State-wise Analysis**: Bar charts comparing allocated vs spent
   - **Ministry-wise Analysis**: Ministry budget distribution
   - **Monthly Trend**: Line chart of spending over time
3. Interact with charts (hover for details)
4. View utilization rates
5. Check pie charts

### 5.4 Risk & Anomalies
1. Click "Risk & Anomalies" in sidebar
2. See summary cards showing:
   - Critical Issues count
   - High Priority count
   - Under Investigation count
   - Resolved count
3. Filter by severity (all, critical, high, medium, low)
4. Click on an anomaly to see details
5. Try "Mark Resolved" or "Investigate" buttons
6. View recommendations

### 5.5 Predictive Modeling
1. Click "Predictive Modeling" in sidebar
2. Select a model:
   - **Budget Forecast**: 3-year projections
   - **Risk Assessment**: Lapse risk by state
3. View interactive charts
4. Read key insights
5. Check detailed forecasts table

---

## ✅ STEP 6: Explore Employee Features

### 6.1 Dashboard (Home)
1. Logout by clicking "Logout" in sidebar (bottom)
2. Login again as Employee (from Step 4.3)
3. See Employee Dashboard with:
   - Welcome message with email
   - Status cards
   - Warning about key generation (if keys not yet generated)
   - Available features grid

### 6.2 Key Generation
1. Click "Key Generation" in sidebar
2. Follow Step 1: Download the Script
   - Click "Download Script" button
   - Or view script contents
3. In Step 2 (for demo):
   - Paste any text as public key (minimum 50 characters)
   - Click "Upload Public Key"
4. See completion message in Step 3
5. Verify public key was saved

### 6.3 Budget Analytics (Employee View)
1. Click "Budget Analytics" in sidebar
2. See the same charts and analytics
3. All data is displayed (in production, would be filtered to their state/ministry)

### 6.4 Risk & Anomalies (Employee View)
1. Click "Risk & Anomalies" in sidebar
2. See same anomaly detection features
3. Can report and investigate anomalies

### 6.5 Predictive Modeling (Employee View)
1. Click "Predictive Modeling" in sidebar
2. View forecasts and risk assessments
3. See recommendations for their department

---

## ✅ STEP 7: Test Key Features

### 7.1 Test Toast Notifications
- Every action triggers a toast notification
- Try: Login, Invite official, Upload key, etc.
- Notifications appear in top-right corner
- Types: Success (green), Error (red), Info (blue)

### 7.2 Test Form Enter Key Support
In any form:
- Type values
- Press "Enter" key to submit
- In textareas, use "Ctrl+Enter" to submit

### 7.3 Test Responsive Design
1. Resize browser window to test mobile view
2. On mobile/small screens:
   - Sidebar collapses into hamburger menu
   - Layout switches to single column
   - Cards stack vertically
3. Use browser DevTools (F12) to test different screen sizes

### 7.4 Test Navigation
1. Click sidebar links to navigate
2. Use browser back/forward buttons
3. All routes work correctly
4. Protected routes redirect to login if not authenticated

### 7.5 Test Data Persistence
1. Login and navigate pages
2. Refresh browser (F5)
3. Still logged in (session persists)
4. Navigate to different pages
5. Data loads correctly

---

## ✅ STEP 8: Build for Production

### 8.1 Create Production Build
```bash
npm run build
```

Expected output:
```
✓ 1234 modules transformed.
dist/index.html                 5.50 kB │ gzip: 2.10 kB
dist/assets/index.abc123.js   125.50 kB │ gzip: 42.10 kB
dist/assets/index.abc123.css    25.30 kB │ gzip: 8.20 kB
```

### 8.2 Verify Build
```bash
# Check dist folder was created
ls dist/
# Or on Windows
dir dist
```

### 8.3 Preview Production Build
```bash
npm run preview
```

Opens at `http://localhost:4173/` for testing production build.

---

## ✅ STEP 9: Customize the Application

### 9.1 Change Primary Colors
Edit `tailwind.config.js`:
```js
colors: {
  primary: {
    900: '#0052FF', // Change this to your color
    800: '#3d61e6',
    // ... other shades
  }
}
```

### 9.2 Add New States
Edit `src/utils/mockData.js`:
```js
export const STATES = [
  'Your State Name',
  // ... add more states
]
```

### 9.3 Modify Budget Data
Edit `src/utils/mockData.js`:
```js
export const BUDGET_DATA = {
  totalAllocation: 50000000000, // Change amounts
  // ... modify other data
}
```

### 9.4 Add New Pages
1. Create file in `src/pages/admin/` or `src/pages/employee/`
2. Import page in `src/App.jsx`
3. Add route in `Routes` component
4. Add link in `src/components/Navigation.jsx`

---

## ✅ STEP 10: Connect to Backend (Optional)

### 10.1 Update Login API
Edit `src/context/AuthContext.jsx`:
```js
const login = async (userData) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
  const data = await response.json()
  // ... save user data
}
```

### 10.2 Update Budget Analytics API
Edit `src/pages/admin/BudgetAnalytics.jsx`:
```js
const [budgetData, setBudgetData] = useState(null)

useEffect(() => {
  fetch('/api/budget/analytics')
    .then(res => res.json())
    .then(data => setBudgetData(data))
}, [])
```

### 10.3 Update Anomalies API
Edit `src/pages/admin/RiskAnomalies.jsx`:
```js
useEffect(() => {
  fetch('/api/anomalies/detect')
    .then(res => res.json())
    .then(data => setAnomalies(data))
}, [])
```

---

## ✅ STEP 11: Deployment

### 11.1 Deploy to Vercel
```bash
# Connect GitHub repository to Vercel
# Vercel auto-detects Vite configuration
# Deploy with single click from Vercel dashboard
```

### 11.2 Deploy to Other Hosts
```bash
# Build the project
npm run build

# Upload dist/ folder to your hosting
# Configure server to serve index.html for all routes
```

### 11.3 Environment Variables
Create `.env.local`:
```
VITE_API_URL=https://api.example.com
VITE_OAUTH_CLIENT_ID=your_client_id
```

---

## ✅ STEP 12: Troubleshooting

### Issue: Port Already in Use
```bash
# Solution: Use different port
npm run dev -- --port 3000
```

### Issue: Dependencies Not Installing
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Hot Module Replacement Not Working
```bash
# Solution: Restart dev server
npm run dev
```

### Issue: Build Fails
```bash
# Solution: Clear dist folder and rebuild
rm -rf dist
npm run build
```

### Issue: Styles Not Applying
```bash
# Solution: Check tailwind.config.js includes src/ path
# And restart dev server
npm run dev
```

---

## ✅ STEP 13: Test Scenarios

### Scenario 1: Complete Admin Workflow
1. Login as Admin
2. Go to Key Management
3. Send invitation to: `new.official@state.gov.in`
4. View analytics and anomalies
5. Check predictions
6. Logout

### Scenario 2: Complete Employee Workflow
1. Login as Employee
2. See dashboard with warning about keys
3. Go to Key Generation
4. Download/view script
5. Upload public key
6. Access all features
7. Logout

### Scenario 3: Anomaly Investigation
1. Login as Admin
2. Go to Risk & Anomalies
3. Filter by "critical" severity
4. Click on first anomaly
5. Read details and recommendations
6. Click "Investigate"
7. Later, click "Mark Resolved"

### Scenario 4: Budget Forecasting
1. Login as Admin
2. Go to Predictive Modeling
3. View Budget Forecast model
4. Check 3-year projections
5. Read insights and recommendations
6. Switch to Risk Assessment
7. Review lapse risk by state

---

## ✅ STEP 14: Performance Optimization

### Test Performance
```bash
# Build and analyze
npm run build
# Check dist folder size (should be <500KB total)
```

### Optimization Tips
1. ✅ Code splitting enabled (automatic with Vite)
2. ✅ CSS minification included (Tailwind)
3. ✅ Image optimization ready
4. ✅ Component lazy loading possible
5. ✅ Fast refresh on changes (HMR)

---

## ✅ FINAL VERIFICATION CHECKLIST

- [ ] Node.js v16+ installed
- [ ] Dependencies installed (`npm install` completed)
- [ ] Dev server running (`npm run dev`)
- [ ] Can login as Admin
- [ ] Can login as Employee
- [ ] Admin pages accessible and functional
- [ ] Employee pages accessible and functional
- [ ] Toast notifications working
- [ ] Forms accept Enter key
- [ ] Responsive design working
- [ ] Build command works (`npm run build`)
- [ ] No console errors
- [ ] All images/charts loading
- [ ] Navigation working correctly
- [ ] localStorage persisting session

---

## 📞 Support

If you encounter any issues:

1. **Check Prerequisites**: Node.js installed and version correct
2. **Clear Cache**: Delete node_modules and reinstall
3. **Restart Server**: Stop and restart `npm run dev`
4. **Check Browser Console**: F12 to see errors
5. **Check Terminal**: Look for error messages in terminal
6. **Try Different Browser**: Test in Chrome, Firefox, Safari

---

## 🎉 Congratulations!

You have successfully set up and tested the National Budget Intelligence Platform!

Next steps:
- Customize colors and branding
- Connect to your backend APIs
- Add real user authentication
- Deploy to production
- Monitor performance and user feedback

---

**Last Updated**: March 2024  
**Version**: 1.0.0  
**Status**: ✅ Ready to Use
