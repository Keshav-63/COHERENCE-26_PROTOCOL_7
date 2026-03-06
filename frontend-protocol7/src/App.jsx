import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import Login from './pages/auth/Login'
import AdminHome from './pages/admin/AdminHome'
import KeyManagement from './pages/admin/KeyManagement'
import PublicKeyUpload from './pages/admin/PublicKeyUpload'
import BudgetAnalytics from './pages/admin/BudgetAnalytics'
import RiskAnomalies from './pages/admin/RiskAnomalies'
import PredictiveModeling from './pages/admin/PredictiveModeling'
import IntelligenceDashboard from './pages/admin/IntelligenceDashboard'
import EmployeeHome from './pages/employee/EmployeeHome'
import KeyGeneration from './pages/employee/KeyGeneration'

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, admin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('🚫 ProtectedRoute: Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // Check role if required
  if (requiredRole) {
    const currentUser = user || admin
    const userRole = currentUser?.role

    console.log('🔒 ProtectedRoute check:', {
      requiredRole,
      userRole,
      backendRole: currentUser?.backendRole,
      isAuthenticated,
      hasUser: !!user,
      hasAdmin: !!admin,
      currentUser: currentUser ? {
        email: currentUser.email,
        role: currentUser.role,
        tenant_type: currentUser.tenant_type
      } : null
    })

    // Check if role matches
    if (userRole !== requiredRole) {
      console.warn(`🚫 Access denied: required "${requiredRole}", user has "${userRole}"`)
      return <Navigate to="/login" replace />
    }

    console.log('✅ Access granted to protected route')
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<Login />} /> {/* Invitation login */}
      <Route path="/admin/upload-key" element={<PublicKeyUpload />} /> {/* Public key upload after invitation */}

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/key-management"
        element={
          <ProtectedRoute requiredRole="admin">
            <KeyManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/budget-analytics"
        element={
          <ProtectedRoute requiredRole="admin">
            <BudgetAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/risk-anomalies"
        element={
          <ProtectedRoute requiredRole="admin">
            <RiskAnomalies />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/predictive-modeling"
        element={
          <ProtectedRoute requiredRole="admin">
            <PredictiveModeling />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/intelligence"
        element={
          <ProtectedRoute requiredRole="admin">
            <IntelligenceDashboard />
          </ProtectedRoute>
        }
      />

      {/* Employee Routes */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute requiredRole="employee">
            <EmployeeHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/key-generation"
        element={
          <ProtectedRoute requiredRole="employee">
            <KeyGeneration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/budget-analytics"
        element={
          <ProtectedRoute requiredRole="employee">
            <BudgetAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/risk-anomalies"
        element={
          <ProtectedRoute requiredRole="employee">
            <RiskAnomalies />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/predictive-modeling"
        element={
          <ProtectedRoute requiredRole="employee">
            <PredictiveModeling />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/intelligence"
        element={
          <ProtectedRoute requiredRole="employee">
            <IntelligenceDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
