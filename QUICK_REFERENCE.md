# Quick Reference Guide

## ⚡ 30-Second Setup

```bash
npm install
npm run dev
# Visit http://localhost:5173/
```

## 🔐 Login Instantly

**Admin**
```
admin@government.in
password123
```

**Employee**
```
employee@state.gov.in
password123
```

---

## 🗂️ File Quick Reference

### Core Files
| File | Purpose |
|------|---------|
| `src/main.jsx` | App entry point |
| `src/App.jsx` | Routes & auth |
| `src/index.css` | Global styles |
| `tailwind.config.js` | Theme colors |
| `vite.config.js` | Build config |

### Pages
| Path | Component | Lines |
|------|-----------|-------|
| `/login` | `Login.jsx` | 205 |
| `/admin/dashboard` | `AdminHome.jsx` | 185 |
| `/admin/key-management` | `KeyManagement.jsx` | 308 |
| `/admin/budget-analytics` | `BudgetAnalytics.jsx` | 273 |
| `/admin/risk-anomalies` | `RiskAnomalies.jsx` | 335 |
| `/admin/predictive-modeling` | `PredictiveModeling.jsx` | 340 |
| `/employee/dashboard` | `EmployeeHome.jsx` | 240 |
| `/employee/key-generation` | `KeyGeneration.jsx` | 351 |

### Components
| Component | Purpose | Props |
|-----------|---------|-------|
| Button | Action button | variant, size, loading |
| Card | Content container | shadow, border, hover |
| Input | Form field | label, error, icon |
| Badge | Status label | variant |
| Modal | Dialog box | isOpen, onClose, title |
| Navigation | Sidebar nav | role |

### Utils
| File | Exports |
|------|---------|
| `mockData.js` | STATES, BUDGET_DATA, ANOMALIES, etc. |
| `utils.js` | Toast functions, formatters, validators |

---

## 🎨 Colors

```js
Primary:    #0052FF (Electric Blue)
Secondary:  #4D7CFF (Light Blue)
Accent:     #00d9ff (Cyan)
Success:    #10b981 (Emerald)
Warning:    #f97316 (Orange)
Error:      #ef4444 (Red)
```

## 🔤 Typography

```
Display: Calistoga (headings)
Body: Inter (content)
Mono: Monospace (keys, IDs)
```

---

## 🧭 Navigation Map

```
Login
├── Admin
│   ├── Dashboard (Home)
│   ├── Key Management
│   ├── Budget Analytics
│   ├── Risk & Anomalies
│   └── Predictive Modeling
└── Employee
    ├── Dashboard (Home)
    ├── Key Generation
    ├── Budget Analytics
    ├── Risk & Anomalies
    └── Predictive Modeling
```

---

## 🔑 Feature Locations

| Feature | File | Component |
|---------|------|-----------|
| Login | `Login.jsx` | Login form |
| Invite Officials | `KeyManagement.jsx` | Form + Modal |
| Budget Charts | `BudgetAnalytics.jsx` | Recharts |
| Anomaly List | `RiskAnomalies.jsx` | Table + Modal |
| Forecasting | `PredictiveModeling.jsx` | Charts + Table |
| Key Generation | `KeyGeneration.jsx` | 3-step wizard |

---

## 💾 Mock Data Structure

```js
// States (10)
STATES = ['Andhra Pradesh', 'Karnataka', ...]

// Ministries (8)
MINISTRIES = ['Education', 'Health', ...]

// Budget
BUDGET_DATA = {
  totalAllocation: 50B,
  totalSpent: 42.3B,
  statewise: [...],
  ministrywise: [...]
}

// Anomalies (4)
ANOMALIES = [
  { id, type, severity, state, ... }
]

// Predictions (3 years)
PREDICTIVE_MODELS = [...]
RISK_FORECAST = [...]
```

---

## 🔄 Common Tasks

### Change Primary Color
Edit `tailwind.config.js`:
```js
colors: {
  primary: {
    900: '#YOUR_COLOR', // Change this
    ...
  }
}
```

### Add New State
Edit `src/utils/mockData.js`:
```js
export const STATES = [
  'Your State',
  ...
]
```

### Create New Page
1. Create file in `src/pages/admin/` or `src/pages/employee/`
2. Export React component
3. Import in `src/App.jsx`
4. Add route in `Routes` component
5. Add link in `src/components/Navigation.jsx`

### Connect to Backend
Replace in `src/utils/mockData.js`:
```js
// FROM:
export const BUDGET_DATA = { ... }

// TO:
const [budgetData, setBudgetData] = useState(null)
useEffect(() => {
  fetch('/api/budget/analytics')
    .then(r => r.json())
    .then(data => setBudgetData(data))
}, [])
```

### Add Toast Notification
In any component:
```js
import { showSuccess, showError } from '../utils/utils'

showSuccess('Operation successful!')
showError('Operation failed!')
```

### Show Loading State
In buttons:
```jsx
<Button loading={isLoading}>
  Submit
</Button>
```

---

## 🧪 Testing Quick Commands

### Test Admin Flow
1. Login as admin
2. Visit each page
3. Test form submission
4. Test anomaly investigation
5. Logout

