import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, Users, Building2, Key } from 'lucide-react'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Card from '../../components/Card'
import { useAuth } from '../../context/AuthContext'
import { showSuccess, showError, validateEmail } from '../../utils/utils'

const Login = () => {
  const [searchParams] = useSearchParams()
  const invitationHash = searchParams.get('hash') // Get hash from URL

  const [role, setRole] = useState('admin') // admin or employee
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [pendingNavigation, setPendingNavigation] = useState(null)
  const navigate = useNavigate()
  const { login, adminLogin, admin, isAuthenticated } = useAuth()

  // Check if this is an invitation login
  const isInvitationLogin = !!invitationHash

  // Navigate after state updates
  useEffect(() => {
    if (pendingNavigation && isAuthenticated && admin?.role) {
      console.log('🚀 State updated! Navigating now...')
      console.log('📊 Final admin state:', admin)
      console.log('📊 Final isAuthenticated:', isAuthenticated)
      navigate(pendingNavigation)
      setPendingNavigation(null)
    }
  }, [isAuthenticated, admin, pendingNavigation, navigate])

  useEffect(() => {
    if (isInvitationLogin) {
      console.log('✅ Invitation login detected!')
      console.log('📧 Invitation Hash:', invitationHash)
      console.log('🔗 Full URL:', window.location.href)
    }
  }, [isInvitationLogin, invitationHash])

  const handleRoleChange = (newRole) => {
    setRole(newRole)
    setErrors({})
  }

  const validateForm = () => {
    const newErrors = {}
    if (!email || !validateEmail(email)) newErrors.email = 'Valid email is required'

    if (isInvitationLogin) {
      // For invitation login, check password length (it's a temporary password)
      if (!password || password.length < 8) newErrors.password = 'Temporary password must be at least 8 characters'
    } else {
      // For regular login
      if (!password || password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      showError('Please fix the errors in the form')
      return
    }

    setLoading(true)

    try {
      if (isInvitationLogin) {
        // Admin invitation login (different endpoint)
        console.log('🔐 Using admin invitation login endpoint')
        console.log('📤 Sending request to: POST /api/v1/security/admin/login')
        console.log('📋 Request payload:', {
          email,
          temporary_password: password.substring(0, 3) + '***',
          invitation_hash: invitationHash
        })

        const response = await adminLogin({
          email,
          temporary_password: password,
          invitation_hash: invitationHash
        })

        console.log('✅ Admin login successful!')
        console.log('📊 Response:', {
          tenant_code: response.tenant_code,
          tenant_name: response.tenant_name,
          tenant_type: response.tenant_type,
          requires_public_key: response.requires_public_key,
          role: response.role
        })

        showSuccess(`Welcome ${email}!`)

        // Determine navigation path
        const dashboardPath = response.requires_public_key
          ? '/admin/upload-key'
          : (response.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard')

        console.log(`🎯 Setting pending navigation to: ${dashboardPath}`)
        console.log(`📍 Response role: ${response.role}`)
        console.log(`⏳ Waiting for state to update... (useEffect will navigate)`)

        // Set pending navigation - useEffect will handle actual navigation
        setPendingNavigation(dashboardPath)
      } else if (role === 'employee') {
        // Employee/State Government login - use admin endpoint
        console.log('🔐 Using admin login endpoint for employee/state government')
        console.log('📤 Sending request to: POST /api/v1/security/admin/login')
        console.log('📋 Request payload:', {
          email,
          temporary_password: password.substring(0, 3) + '***'
        })

        const response = await adminLogin({
          email,
          temporary_password: password
        })

        console.log('✅ Employee login successful!')
        console.log('📊 Response:', {
          tenant_code: response.tenant_code,
          tenant_name: response.tenant_name,
          tenant_type: response.tenant_type,
          requires_public_key: response.requires_public_key,
          role: response.role
        })

        // Verify localStorage
        console.log('🔍 Checking localStorage after login...')
        const storedAdmin = localStorage.getItem('admin')
        const storedAccessToken = localStorage.getItem('access_token')
        console.log('💾 Stored admin:', storedAdmin ? JSON.parse(storedAdmin) : 'NOT FOUND')
        console.log('🔑 Stored access_token:', storedAccessToken ? 'EXISTS' : 'NOT FOUND')

        showSuccess(`Welcome ${email}!`)

        // Determine navigation path
        const dashboardPath = response.requires_public_key
          ? '/admin/upload-key'
          : (response.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard')

        console.log(`🎯 Setting pending navigation to: ${dashboardPath}`)
        console.log(`📍 Response role: ${response.role}`)
        console.log(`📍 Requires public key: ${response.requires_public_key}`)
        console.log(`⏳ Waiting for state to update... (useEffect will navigate)`)

        // Set pending navigation - useEffect will handle actual navigation
        setPendingNavigation(dashboardPath)
      } else {
        // Central admin login - use regular login endpoint
        console.log('Using regular login endpoint for central admin')

        const response = await login({
          email,
          password,
        })

        console.log('Login successful:', response)

        showSuccess(`Welcome ${response.user?.email || email}!`)

        // Navigate based on the mapped role from backend
        const userRole = response.user?.role

        console.log('Navigating with role:', {
          frontendRole: userRole,
          backendRole: response.user?.backendRole
        })

        // Navigate based on the mapped frontend role
        if (userRole === 'admin') {
          navigate('/admin/dashboard')
        } else {
          navigate('/employee/dashboard')
        }
      }
    } catch (error) {
      showError(error.message || 'Login failed. Please try again.')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin(e)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-neutral-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-primary-900/10 rounded-2xl mb-4">
            {isInvitationLogin ? (
              <Key size={32} className="text-primary-900" />
            ) : (
              <Building2 size={32} className="text-primary-900" />
            )}
          </div>
          <h1 className="text-4xl font-bold font-display text-neutral-900 mb-2">
            <span className="gradient-text">
              {isInvitationLogin ? 'Admin Invitation' : 'Budget Intelligence'}
            </span>
          </h1>
          <p className="text-neutral-600">
            {isInvitationLogin
              ? 'Complete your admin account setup'
              : 'Track and optimize public fund flow'}
          </p>
          {isInvitationLogin && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                🔐 You're logging in with an invitation. Use your temporary password from the email.
              </p>
            </div>
          )}
        </div>

        {/* Role Selection - Hide for invitation login */}
        {!isInvitationLogin && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => handleRoleChange('admin')}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-300 ${
                role === 'admin'
                  ? 'border-primary-900 bg-primary-50 text-primary-900'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}
            >
              <Users size={20} />
              <span className="font-medium">Admin</span>
            </button>
            <button
              onClick={() => handleRoleChange('employee')}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-300 ${
                role === 'employee'
                  ? 'border-primary-900 bg-primary-50 text-primary-900'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}
            >
              <Building2 size={20} />
              <span className="font-medium">Employee</span>
            </button>
          </div>
        )}

        {/* Login Form */}
        <Card shadow="glass" className="space-y-5">
          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="your.email@government.in"
              icon={Mail}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors({ ...errors, email: '' })
              }}
              onKeyPress={handleKeyPress}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label={isInvitationLogin ? 'Temporary Password' : 'Password'}
              type="password"
              placeholder={isInvitationLogin ? 'Enter temporary password from email' : 'Enter your password'}
              icon={Lock}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors({ ...errors, password: '' })
              }}
              onKeyPress={handleKeyPress}
              error={errors.password}
              autoComplete={isInvitationLogin ? 'off' : 'current-password'}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              onKeyPress={handleKeyPress}
            >
              {isInvitationLogin ? 'Login with Invitation' : 'Sign In'}
            </Button>
          </form>

          {!isInvitationLogin && (
            <>
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-neutral-600">or</span>
                </div>
              </div>

              <Button variant="secondary" size="lg" className="w-full">
                Continue with OAuth
              </Button>
            </>
          )}
        </Card>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-neutral-600">
          {isInvitationLogin ? (
            <>
              <p className="font-medium">Admin Invitation Login</p>
              <p className="text-xs text-neutral-500 mt-2">
                Use the email and temporary password sent to your email address
              </p>
            </>
          ) : (
            <p>
              {role === 'admin'
                ? 'Central Government official portal'
                : 'State/Ministry employee portal'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
