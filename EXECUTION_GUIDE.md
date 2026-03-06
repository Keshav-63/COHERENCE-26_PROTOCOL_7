# Budget Intelligence Platform - Execution Guide

## Overview
This is a complete React Vite JavaScript application for tracking national budget flows with anomaly detection, predictive modeling, and role-based access control.

## Project Structure

```
project/
├── src/
│   ├── main.jsx                    # Entry point
│   ├── App.jsx                     # Router configuration
│   ├── index.css                   # Global styles
│   ├── context/
│   │   └── AuthContext.jsx         # Authentication context
│   ├── components/
│   │   ├── Button.jsx              # Reusable button component
│   │   ├── Card.jsx                # Reusable card component
│   │   ├── Input.jsx               # Reusable input component
│   │   ├── Badge.jsx               # Reusable badge component
│   │   ├── Modal.jsx               # Reusable modal component
│   │   └── Navigation.jsx          # Navigation component
│   ├── pages/
│   │   ├── auth/
│   │   │   └── Login.jsx           # Login/signup page
│   │   ├── admin/
│   │   │   ├── AdminHome.jsx       # Admin dashboard
│   │   │   ├── KeyManagement.jsx   # Invite officials page
│   │   │   ├── BudgetAnalytics.jsx # Budget tracking & analytics
│   │   │   ├── RiskAnomalies.jsx   # Anomaly detection
│   │   │   └── PredictiveModeling.jsx # Forecasting & modeling
│   │   └── employee/
│   │       ├── EmployeeHome.jsx    # Employee dashboard
│   │       ├── KeyGeneration.jsx   # Key generation
│   │       └── [same as admin]     # Budget analytics, risks, predictions
│   └── utils/
│       ├── mockData.js             # Mock data for development
│       └── utils.js                # Helper functions
├── index.html                      # HTML entry point
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
├── package.json                    # Dependencies
└── EXECUTION_GUIDE.md             # This file
```

## Installation & Setup

### Prerequisites
- Node.js 16+ installed
- npm or pnpm package manager

### Step 1: Install Dependencies

```bash
# Using npm
npm install

# Or using pnpm (recommended)
pnpm install

# Or using yarn
yarn install
```

### Step 2: Start Development Server

```bash
# Using npm
npm run dev

# Or using pnpm
pnpm dev

# Or using yarn
yarn dev
```

The application will start at `http://localhost:5173`

### Step 3: Build for Production

```bash
# Using npm
npm run build

# Or using pnpm
pnpm build

# Or using yarn
yarn build
```

The optimized build will be created in the `dist` folder.

## Login Credentials (Mock Data)

### Admin (Central Government)
- **Role**: Admin
- **Email**: admin@government.in
- **Password**: password123

### Employee (State/Ministry)
- **Role**: Employee
- **Email**: employee@state.gov.in
- **Password**: password123
- **Public Key**: Required (you can paste any text)

## Features Overview

### Admin Dashboard (Central Government)

1. **Dashboard (Home)**
   - Overview of total allocation and spending
   - Quick stats and key metrics
   - Links to all features

2. **Key Management**
   - Send invitations to state/ministry officials
   - View list of invited officials
   - Track invitation status
   - Auto-generate temporary passwords
   - Send invitation links via email (mock)

3. **Budget Analytics**
   - State-wise budget allocation vs spending
   - Ministry-wise budget distribution
   - Monthly spending trends
   - Budget utilization rates
   - Interactive charts and graphs

4. **Risk & Anomalies**
   - Detect budget leakages
   - Identify unusual spending patterns
   - Flag suspicious transactions
   - Track anomaly status (flagged, investigating, resolved)
   - Detailed analysis and recommendations

5. **Predictive Modeling**
   - 3-year budget forecasts
   - Risk assessment for each state
   - Lapse risk prediction
   - Underutilization forecasting
   - Actionable recommendations

### Employee Dashboard (State/Ministry)

1. **Dashboard (Home)**
   - Department-specific overview
   - Status of key setup
   - Quick access to features
   - Onboarding instructions

2. **Key Generation**
   - Download RSA key generation script
   - Step-by-step guide
   - Public key upload
   - Verification and completion

3. **Budget Analytics**
   - Same views as admin but filtered for their department
   - Department budget tracking
   - Spending analysis

4. **Risk & Anomalies**
   - Monitor anomalies in their budget
   - Report suspicious transactions
   - View detailed analysis

5. **Predictive Modeling**
   - See forecasts for their department
   - Risk assessment specific to their operations

## Usage Scenarios

### Scenario 1: Inviting a State Official

1. Admin login to the platform
2. Navigate to "Key Management"
3. Enter the official's email and select "State Government"
4. Click "Send Invitation"
5. The system generates a temporary password and invitation link
6. Email (mock) is sent with credentials
7. Official receives the link and can login

### Scenario 2: Employee Setting Up Keys

1. Employee receives invitation email
2. Clicks the link in the email
3. Logs in with temporary password
4. Navigates to "Key Generation"
5. Downloads the key-generation.sh script
6. Runs the script locally to generate RSA keys
7. Copies public key and uploads it to the platform
8. Now has full access to all features

### Scenario 3: Detecting Budget Anomalies

1. Admin views "Risk & Anomalies" page
2. Sees real-time anomaly detection
3. Can filter by severity level
4. Can click on anomaly for details
5. Can mark as "Investigating" or "Resolved"
6. Gets actionable recommendations

### Scenario 4: Forecasting Next Year's Budget

1. Admin navigates to "Predictive Modeling"
2. Selects "Budget Forecast" model
3. Views 3-year projection by state
4. Gets insights on growth trends
5. Sees recommendations for allocation

## Key Features Implemented

