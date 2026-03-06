/**
 * API Error Handler
 * Centralized error handling for API calls
 */

import { HTTP_STATUS } from '../config/api.config'

/**
 * Format API error for display
 * @param {Error} error - Error object from API call
 * @returns {string} Formatted error message
 */
export const formatApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response

    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        return data.detail || 'Invalid request. Please check your input.'

      case HTTP_STATUS.UNAUTHORIZED:
        return 'Your session has expired. Please login again.'

      case HTTP_STATUS.FORBIDDEN:
        return 'You do not have permission to perform this action.'

      case HTTP_STATUS.NOT_FOUND:
        return 'The requested resource was not found.'

      case HTTP_STATUS.UNPROCESSABLE_ENTITY:
        // Validation errors
        if (data.detail && Array.isArray(data.detail)) {
          return formatValidationErrors(data.detail)
        }
        return data.detail || 'Validation error. Please check your input.'

      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return 'Server error. Please try again later.'

      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        return 'Service temporarily unavailable. Please try again later.'

      default:
        return data.detail || data.message || 'An error occurred. Please try again.'
    }
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Please check your internet connection.'
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred.'
  }
}

/**
 * Format validation errors from 422 responses
 * @param {Array} errors - Array of validation errors
 * @returns {string} Formatted error message
 */
export const formatValidationErrors = (errors) => {
  if (!Array.isArray(errors) || errors.length === 0) {
    return 'Validation error'
  }

  // If single error, return just the message
  if (errors.length === 1) {
    return errors[0].msg || 'Validation error'
  }

  // Multiple errors - format as list
  const messages = errors.map((err) => {
    const field = Array.isArray(err.loc) ? err.loc.join('.') : 'field'
    return `${field}: ${err.msg}`
  })

  return messages.join('\n')
}

/**
 * Check if error is network error
 * @param {Error} error - Error object
 * @returns {boolean} True if network error
 */
export const isNetworkError = (error) => {
  return !error.response && error.request
}

/**
 * Check if error is authentication error
 * @param {Error} error - Error object
 * @returns {boolean} True if auth error
 */
export const isAuthError = (error) => {
  return error.response?.status === HTTP_STATUS.UNAUTHORIZED
}

/**
 * Check if error is validation error
 * @param {Error} error - Error object
 * @returns {boolean} True if validation error
 */
export const isValidationError = (error) => {
  return error.response?.status === HTTP_STATUS.UNPROCESSABLE_ENTITY
}

/**
 * Extract field-specific errors from validation error
 * @param {Error} error - Error object
 * @returns {Object} Object with field names as keys and error messages as values
 */
export const extractFieldErrors = (error) => {
  if (!isValidationError(error)) {
    return {}
  }

  const { data } = error.response
  if (!data.detail || !Array.isArray(data.detail)) {
    return {}
  }

  const fieldErrors = {}
  data.detail.forEach((err) => {
    if (Array.isArray(err.loc) && err.loc.length > 0) {
      // Get the field name (last item in loc array)
      const fieldName = err.loc[err.loc.length - 1]
      fieldErrors[fieldName] = err.msg
    }
  })

  return fieldErrors
}

/**
 * Retry helper for API calls
 * @param {Function} apiCall - API call function
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise} Result of API call
 */
export const retryApiCall = async (apiCall, maxRetries = 3, delay = 1000) => {
  let lastError

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall()
    } catch (error) {
      lastError = error

      // Don't retry on client errors (4xx) except for timeout
      if (error.response && error.response.status < 500 && error.response.status !== 408) {
        throw error
      }

      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }

  throw lastError
}
