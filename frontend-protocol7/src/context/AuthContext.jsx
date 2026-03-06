import React, { createContext, useContext, useState, useEffect } from 'react'
import * as authService from '../services/auth.service'
import * as adminService from '../services/admin.service'
import { getStoredUser, getStoredAdmin, setStoredAdmin, isAuthenticated as checkAuth } from '../utils/tokenManager'
import { formatApiError } from '../utils/apiErrorHandler'
import { mapBackendRoleToFrontend } from '../utils/roleMapper'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Load user/admin from localStorage on mount
    const initAuth = async () => {
      console.log('🔄 AuthContext: Initializing auth...')
      console.log('🔍 Checking localStorage...')
      console.log('  - access_token:', localStorage.getItem('access_token') ? 'EXISTS' : 'MISSING')
      console.log('  - admin:', localStorage.getItem('admin') ? 'EXISTS' : 'MISSING')
      console.log('  - user:', localStorage.getItem('user') ? 'EXISTS' : 'MISSING')

      try {
        // Check if user is authenticated
        const hasToken = checkAuth()
        console.log('🔐 checkAuth() result:', hasToken)

        if (hasToken) {
          // Try to get current user from API
          const storedUser = getStoredUser()
          const storedAdmin = getStoredAdmin()

          console.log('📦 Retrieved from localStorage:')
          console.log('  - storedUser:', storedUser ? 'FOUND' : 'NULL')
          console.log('  - storedAdmin:', storedAdmin ? 'FOUND' : 'NULL')

          if (storedUser) {
            console.log('✅ Restoring USER from localStorage:', storedUser)
            setUser(storedUser)
            setIsAuthenticated(true)
            console.log('✅ User restored, isAuthenticated set to TRUE')
          } else if (storedAdmin) {
            console.log('✅ Restoring ADMIN from localStorage:', {
              email: storedAdmin.email,
              role: storedAdmin.role,
              backendRole: storedAdmin.backendRole,
              tenant_type: storedAdmin.tenant_type,
              tenant_code: storedAdmin.tenant_code
            })
            setAdmin(storedAdmin)
            setIsAuthenticated(true)
            console.log('✅ Admin restored, isAuthenticated set to TRUE')
          } else {
            console.warn('⚠️ Token exists but no user/admin data found in localStorage!')
          }
        } else {
          console.log('⚠️ No authentication token found')
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
      } finally {
        console.log('🏁 Auth initialization complete, setting loading to FALSE')
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Regular user login
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)

      // Map backend role to frontend role
      const userWithMappedRole = {
        ...response.user,
        backendRole: response.user.role, // Store original backend role
        role: mapBackendRoleToFrontend(response.user.role), // Map to frontend role
      }

      setUser(userWithMappedRole)
      setIsAuthenticated(true)

      return {
        ...response,
        user: userWithMappedRole,
      }
    } catch (error) {
      throw new Error(formatApiError(error))
    }
  }

  // Regular user registration
  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      setUser(response.user)
      setIsAuthenticated(true)
      return response
    } catch (error) {
      throw new Error(formatApiError(error))
    }
  }

  // Admin login
  const adminLogin = async (credentials) => {
    try {
      const response = await adminService.adminLogin(credentials)

      // Map tenant_type to frontend role
      const frontendRole = mapBackendRoleToFrontend(response.tenant_type)

      // Create complete admin object with role
      const adminData = {
        email: credentials.email,
        tenant_code: response.tenant_code,
        tenant_name: response.tenant_name,
        tenant_type: response.tenant_type,
        requires_public_key: response.requires_public_key,
        backendRole: response.tenant_type, // Store original backend role
        role: frontendRole, // Mapped frontend role (admin or employee)
      }

      // Set admin state
      setAdmin(adminData)
      setIsAuthenticated(true)

      // Store admin data in localStorage WITH role
      setStoredAdmin(adminData)

      console.log('✅ Admin data stored in localStorage with role:', frontendRole)
      console.log('💾 Stored admin data:', adminData)

      // Verify it was actually saved
      const verification = localStorage.getItem('admin')
      console.log('🔍 Verification - localStorage.admin:', verification ? JSON.parse(verification) : 'NOT FOUND')
      console.log('🔍 Verification - has role:', verification ? JSON.parse(verification).role : 'N/A')

      // Return response with mapped role
      return {
        ...response,
        role: frontendRole
      }
    } catch (error) {
      throw new Error(formatApiError(error))
    }
  }

  // Upload admin public key
  const uploadPublicKey = async (publicKey) => {
    try {
      const response = await adminService.uploadPublicKey(publicKey)
      // Update admin state to reflect public key uploaded
      setAdmin((prev) => ({
        ...prev,
        public_key_uploaded: true,
        public_key_fingerprint: response.fingerprint,
      }))
      return response
    } catch (error) {
      throw new Error(formatApiError(error))
    }
  }

  // Regular user logout
  const logout = async () => {
    try {
      console.log('🚪 Logging out user...')
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setAdmin(null)
      setIsAuthenticated(false)
      console.log('✅ User logged out successfully')
    }
  }

  // Admin logout
  const adminLogout = async () => {
    try {
      console.log('🚪 Logging out admin...')
      await adminService.adminLogout()
    } catch (error) {
      console.error('Admin logout error:', error)
    } finally {
      setUser(null)
      setAdmin(null)
      setIsAuthenticated(false)
      console.log('✅ Admin logged out successfully')
    }
  }

  // Update user profile
  const updateUserProfile = async (updates) => {
    // For now, just update local state
    // In production, you'd call an API endpoint to update profile
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    return updatedUser
  }

  // Get current user data
  const getCurrentUser = async () => {
    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
      return userData
    } catch (error) {
      throw new Error(formatApiError(error))
    }
  }

  // Get admin profile
  const getAdminProfile = async () => {
    try {
      const adminProfile = await adminService.getAdminProfile()
      setAdmin(adminProfile)
      return adminProfile
    } catch (error) {
      throw new Error(formatApiError(error))
    }
  }

  const value = {
    // State
    user,
    admin,
    loading,
    isAuthenticated,

    // User methods
    login,
    register,
    logout,
    updateUserProfile,
    getCurrentUser,

    // Admin methods
    adminLogin,
    adminLogout,
    uploadPublicKey,
    getAdminProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
