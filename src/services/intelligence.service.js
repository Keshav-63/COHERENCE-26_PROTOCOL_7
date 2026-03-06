/**
 * PRAHARI Intelligence Service
 * Handles all intelligence and anomaly detection API calls
 */

import apiClient from './api.client'
import { ENDPOINTS } from '../config/api.config'

/**
 * Audit a live transaction through all 8 anomaly layers + Gemini AI
 * @param {Object} transactionData - Transaction data to audit
 * @returns {Promise<Object>} Audit results with anomaly flags and AI narrative
 */
export const auditTransaction = async (transactionData) => {
  try {
    const response = await apiClient.post(ENDPOINTS.INTELLIGENCE.AUDIT, transactionData)
    return response.data
  } catch (error) {
    throw handleIntelligenceError(error)
  }
}

/**
 * Get all detected anomalies (transactions + allocations)
 * @param {Object} params - Query parameters
 * @param {string} params.status_filter - Filter: FLAGGED or CRITICAL
 * @param {number} params.limit - Maximum results (default: 100, max: 500)
 * @returns {Promise<Object>} List of anomalies sorted by risk score
 */
export const getAnomalies = async (params = {}) => {
  try {
    const response = await apiClient.get(ENDPOINTS.INTELLIGENCE.ANOMALIES, { params })
    return response.data
  } catch (error) {
    throw handleIntelligenceError(error)
  }
}

/**
 * Detect phantom (paper) spending for a scheme or department
 * @param {string} entityCode - Scheme or department code
 * @param {string} fiscalYear - Fiscal year (optional)
 * @returns {Promise<Object>} Phantom utilization score and verdict
 */
export const getPhantomUtilization = async (entityCode, fiscalYear = null) => {
  try {
    const params = fiscalYear ? { fiscal_year: fiscalYear } : {}
    const response = await apiClient.get(
      ENDPOINTS.INTELLIGENCE.PHANTOM_UTILIZATION(entityCode),
      { params }
    )
    return response.data
  } catch (error) {
    throw handleIntelligenceError(error)
  }
}

/**
 * Detect departments at risk of March Rush panic spending
 * @param {Object} params - Query parameters
 * @param {string} params.fiscal_year - Fiscal year
 * @param {string} params.risk_tier - Filter: CRITICAL / HIGH / MEDIUM / LOW
 * @returns {Promise<Object>} Departments at risk with fund lapse predictions
 */
export const getMarchRushRisks = async (params = {}) => {
  try {
    const response = await apiClient.get(ENDPOINTS.INTELLIGENCE.MARCH_RUSH, { params })
    return response.data
  } catch (error) {
    throw handleIntelligenceError(error)
  }
}

/**
 * Vendor risk analysis with network cartel detection
 * @param {Object} params - Query parameters
 * @param {number} params.top_n - Top N vendors (default: 50, max: 200)
 * @param {string} params.risk_tier - Filter: RED / ORANGE / YELLOW / GREEN
 * @returns {Promise<Object>} Risk-ranked vendor list with AI explanations
 */
export const getVendorIntelligence = async (params = {}) => {
  try {
    const response = await apiClient.get(ENDPOINTS.INTELLIGENCE.VENDOR_INTELLIGENCE, { params })
    return response.data
  } catch (error) {
    throw handleIntelligenceError(error)
  }
}

/**
 * AI-optimized fund reallocation suggestions to prevent lapse
 * @param {Object} params - Query parameters
 * @param {string} params.fiscal_year - Fiscal year
 * @param {number} params.max_suggestions - Maximum suggestions (default: 10, max: 20)
 * @returns {Promise<Object>} Ranked reallocation proposals with impact estimates
 */
export const getReallocationSuggestions = async (params = {}) => {
  try {
    const response = await apiClient.get(ENDPOINTS.INTELLIGENCE.REALLOCATION_ENGINE, { params })
    return response.data
  } catch (error) {
    throw handleIntelligenceError(error)
  }
}

/**
 * Executive intelligence dashboard with Gemini AI briefing
 * @returns {Promise<Object>} Complete dashboard data with AI briefing
 */
export const getIntelligenceDashboard = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.INTELLIGENCE.DASHBOARD)
    return response.data
  } catch (error) {
    throw handleIntelligenceError(error)
  }
}

/**
 * Leakage risk heatmap across all ministries
 * @param {string} fiscalYear - Fiscal year (optional)
 * @returns {Promise<Object>} Ministry-level risk tiers
 */
export const getLeakageRisks = async (fiscalYear = null) => {
  try {
    const params = fiscalYear ? { fiscal_year: fiscalYear } : {}
    const response = await apiClient.get(ENDPOINTS.INTELLIGENCE.LEAKAGE_RISKS, { params })
    return response.data
  } catch (error) {
    throw handleIntelligenceError(error)
  }
}

/**
 * Fiscal Cascade Graph — follow the money from Centre to beneficiary
 * @param {Object} params - Query parameters
 * @param {string} params.ministry_code - Ministry code (optional)
 * @param {string} params.fiscal_year - Fiscal year (optional)
 * @returns {Promise<Object>} Graph nodes and edges for visualization
 */
export const getFiscalFlowGraph = async (params = {}) => {
  try {
    const response = await apiClient.get(ENDPOINTS.INTELLIGENCE.FISCAL_FLOW_GRAPH, { params })
    return response.data
  } catch (error) {
    throw handleIntelligenceError(error)
  }
}

/**
 * Handle intelligence API errors
 * @param {Error} error - Error object
 * @returns {Error} Formatted error
 */
const handleIntelligenceError = (error) => {
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
        return new Error(data.detail || 'Intelligence API request failed')
    }
  } else if (error.request) {
    return new Error('Network error. Please check your connection.')
  } else {
    return new Error(error.message || 'An unexpected error occurred')
  }
}
