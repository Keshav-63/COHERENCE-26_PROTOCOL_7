/**
 * Role Mapper Utility
 * Maps backend roles to frontend route roles
 */

/**
 * Backend role to frontend role mapping
 */
const ROLE_MAP = {
  // Backend roles -> Frontend roles
  central_admin: 'admin',
  central_government: 'admin',
  state_government: 'employee',
  state_admin: 'employee',
  minister: 'employee',
  department: 'employee',
  employee: 'employee',
  admin: 'admin',
}

/**
 * Map backend role to frontend role
 * @param {string} backendRole - Role from backend
 * @returns {string} Frontend role ('admin' or 'employee')
 */
export const mapBackendRoleToFrontend = (backendRole) => {
  if (!backendRole) {
    return 'employee' // Default to employee
  }

  const normalizedRole = backendRole.toLowerCase()
  return ROLE_MAP[normalizedRole] || 'employee'
}

/**
 * Check if user has admin access
 * @param {string} role - User role
 * @returns {boolean} True if user is admin
 */
export const isAdminRole = (role) => {
  const frontendRole = mapBackendRoleToFrontend(role)
  return frontendRole === 'admin'
}

/**
 * Check if user has employee access
 * @param {string} role - User role
 * @returns {boolean} True if user is employee
 */
export const isEmployeeRole = (role) => {
  const frontendRole = mapBackendRoleToFrontend(role)
  return frontendRole === 'employee'
}

/**
 * Get user display role name
 * @param {string} role - User role
 * @returns {string} Display name for role
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    central_admin: 'Central Government Admin',
    central_government: 'Central Government',
    state_government: 'State Government',
    state_admin: 'State Admin',
    minister: 'Minister',
    department: 'Department',
    employee: 'Employee',
    admin: 'Administrator',
  }

  return roleNames[role?.toLowerCase()] || 'User'
}