### Test Employee Flow
1. Login as employee
2. Go to key generation
3. Upload public key
4. View analytics
5. Logout

### Test Responsive Design
In browser DevTools (F12):
- Toggle device toolbar
- Test mobile view (375px)
- Test tablet view (768px)
- Test desktop view (1920px)

### Test Notifications
Try these actions:
- Submit any form → Success toast
- Error scenario → Error toast
- Navigation → Info toast

---

## 🚀 Build & Deploy

### Local Build
```bash
npm run build
npm run preview
```

### Deploy to Vercel
```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys
```

### Manual Deploy
```bash
# Build
npm run build

# Upload dist/ to hosting
# Configure for SPA routing
```

---

## 🐛 Troubleshooting Quick Tips

| Issue | Solution |
|-------|----------|
| Port in use | `npm run dev -- --port 3000` |
| Dependencies fail | `rm -rf node_modules && npm install` |
| Styles not applied | Restart server + clear cache |
| HMR not working | Restart `npm run dev` |
| Build errors | `rm -rf dist && npm run build` |
| Blank page | Check browser console (F12) |

---

## 📊 API Integration Points

| Feature | Endpoint | Replace In |
|---------|----------|-----------|
| Login | `POST /api/auth/login` | `AuthContext.jsx` |
| Budget | `GET /api/budget/analytics` | `BudgetAnalytics.jsx` |
| Anomalies | `GET /api/anomalies/detect` | `RiskAnomalies.jsx` |
| Predictions | `GET /api/predictions/budget` | `PredictiveModeling.jsx` |
| Invitations | `POST /api/invitations/send` | `KeyManagement.jsx` |

---

## 🎯 Admin Dashboard Flow

```
1. Login (email + password)
   ↓
2. See Dashboard with stats
   ↓
3. Navigate to features
   ├── Send Invitations
   ├── View Analytics
   ├── Monitor Anomalies
   └── Check Forecasts
   ↓
4. Logout
```

---

## 🎯 Employee Dashboard Flow

```
1. Receive Email
   ↓
2. Click Link
   ↓
3. Login (email + temp password)
   ↓
4. Go to Key Generation
   ↓
5. Download script & upload key
   ↓
6. Access full platform
   ├── View Analytics
   ├── Report Anomalies
   └── Check Forecasts
   ↓
7. Logout
```

---

## 📱 Responsive Breakpoints

| Device | Width | Layout |
|--------|-------|--------|
| Mobile | < 640px | Single column, hamburger menu |
| Tablet | 640-1024px | 2 columns, collapsible nav |
| Desktop | > 1024px | Multi-column, fixed sidebar |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Submit form |
| `Ctrl+Enter` | Submit textarea |
| `Escape` | Close modal |
| `Tab` | Navigate form fields |
| `Shift+Tab` | Navigate backwards |

---

## 🔒 Security Checklist

- ✅ Protected routes
- ✅ Role-based access
- ✅ Input validation
- ⚠️ TODO: Use HTTPS
- ⚠️ TODO: Secure cookies
- ⚠️ TODO: Real OAuth
- ⚠️ TODO: Server validation

---

## 📈 Performance Tips

1. Use `memo()` for expensive components
2. Lazy load routes: `React.lazy()`
3. Optimize images for web
4. Cache API responses
5. Use virtual scrolling for large lists

---

## 🎨 Design System Quick Guide

```jsx
// Primary Button
<Button variant="primary">Submit</Button>

// Success Button
<Button variant="success">Approve</Button>

// Danger Button
<Button variant="danger">Delete</Button>

// Card with shadow
<Card shadow="glass">Content</Card>

// Input with icon
<Input icon={Mail} placeholder="Email" />

// Badge for status
<Badge variant="success">Active</Badge>

// Modal dialog
<Modal isOpen={open} onClose={close}>
  Content
</Modal>
```

---

## 📊 Mock Data Stats

```
States: 10 major states
Ministries: 8 key departments
Total Budget: 50 Billion INR
Spent: 42.3 Billion INR (84.6%)
Anomalies: 4 detected
Forecast Years: 3 years
```

---

## 🔗 Important Links

| Resource | URL |
|----------|-----|
| React Docs | https://react.dev |
| Vite Docs | https://vitejs.dev |
| Tailwind Docs | https://tailwindcss.com |
| Recharts Docs | https://recharts.org |
| React Router | https://reactrouter.com |

---

## 📝 Documentation Files

| File | Content |
|------|---------|
| README.md | Quick start |
| EXECUTION_GUIDE.md | Detailed setup |
| SETUP_STEPS.md | Step-by-step |
| FEATURES.md | Feature docs |
| PROJECT_SUMMARY.md | Project overview |
| QUICK_REFERENCE.md | This file |

---

## ✅ Pre-Launch Checklist

- [ ] All dependencies installed
- [ ] Dev server running
- [ ] Can login as admin
- [ ] Can login as employee
- [ ] All pages accessible
- [ ] Forms working
- [ ] No console errors
- [ ] Responsive design tested
- [ ] Build successful
- [ ] Ready for deployment

---

**Version**: 1.0.0  
**Last Updated**: March 2024  
**Quick Tips**: Use this guide for quick reference!
