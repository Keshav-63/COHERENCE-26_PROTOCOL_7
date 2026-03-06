/**
 * Token Manager
 * Handles token storage, retrieval, and management
 */

import { STORAGE_KEYS } from '../config/api.config'

/**
 * Get access token from storage
 */
export const getAccessToken = () => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
}

/**
 * Get refresh token from storage
 */
export const getRefreshToken = () => {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
}

/**
 * Set tokens in storage
 */
export const setTokens = ({ access_token, refresh_token }) => {
  if (access_token) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token)
  }
  if (refresh_token) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token)
  }
}

/**
 * Clear all tokens from storage
 */
export const clearTokens = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
  localStorage.removeItem(STORAGE_KEYS.ADMIN)
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAccessToken()
}

/**
 * Get stored user data
 */
export const getStoredUser = () => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER)
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('Failed to parse user data:', error)
    return null
  }
}

/**
 * Set user data in storage
 */
export const setStoredUser = (userData) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
}

/**
 * Get stored admin data
 */
export const getStoredAdmin = () => {
  try {
    const adminData = localStorage.getItem(STORAGE_KEYS.ADMIN)
    return adminData ? JSON.parse(adminData) : null
  } catch (error) {
    console.error('Failed to parse admin data:', error)
    return null
  }
}

/**
 * Set admin data in storage
 */
export const setStoredAdmin = (adminData) => {
  localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(adminData))
}

/**
 * Clear admin data from storage
 */
export const clearAdminData = () => {
  localStorage.removeItem(STORAGE_KEYS.ADMIN)
  localStorage.removeItem(STORAGE_KEYS.PUBLIC_KEY)
  localStorage.removeItem(STORAGE_KEYS.INVITATION_HASH)
}
