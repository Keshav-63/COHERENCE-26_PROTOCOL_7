/**
 * EdgeDetails Component
 * Shows detailed information about a fund flow edge
 */

import React from 'react'
import Card from '../Card'
import Badge from '../Badge'
import { X, ArrowRight } from 'lucide-react'

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

const getEfficiencyColor = (efficiency) => {
  if (efficiency >= 0.8) return 'text-green-600'
  if (efficiency >= 0.5) return 'text-yellow-600'
  return 'text-red-600'
}

const getEfficiencyBg = (efficiency) => {
  if (efficiency >= 0.8) return 'bg-green-100 border-green-300'
  if (efficiency >= 0.5) return 'bg-yellow-100 border-yellow-300'
  return 'bg-red-100 border-red-300'
}

const EdgeDetails = ({ edge, onClose }) => {
  if (!edge) return null

  const efficiency = edge.flow_efficiency || 0
  const flowRate = edge.actual_amount && edge.allocated_amount
    ? ((edge.actual_amount / edge.allocated_amount) * 100).toFixed(2)
    : 0

  return (
    <Card className="w-96">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900">
            Fund Flow Edge
          </h3>
          <p className="text-sm text-neutral-600">{edge.flow_type || 'Transfer'}</p>
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

      {/* Flow Path */}
      <div className="mb-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono font-semibold">{edge.source_code || edge.source}</span>
          <ArrowRight className="w-4 h-4 text-neutral-400" />
          <span className="font-mono font-semibold">{edge.target_code || edge.target}</span>
        </div>
        {edge.source_name && edge.target_name && (
          <div className="flex items-center gap-2 text-xs text-neutral-600 mt-1">
            <span>{edge.source_name}</span>
            <ArrowRight className="w-3 h-3" />
            <span>{edge.target_name}</span>
          </div>
        )}
      </div>

      {/* Flow Efficiency Badge */}
      <div className="mb-4">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getEfficiencyBg(efficiency)}`}>
          <span className="text-xs font-medium">Flow Efficiency</span>
          <span className={`text-sm font-bold ${getEfficiencyColor(efficiency)}`}>
            {(efficiency * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Financial Details */}
      <div className="border-t border-neutral-200 pt-4 mb-4">
        <h4 className="font-semibold text-sm mb-3">Financial Details</h4>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-neutral-500">Allocated Amount</label>
            <p className="text-xl font-semibold text-blue-600">
              {formatCurrency(edge.allocated_amount)}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-500">Actual Amount</label>
            <p className="text-xl font-semibold text-green-600">
              {formatCurrency(edge.actual_amount)}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-500">Flow Rate</label>
            <p className={`text-lg font-semibold ${
              flowRate >= 80 ? 'text-green-600' :
              flowRate >= 50 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {flowRate}%
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-500">Pending/Blocked</label>
            <p className="text-lg font-semibold text-orange-600">
              {formatCurrency((edge.allocated_amount || 0) - (edge.actual_amount || 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Metadata */}
      {edge.fiscal_year && (
        <div className="border-t border-neutral-200 pt-4">
          <h4 className="font-semibold text-sm mb-3">Metadata</h4>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">Fiscal Year</span>
              <span className="font-mono">{edge.fiscal_year}</span>
            </div>
            {edge.quarter && (
              <div className="flex justify-between">
                <span className="text-neutral-600">Quarter</span>
                <span className="font-mono">{edge.quarter}</span>
              </div>
            )}
            {edge.created_at && (
              <div className="flex justify-between">
                <span className="text-neutral-600">Created</span>
                <span className="text-xs">{new Date(edge.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Flow Status */}
      {edge.status && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">Status</span>
            <Badge className="bg-blue-100 text-blue-800 border-blue-300">
              {edge.status}
            </Badge>
          </div>
        </div>
      )}
    </Card>
  )
}

export default EdgeDetails
