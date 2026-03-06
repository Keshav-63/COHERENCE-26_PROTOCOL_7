/**
 * Authentication Service
 * Handles user authentication API calls
 */

import apiClient from './api.client'
import { ENDPOINTS } from '../config/api.config'
import { setTokens, clearTokens, setStoredUser } from '../utils/tokenManager'

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password (min 8 characters)
 * @param {string} [userData.full_name] - User full name (optional)
 * @returns {Promise<Object>} Response with tokens and user data
 */
export const register = async (userData) => {
  try {
    const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData)
    const { access_token, refresh_token, user } = response.data

    // Store tokens and user data
    setTokens({ access_token, refresh_token })
    setStoredUser(user)

    return response.data
  } catch (error) {
    throw handleAuthError(error)
  }
}

/**
 * Login user with email and password
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} Response with tokens and user data
 */
export const login = async (credentials) => {
  try {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials)
    const { access_token, refresh_token, user } = response.data

    // Store tokens and user data
    setTokens({ access_token, refresh_token })
    setStoredUser(user)

    return response.data
  } catch (error) {
    throw handleAuthError(error)
  }
}

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} Response with new access token
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await apiClient.post(ENDPOINTS.AUTH.REFRESH, {
      refresh_token: refreshToken,
    })

    const { access_token } = response.data
    setTokens({ access_token, refresh_token: refreshToken })

    return response.data
  } catch (error) {
    clearTokens()
    throw handleAuthError(error)
  }
}

/**
 * Get current authenticated user info
 * @returns {Promise<Object>} Current user data
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.AUTH.ME)
    const user = response.data

    // Update stored user data
    setStoredUser(user)

    return user
  } catch (error) {
    throw handleAuthError(error)
  }
}

/**
 * Logout current user
 * @returns {Promise<Object>} Logout confirmation
 */
export const logout = async () => {
  try {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGOUT)

    // Clear tokens and user data
    clearTokens()

    return response.data
  } catch (error) {
    // Clear tokens even if API call fails
    clearTokens()
    throw handleAuthError(error)
  }
}

/**
 * Handle authentication errors
 * @param {Error} error - Error object
 * @returns {Error} Formatted error
 */
const handleAuthError = (error) => {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response

    switch (status) {
      case 400:
        return new Error(data.detail || 'Invalid request')
      case 401:
        return new Error('Invalid credentials')
      case 422:
        // Validation error
        if (data.detail && Array.isArray(data.detail)) {
          const messages = data.detail.map((err) => err.msg).join(', ')
          return new Error(messages)
        }
        return new Error(data.detail || 'Validation error')
      case 500:
        return new Error('Server error. Please try again later.')
      default:
        return new Error(data.detail || 'Authentication failed')
    }
  } else if (error.request) {
    // Request made but no response
    return new Error('Network error. Please check your connection.')
  } else {
    // Something else happened
    return new Error(error.message || 'An unexpected error occurred')
  }
}
