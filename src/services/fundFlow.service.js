/**
 * Fund Flow Service
 * Handles all API calls for the fund flow knowledge graph system
 */

import apiClient from './api.client'

const FUND_FLOW_BASE = 'fund-flow'

/**
 * Get the complete fund flow knowledge graph
 * Returns all nodes and edges in D3/Cytoscape format
 */
export const getFullGraph = async () => {
  const response = await apiClient.get(`${FUND_FLOW_BASE}/graph`)
  return response.data
}

/**
 * Get ministry-centric subgraph
 * @param {string} ministryCode - Ministry code (e.g., 'MIN001')
 */
export const getMinistryGraph = async (ministryCode) => {
  const response = await apiClient.get(`${FUND_FLOW_BASE}/graph/ministry/${ministryCode}`)
  return response.data
}

/**
 * Get state-centric subgraph
 * @param {string} stateCode - State code (e.g., 'MH', 'DL')
 */
export const getStateGraph = async (stateCode) => {
  const response = await apiClient.get(`${FUND_FLOW_BASE}/graph/state/${stateCode}`)
  return response.data
}

/**
 * Get single node details with incoming and outgoing flows
 * @param {string} nodeId - Node ID
 */
export const getNodeDetails = async (nodeId) => {
  const response = await apiClient.get(`${FUND_FLOW_BASE}/node/${nodeId}`)
  return response.data
}

/**
 * Trace fund flow path from source to destination
 * @param {string} fromNode - Source node ID
 * @param {string} toNode - Destination node ID
 */
export const traceFundPath = async (fromNode, toNode) => {
  const response = await apiClient.get(`${FUND_FLOW_BASE}/trace`, {
    params: { from_node: fromNode, to_node: toNode }
  })
  return response.data
}

/**
 * Get bottlenecks - where money pools and stagnates
 */
export const getBottlenecks = async () => {
  const response = await apiClient.get(`${FUND_FLOW_BASE}/bottlenecks`)
  return response.data
}

/**
 * Get vendor trail - trace vendor payment to source ministry
 * @param {string} vendorId - Vendor ID
 */
export const getVendorTrail = async (vendorId) => {
  const response = await apiClient.get(`${FUND_FLOW_BASE}/vendor/${vendorId}/trail`)
  return response.data
}

/**
 * Get absorption efficiency leaderboard
 * Shows best and worst performing entities
 */
export const getAbsorptionLeaderboard = async () => {
  const response = await apiClient.get(`${FUND_FLOW_BASE}/absorption`)
  return response.data
}

/**
 * Get national summary with AI insights
 * Includes Gemini intelligence report
 */
export const getNationalSummary = async () => {
  const response = await apiClient.get(`${FUND_FLOW_BASE}/summary`)
  return response.data
}

/**
 * Force rebuild the fund flow graph from database
 */
export const rebuildGraph = async () => {
  const response = await apiClient.post(`${FUND_FLOW_BASE}/rebuild`)
  return response.data
}

const fundFlowService = {
  getFullGraph,
  getMinistryGraph,
  getStateGraph,
  getNodeDetails,
  traceFundPath,
  getBottlenecks,
  getVendorTrail,
  getAbsorptionLeaderboard,
  getNationalSummary,
  rebuildGraph,
}

export default fundFlowService