### ✅ Authentication & Authorization
- Role-based access control (Admin/Employee)
- Login/Signup functionality
- Session management with localStorage
- Protected routes
- OAuth integration points ready

### ✅ User Management
- Admin can invite officials
- Temporary password generation
- Public key management
- User status tracking

### ✅ Budget Analytics
- State-wise tracking
- Ministry-wise tracking
- Monthly trends
- Budget utilization charts
- Interactive visualizations with Recharts

### ✅ Anomaly Detection
- Real-time anomaly flagging
- Severity levels (critical/high/medium/low)
- Status tracking (flagged/investigating/resolved)
- Detailed analysis and recommendations

### ✅ Predictive Modeling
- AI-based forecasting
- 3-year budget predictions
- Lapse risk assessment
- Underutilization forecasting
- Actionable insights

### ✅ UI/UX Features
- Responsive design (mobile, tablet, desktop)
- Dark sidebar navigation
- Glassmorphism cards
- Smooth animations
- Toast notifications (Sonner)
- Enter key support on forms
- Loading states
- Error handling

### ✅ Design System
- Custom Tailwind configuration
- Semantic colors (Primary, Neutral, Accents)
- Typography: Calistoga + Inter
- Consistent spacing and shadows
- Hover effects and transitions
- Premium animations

## Mock Data

The application uses mock data for all features:

- **Budget Data**: 10 states, 8 ministries, realistic allocation vs spending
- **Anomalies**: 4 sample anomalies with different severity levels
- **Employees**: 3 sample employees in different states/ministries
- **Transactions**: Monthly spending trends across FY 2023-24
- **Predictions**: 3-year forecasts based on historical patterns
- **Risk Forecast**: Lapse risk predictions for each state

All data is stored in `src/utils/mockData.js` and can be easily replaced with real API calls.

## Backend Integration Points

To integrate with a real backend, update these files:

### 1. Authentication
- **File**: `src/context/AuthContext.jsx`
- **Replace**: Login/logout functions with API calls
- **Endpoints**: `/api/auth/login`, `/api/auth/logout`

### 2. Key Management
- **File**: `src/pages/admin/KeyManagement.jsx`
- **Replace**: Invitation sending with API calls
- **Endpoints**: `/api/invitations/send`, `/api/invitations/list`

### 3. Budget Analytics
- **File**: `src/pages/admin/BudgetAnalytics.jsx`
- **Replace**: Mock data with API calls
- **Endpoints**: `/api/budget/statewise`, `/api/budget/ministrywise`, `/api/budget/trends`

### 4. Anomalies
- **File**: `src/pages/admin/RiskAnomalies.jsx`
- **Replace**: Mock anomalies with real detection
- **Endpoints**: `/api/anomalies/detect`, `/api/anomalies/list`, `/api/anomalies/update`

### 5. Predictions
- **File**: `src/pages/admin/PredictiveModeling.jsx`
- **Replace**: Mock models with ML endpoints
- **Endpoints**: `/api/predictions/budget`, `/api/predictions/risk`

## Customization

### Change Primary Colors
Edit `tailwind.config.js`:
```js
primary: {
  900: '#YOUR_COLOR', // Main brand color
  // ... other shades
}
```

### Modify Mock Data
Edit `src/utils/mockData.js` to change:
- States and ministries
- Budget allocations
- Anomalies
- Predictions

### Add New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation link in `src/components/Navigation.jsx`

### Customize Styling
- Global styles: `src/index.css`
- Component styles: Inline Tailwind classes
- Theme: `tailwind.config.js`

## Troubleshooting

### Port Already in Use
If port 5173 is already in use:
```bash
# Vite will automatically try the next available port
npm run dev
```

### Dependencies Installation Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Hot Module Replacement (HMR) Not Working
```bash
# Restart the dev server
npm run dev
```

### Build Errors
```bash
# Clear dist folder and rebuild
rm -rf dist
npm run build
```

## Deployment

### Deploy to Vercel
```bash
# Connect your GitHub repository
# Push code to GitHub
git push origin main

# Vercel will auto-detect Vite and deploy
```

### Deploy to Other Platforms
1. Run `npm run build`
2. Upload `dist` folder to your hosting
3. Configure server to serve `index.html` for all routes

### Environment Variables
Create `.env.local`:
```
VITE_API_URL=https://api.example.com
VITE_OAUTH_CLIENT_ID=your_client_id
```

Access in code:
```js
console.log(import.meta.env.VITE_API_URL)
```

## Performance Optimization

The application already includes:
- ✅ Code splitting with React Router
- ✅ Lazy component loading
- ✅ Optimized re-renders with useCallback
- ✅ Efficient state management
- ✅ Minified production builds
- ✅ CSS optimization with Tailwind

For further optimization:
1. Add image optimization with Sharp
2. Implement API response caching
3. Use virtualization for large lists
4. Add service workers for offline support

## Security Considerations

### Current Demonstration
- Mock OAuth implementation
- localStorage for session (development only)
- No real encryption

### Production Requirements
1. Implement real OAuth with secure tokens
2. Use HTTP-only cookies for sessions
3. Implement proper encryption for sensitive data
4. Add CORS and security headers
5. Validate all user inputs
6. Implement rate limiting
7. Add audit logging
8. Use HTTPS only

## Support & Documentation

- **Vite**: https://vitejs.dev
- **React**: https://react.dev
- **React Router**: https://reactrouter.com
- **Tailwind CSS**: https://tailwindcss.com
- **Recharts**: https://recharts.org
- **Sonner**: https://sonner.emilkowal.ski
- **Lucide Icons**: https://lucide.dev

## License

This project is built for demonstration purposes as part of the "Smart Governance & Public Platforms" track.

---

**Last Updated**: March 2024
**Version**: 1.0.0
**Status**: Production Ready (With Mock Data)
