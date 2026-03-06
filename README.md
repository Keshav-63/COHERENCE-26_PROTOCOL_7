# National Budget Intelligence Platform

A cutting-edge financial intelligence platform for tracking public fund flows, detecting budget anomalies, and optimizing budget allocation across administrative levels.

## 🚀 Features

### Core Capabilities
- **Real-time Budget Tracking**: Monitor allocation vs spending across states and ministries
- **Anomaly Detection**: AI-powered leakage and inefficiency detection
- **Predictive Analytics**: 3-year budget forecasts with risk assessment
- **Role-Based Access**: Separate dashboards for central government and state/ministry officials
- **Interactive Visualizations**: Charts, graphs, and data-driven insights
- **Key Management**: Secure invitation system with RSA encryption

### Admin Dashboard (Central Government)
- 📊 Budget allocation analytics
- 🔍 Anomaly detection and monitoring
- 📈 Predictive modeling and forecasting
- 👥 Official management and invitations
- 📋 Comprehensive reporting

### Employee Dashboard (State/Ministry)
- 🔐 Key generation and management
- 📊 Department-specific analytics
- 🚨 Anomaly monitoring and reporting
- 📈 Risk forecasting
- 📊 Budget performance tracking

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom design system
- **Charts & Visualization**: Recharts
- **Notifications**: Sonner (Toast)
- **Icons**: Lucide React
- **Routing**: React Router v6
- **State Management**: React Context + localStorage
- **Package Manager**: npm/pnpm/yarn

## 📋 Prerequisites

- Node.js 16 or higher
- npm, pnpm, or yarn

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
# or
yarn install
```

### 2. Start Development Server
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Application will open at `http://localhost:5173`

### 3. Build for Production
```bash
npm run build
# or
pnpm build
# or
yarn build
```

## 🔐 Login Credentials

### Admin (Central Government)
- **Role**: Admin
- **Email**: admin@government.in
- **Password**: password123

### Employee (State/Ministry)
- **Role**: Employee
- **Email**: employee@state.gov.in
- **Password**: password123
- **Public Key**: (any text for demo)

## 📁 Project Structure

```
src/
├── main.jsx                 # Entry point
├── App.jsx                  # Routes configuration
├── index.css               # Global styles
├── context/
│   └── AuthContext.jsx     # Auth state management
├── components/             # Reusable components
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── Input.jsx
│   ├── Badge.jsx
│   ├── Modal.jsx
│   └── Navigation.jsx
├── pages/
│   ├── auth/
│   │   └── Login.jsx
│   ├── admin/              # Admin pages
│   │   ├── AdminHome.jsx
│   │   ├── KeyManagement.jsx
│   │   ├── BudgetAnalytics.jsx
│   │   ├── RiskAnomalies.jsx
│   │   └── PredictiveModeling.jsx
│   └── employee/           # Employee pages
│       ├── EmployeeHome.jsx
│       ├── KeyGeneration.jsx
│       └── [shared analytics pages]
└── utils/
    ├── mockData.js         # Mock data for development
    └── utils.js            # Helper functions
```

## 🎨 Design System

### Colors
- **Primary**: Electric Blue (#0052FF → #4D7CFF)
- **Neutral**: Grays for backgrounds
- **Accents**: Cyan, Emerald, Orange, Red

### Typography
- **Display**: Calistoga (headings)
- **Body**: Inter (content)

### Components
- Glassmorphism cards
- Smooth animations
- Responsive grid layouts
- Premium shadows and effects

## 🔄 Features Overview

### Dashboard Analytics
- Real-time budget allocation tracking
- State-wise and ministry-wise distribution
- Monthly spending trends
- Budget utilization rates

### Anomaly Detection
- Unusual spending patterns
- Fund leakage identification
- Transaction flags with severity levels
- Investigation workflow

### Predictive Modeling
- AI-powered budget forecasting
- Lapse risk assessment
- Underutilization predictions
- Actionable recommendations

### Key Management
- Secure official invitations
- Temporary password generation
- Public key management
- Status tracking

## 🔌 Backend Integration

The app is ready to integrate with a backend. Key integration points:

1. **Authentication**: `/api/auth/login`, `/api/auth/logout`
2. **Budget Data**: `/api/budget/statewise`, `/api/budget/ministrywise`
3. **Anomalies**: `/api/anomalies/detect`, `/api/anomalies/list`
4. **Invitations**: `/api/invitations/send`, `/api/invitations/list`
5. **Predictions**: `/api/predictions/budget`, `/api/predictions/risk`

Replace mock data in `src/utils/mockData.js` with API calls.

## 🌐 Responsive Design

- **Mobile**: Optimized for small screens
- **Tablet**: Enhanced layout for medium screens
- **Desktop**: Full-featured desktop experience
- **Dark Sidebar**: Fixed navigation on larger screens
- **Mobile Menu**: Hamburger menu on smaller screens

## ⌨️ Keyboard Support

- **Enter** on forms to submit
- **Ctrl+Enter** to submit in textareas
- **Tab** for navigation
- **Escape** to close modals

## 📱 Features

### User Experience
- ✅ Toast notifications instead of alerts
- ✅ Smooth animations and transitions
- ✅ Loading states on buttons
- ✅ Error handling and validation
- ✅ Enter key support on all forms
- ✅ Responsive design

### Admin Features
- ✅ Invite officials via email
- ✅ Generate temporary passwords
- ✅ Track invitation status
- ✅ View all analytics
- ✅ Manage anomalies
- ✅ Access predictions

### Employee Features
- ✅ Generate RSA keys
- ✅ Upload public key
- ✅ View department analytics
- ✅ Monitor anomalies
- ✅ Access forecasts
- ✅ Generate reports

## 🔒 Security (Development)

Current implementation uses:
- localStorage for sessions (development)
- Mock OAuth structure
- Client-side validation

**For Production**, implement:
- HTTP-only cookies
- Real OAuth 2.0
- Server-side validation
- Encryption for sensitive data
- HTTPS only
- CORS properly configured

## 📊 Mock Data

The application includes comprehensive mock data:
- 10 states with realistic budgets
- 8 ministries with allocations
- Monthly spending trends
- Anomaly detection samples
- 3-year forecasts
- Risk assessments

All located in `src/utils/mockData.js`

## 🚀 Deployment

### Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Vercel auto-detects Vite
4. Deploy with one click

### Other Platforms
1. Run `npm run build`
2. Upload `dist` folder
3. Configure server for SPA routing

## 📚 Documentation

- See `EXECUTION_GUIDE.md` for detailed setup and customization
- Check component files for prop documentation
- Refer to Tailwind docs: https://tailwindcss.com
- Recharts docs: https://recharts.org

## 🐛 Troubleshooting

### Port Already in Use
Vite will automatically try the next available port.

### Dependencies Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### Hot Module Replacement Issues
Restart the dev server with `npm run dev`

## 📝 License

Built for demonstration purposes as part of the Smart Governance & Public Platforms initiative.

## 🤝 Support

For issues, refer to:
- Vite: https://vitejs.dev
- React: https://react.dev
- Tailwind: https://tailwindcss.com

---

**Version**: 1.0.0  
**Status**: Production Ready (With Mock Data)  
**Last Updated**: March 2024
