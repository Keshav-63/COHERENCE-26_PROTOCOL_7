/**
 * Admin Authentication Service
 * Handles admin authentication API calls
 */

import apiClient from './api.client'
import { ENDPOINTS, STORAGE_KEYS } from '../config/api.config'
import { setTokens, clearTokens, setStoredAdmin } from '../utils/tokenManager'

/**
 * Admin login (supports both invitation and regular login)
 * @param {Object} credentials - Admin login credentials
 * @param {string} credentials.email - Admin email
 * @param {string} [credentials.password] - Regular password
 * @param {string} [credentials.temporary_password] - Temporary password from invitation (min 8 chars)
 * @param {string} [credentials.invitation_hash] - Hash from invitation URL (optional)
 * @returns {Promise<Object>} Response with tokens and admin data
 */
export const adminLogin = async (credentials) => {
  try {
    const response = await apiClient.post(ENDPOINTS.ADMIN.LOGIN, credentials)
    const { access_token, refresh_token } = response.data

    // Store tokens
    setTokens({ access_token, refresh_token })

    // Store invitation hash for reference (if provided)
    if (credentials.invitation_hash) {
      localStorage.setItem(STORAGE_KEYS.INVITATION_HASH, credentials.invitation_hash)
    }

    // NOTE: Admin data with role will be stored by AuthContext after role mapping
    // Don't store admin data here to avoid storing incomplete data without role

    return response.data
  } catch (error) {
    throw handleAdminError(error)
  }
}

/**
 * Upload SSH public key for admin
 * @param {string} publicKey - SSH public key (RSA, Ed25519, etc.)
 * @returns {Promise<Object>} Response with fingerprint and upload confirmation
 */
export const uploadPublicKey = async (publicKey) => {
  try {
    const response = await apiClient.post(ENDPOINTS.ADMIN.UPLOAD_PUBLIC_KEY, {
      public_key: publicKey,
    })

    const { fingerprint, uploaded_at } = response.data

    // Update admin data to reflect public key uploaded
    const adminData = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN) || '{}')
    adminData.public_key_uploaded = true
    adminData.public_key_fingerprint = fingerprint
    adminData.public_key_uploaded_at = uploaded_at
    setStoredAdmin(adminData)

    // Store public key
    localStorage.setItem(STORAGE_KEYS.PUBLIC_KEY, publicKey)

    return response.data
  } catch (error) {
    throw handleAdminError(error)
  }
}

/**
 * Get admin profile information
 * @returns {Promise<Object>} Admin profile data
 */
export const getAdminProfile = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.ADMIN.PROFILE)
    const adminProfile = response.data

    // Update stored admin data
    setStoredAdmin(adminProfile)

    return adminProfile
  } catch (error) {
    throw handleAdminError(error)
  }
}

/**
 * Test signature verification
 * @param {Object} signatureData - Signature test data
 * @param {string} signatureData.message - Message that was signed
 * @param {string} signatureData.signature - Base64-encoded signature
 * @returns {Promise<Object>} Verification result
 */
export const testSignature = async (signatureData) => {
  try {
    const response = await apiClient.post(ENDPOINTS.ADMIN.TEST_SIGNATURE, signatureData)
    return response.data
  } catch (error) {
    throw handleAdminError(error)
  }
}

/**
 * Admin logout
 * @returns {Promise<void>}
 */
export const adminLogout = async () => {
  try {
    // Clear tokens and admin data
    clearTokens()
    localStorage.removeItem(STORAGE_KEYS.ADMIN)
    localStorage.removeItem(STORAGE_KEYS.PUBLIC_KEY)
    localStorage.removeItem(STORAGE_KEYS.INVITATION_HASH)
  } catch (error) {
    // Clear data even if there's an error
    clearTokens()
    localStorage.removeItem(STORAGE_KEYS.ADMIN)
    localStorage.removeItem(STORAGE_KEYS.PUBLIC_KEY)
    localStorage.removeItem(STORAGE_KEYS.INVITATION_HASH)
    throw handleAdminError(error)
  }
}

/**
 * Handle admin authentication errors
 * @param {Error} error - Error object
 * @returns {Error} Formatted error
 */
const handleAdminError = (error) => {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response

    switch (status) {
      case 400:
        return new Error(data.detail || 'Invalid request')
      case 401:
        return new Error('Invalid credentials or invitation expired')
      case 403:
        return new Error('Access forbidden')
      case 404:
        return new Error('Invitation not found')
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
        return new Error(data.detail || 'Admin authentication failed')
    }
  } else if (error.request) {
    // Request made but no response
    return new Error('Network error. Please check your connection.')
  } else {
    // Something else happened
    return new Error(error.message || 'An unexpected error occurred')
  }
}
