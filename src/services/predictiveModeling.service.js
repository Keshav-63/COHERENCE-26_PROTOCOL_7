/**
 * Predictive Modeling Service
 * Handles predictive analytics and forecasting API calls
 */

import apiClient from './api.client'
import { ENDPOINTS } from '../config/api.config'

/**
 * Get predictive models for all schemes
 * @returns {Promise<Array>} List of schemes with predictions
 */
export const getPredictiveModels = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.PREDICTIVE_MODELING.SCHEMES)
    return response.data
  } catch (error) {
    throw handlePredictiveModelingError(error)
  }
}

/**
 * Handle predictive modeling API errors
 * @param {Error} error - Error object
 * @returns {Error} Formatted error
 */
const handlePredictiveModelingError = (error) => {
  if (error.response) {
    const { status, data } = error.response

    switch (status) {
      case 400:
        return new Error(data.detail || 'Invalid request')
      case 401:
        return new Error('Unauthorized access')
      case 403:
        return new Error('Access forbidden')
      case 404:
        return new Error('Resource not found')
      case 422:
        if (data.detail && Array.isArray(data.detail)) {
          const messages = data.detail.map((err) => err.msg).join(', ')
          return new Error(messages)
        }
        return new Error(data.detail || 'Validation error')
      case 500:
        return new Error('Server error. Please try again later.')
      default:
        return new Error(data.detail || 'Predictive modeling API request failed')
    }
  } else if (error.request) {
    return new Error('Network error. Please check your connection.')
  } else {
    return new Error(error.message || 'An unexpected error occurred')
  }
}
