/**
 * Central Admin Invitations Service
 * Handles invitation management API calls (for central government users)
 */

import apiClient from './api.client'
import { ENDPOINTS } from '../config/api.config'

/**
 * Create and send invitation to state/minister admin
 * @param {Object} invitationData - Invitation data
 * @param {string} invitationData.email - Invitee email
 * @param {string} invitationData.tenant_type - Type: 'state_government', 'minister', 'department'
 * @param {string} invitationData.tenant_name - Name of tenant (2-200 chars)
 * @param {string} invitationData.tenant_code - Unique tenant code (2-50 chars)
 * @param {string} [invitationData.description] - Optional description
 * @param {Object} [invitationData.metadata] - Optional metadata
 * @param {number} [invitationData.expires_in_days=7] - Expiry days (1-30)
 * @returns {Promise<Object>} Created invitation with dashboard URL and temp password
 */
export const createInvitation = async (invitationData) => {
  try {
    const response = await apiClient.post(ENDPOINTS.CENTRAL.INVITATIONS.CREATE, invitationData)
    return response.data
  } catch (error) {
    throw handleInvitationError(error)
  }
}

/**
 * List all invitations with optional filters
 * @param {Object} filters - Filter options
 * @param {string} [filters.status] - Filter by status: 'pending', 'accepted', 'expired', 'revoked'
 * @param {string} [filters.tenant_type] - Filter by tenant type
 * @param {number} [filters.skip=0] - Number of records to skip
 * @param {number} [filters.limit=100] - Max records to return (1-500)
 * @returns {Promise<Array>} List of invitations
 */
export const listInvitations = async (filters = {}) => {
  try {
    const params = {
      status_filter: filters.status,
      tenant_type: filters.tenant_type,
      skip: filters.skip || 0,
      limit: filters.limit || 100,
    }

    // Remove undefined params
    Object.keys(params).forEach((key) => params[key] === undefined && delete params[key])

    const response = await apiClient.get(ENDPOINTS.CENTRAL.INVITATIONS.LIST, { params })
    return response.data
  } catch (error) {
    throw handleInvitationError(error)
  }
}

/**
 * Get invitation statistics
 * @returns {Promise<Object>} Invitation stats
 */
export const getInvitationStats = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.CENTRAL.INVITATIONS.STATS)
    return response.data
  } catch (error) {
    throw handleInvitationError(error)
  }
}

/**
 * Get detailed information about a specific invitation
 * @param {string} invitationId - Invitation ID
 * @returns {Promise<Object>} Detailed invitation data
 */
export const getInvitationDetails = async (invitationId) => {
  try {
    const response = await apiClient.get(ENDPOINTS.CENTRAL.INVITATIONS.DETAILS(invitationId))
    return response.data
  } catch (error) {
    throw handleInvitationError(error)
  }
}

/**
 * Revoke an invitation
 * @param {string} invitationId - Invitation ID to revoke
 * @returns {Promise<Object>} Revoke confirmation
 */
export const revokeInvitation = async (invitationId) => {
  try {
    const response = await apiClient.post(ENDPOINTS.CENTRAL.INVITATIONS.REVOKE(invitationId))
    return response.data
  } catch (error) {
    throw handleInvitationError(error)
  }
}

/**
 * Cleanup expired invitations
 * @returns {Promise<Object>} Cleanup result with count of expired invitations
 */
export const cleanupExpiredInvitations = async () => {
  try {
    const response = await apiClient.post(ENDPOINTS.CENTRAL.INVITATIONS.CLEANUP)
    return response.data
  } catch (error) {
    throw handleInvitationError(error)
  }
}

/**
 * Handle invitation errors
 * @param {Error} error - Error object
 * @returns {Error} Formatted error
 */
const handleInvitationError = (error) => {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response

    switch (status) {
      case 400:
        return new Error(data.detail || 'Invalid request')
      case 401:
        return new Error('Unauthorized. Please login.')
      case 403:
        return new Error('Only central government users can manage invitations')
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
        return new Error(data.detail || 'Operation failed')
    }
  } else if (error.request) {
    // Request made but no response
    return new Error('Network error. Please check your connection.')
  } else {
    // Something else happened
    return new Error(error.message || 'An unexpected error occurred')
  }
}
