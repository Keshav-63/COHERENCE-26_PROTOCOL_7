/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

// API Base URLs - easily configurable per environment
export const API_CONFIG = {
  // Base URL for the API - change this based on environment
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',

  // API version
  API_VERSION: 'v1',

  // Timeout settings
  TIMEOUT: 30000, // 30 seconds

  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
}

// Construct full API URL
export const getApiUrl = (path = '') => {
  const baseUrl = API_CONFIG.BASE_URL
  const version = API_CONFIG.API_VERSION

  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  return `${baseUrl}/api/${version}/${cleanPath}`
}

// API Endpoints
export const ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    REGISTER: 'auth/register',
    LOGIN: 'auth/login',
    REFRESH: 'auth/refresh',
    ME: 'auth/me',
    LOGOUT: 'auth/logout',
  },

  // Admin authentication endpoints
  ADMIN: {
    LOGIN: 'security/admin/login',
    UPLOAD_PUBLIC_KEY: 'security/admin/upload-public-key',
    PROFILE: 'security/admin/profile',
    TEST_SIGNATURE: 'security/admin/test-signature',
  },

  // Central admin invitation endpoints
  CENTRAL: {
    INVITATIONS: {
      CREATE: 'security/central/invitations/',
      LIST: 'security/central/invitations/',
      STATS: 'security/central/invitations/stats',
      DETAILS: (id) => `security/central/invitations/${id}`,
      REVOKE: (id) => `security/central/invitations/${id}/revoke`,
      CLEANUP: 'security/central/invitations/cleanup-expired',
    },
  },

  // PRAHARI Intelligence endpoints
  INTELLIGENCE: {
    AUDIT: 'intelligence/audit',
    ANOMALIES: 'intelligence/anomalies',
    PHANTOM_UTILIZATION: (entityCode) => `intelligence/phantom-utilization/${entityCode}`,
    MARCH_RUSH: 'intelligence/march-rush',
    VENDOR_INTELLIGENCE: 'intelligence/vendor-intelligence',
    REALLOCATION_ENGINE: 'intelligence/reallocation-engine',
    DASHBOARD: 'intelligence/dashboard',
    LEAKAGE_RISKS: 'intelligence/leakage-risks',
    FISCAL_FLOW_GRAPH: 'intelligence/fiscal-flow-graph',
  },

  // Health check
  HEALTH: 'health',
  ROOT: '',
}

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
}

// Token storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  ADMIN: 'admin',
  PUBLIC_KEY: 'public_key',
  INVITATION_HASH: 'invitation_hash',
}
