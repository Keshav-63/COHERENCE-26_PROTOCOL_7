import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Users, Building2 } from 'lucide-react'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Card from '../../components/Card'
import { useAuth } from '../../context/AuthContext'
import { showSuccess, showError, validateEmail } from '../../utils/utils'

const Login = () => {
  const [role, setRole] = useState('admin') // admin or employee
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleRoleChange = (newRole) => {
    setRole(newRole)
    setErrors({})
  }

  const validateForm = () => {
    const newErrors = {}
    if (!email || !validateEmail(email)) newErrors.email = 'Valid email is required'
    if (!password || password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (role === 'employee' && !publicKey) newErrors.publicKey = 'Public key is required for employees'
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
    // Simulate API call
    setTimeout(() => {
      try {
        const userData = {
          id: `USER_${Date.now()}`,
          email,
          role,
          name: email.split('@')[0],
          department: role === 'admin' ? 'Central Government' : 'State/Ministry',
          loginTime: new Date(),
          publicKey: role === 'employee' ? publicKey : null,
        }
        login(userData)
        showSuccess(`Welcome ${userData.email}!`)
        navigate(role === 'admin' ? '/admin/dashboard' : '/employee/dashboard')
      } catch (error) {
        showError('Login failed. Please try again.')
      } finally {
        setLoading(false)
      }
    }, 800)
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
            <Building2 size={32} className="text-primary-900" />
          </div>
          <h1 className="text-4xl font-bold font-display text-neutral-900 mb-2">
            <span className="gradient-text">Budget Intelligence</span>
          </h1>
          <p className="text-neutral-600">Track and optimize public fund flow</p>
        </div>

        {/* Role Selection */}
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
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={Lock}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors({ ...errors, password: '' })
              }}
              onKeyPress={handleKeyPress}
              error={errors.password}
            />

            {role === 'employee' && (
              <Input
                label="Public Key"
                type="text"
                placeholder="Paste your public key"
                value={publicKey}
                onChange={(e) => {
                  setPublicKey(e.target.value)
                  if (errors.publicKey) setErrors({ ...errors, publicKey: '' })
                }}
                error={errors.publicKey}
              />
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              onKeyPress={handleKeyPress}
            >
              Sign In
            </Button>
          </form>

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
        </Card>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-neutral-600">
          <p>
            {role === 'admin'
              ? 'Central Government official portal'
              : 'State/Ministry employee portal'}
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            {role === 'employee' && 'You need an invitation link to access this portal'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
