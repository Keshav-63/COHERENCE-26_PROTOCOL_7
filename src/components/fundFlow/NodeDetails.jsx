/**
 * NodeDetails Component
 * Shows detailed information about a fund flow node
 */

import React from 'react'
import Card from '../Card'
import Badge from '../Badge'
import { X } from 'lucide-react'

const formatCurrency = (amount) => {
  if (!amount) return '₹0'

  if (amount >= 1e9) {
    return `₹${(amount / 1e9).toFixed(2)}B`
  } else if (amount >= 1e7) {
    return `₹${(amount / 1e7).toFixed(2)}Cr`
  } else if (amount >= 1e5) {
    return `₹${(amount / 1e5).toFixed(2)}L`
  }
  return `₹${amount.toLocaleString('en-IN')}`
}

const getRiskBadgeColor = (risk) => {
  switch (risk) {
    case 'RED': return 'bg-red-100 text-red-800 border-red-300'
    case 'ORANGE': return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'YELLOW': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'GREEN': return 'bg-green-100 text-green-800 border-green-300'
    default: return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

const NodeDetails = ({ node, onClose }) => {
  if (!node) return null

  const absorptionRate = node.actual_amount && node.allocated_amount
    ? ((node.actual_amount / node.allocated_amount) * 100).toFixed(2)
    : 0

  return (
    <Card className="w-96 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900">
            {node.name || node.code}
          </h3>
          <p className="text-sm text-neutral-600">{node.node_type}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Risk Badge */}
      {node.risk_level && (
        <div className="mb-4">
          <Badge className={getRiskBadgeColor(node.risk_level)}>
            {node.risk_level} RISK
          </Badge>
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="text-xs font-medium text-neutral-500">Code</label>
          <p className="text-sm font-mono">{node.code}</p>
        </div>

        {node.description && (
          <div>
            <label className="text-xs font-medium text-neutral-500">Description</label>
            <p className="text-sm">{node.description}</p>
          </div>
        )}
      </div>

      {/* Financial Details */}
      <div className="border-t border-neutral-200 pt-4 mb-4">
        <h4 className="font-semibold text-sm mb-3">Financial Details</h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-neutral-500">Allocated</label>
            <p className="text-lg font-semibold text-blue-600">
              {formatCurrency(node.allocated_amount)}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-500">Actual</label>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(node.actual_amount)}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-500">Absorption Rate</label>
            <p className={`text-lg font-semibold ${
              absorptionRate >= 80 ? 'text-green-600' :
              absorptionRate >= 50 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {absorptionRate}%
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-500">Unspent</label>
            <p className="text-lg font-semibold text-orange-600">
              {formatCurrency((node.allocated_amount || 0) - (node.actual_amount || 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Flow Statistics */}
      {node.incoming_flows !== undefined && (
        <div className="border-t border-neutral-200 pt-4 mb-4">
          <h4 className="font-semibold text-sm mb-3">Flow Statistics</h4>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">Incoming Flows</span>
              <span className="text-sm font-semibold">{node.incoming_flows || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">Outgoing Flows</span>
              <span className="text-sm font-semibold">{node.outgoing_flows || 0}</span>
            </div>
            {node.flow_efficiency !== undefined && (
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">Flow Efficiency</span>
                <span className={`text-sm font-semibold ${
                  node.flow_efficiency >= 0.8 ? 'text-green-600' :
                  node.flow_efficiency >= 0.5 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {(node.flow_efficiency * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metadata */}
      {(node.state_code || node.ministry_code || node.scheme_code) && (
        <div className="border-t border-neutral-200 pt-4">
          <h4 className="font-semibold text-sm mb-3">Metadata</h4>

          <div className="space-y-2 text-sm">
            {node.ministry_code && (
              <div className="flex justify-between">
                <span className="text-neutral-600">Ministry</span>
                <span className="font-mono">{node.ministry_code}</span>
              </div>
            )}
            {node.scheme_code && (
              <div className="flex justify-between">
                <span className="text-neutral-600">Scheme</span>
                <span className="font-mono">{node.scheme_code}</span>
              </div>
            )}
            {node.state_code && (
              <div className="flex justify-between">
                <span className="text-neutral-600">State</span>
                <span className="font-mono">{node.state_code}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

export default NodeDetails
