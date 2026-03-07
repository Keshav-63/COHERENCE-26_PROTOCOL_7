/**
 * BottleneckAnalysis Page
 * Identify where funds are pooling and stagnating
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../../components/Navigation'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import fundFlowService from '../../services/fundFlow.service'
import { ArrowLeft, AlertTriangle, TrendingDown, Clock, DollarSign } from 'lucide-react'

const formatCurrency = (amount) => {
  if (!amount) return '₹0'
  if (amount >= 1e9) return `₹${(amount / 1e9).toFixed(2)}B`
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(2)}Cr`
  return `₹${amount.toLocaleString('en-IN')}`
}

const getSeverityColor = (severity) => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300'
    case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-300'
    default: return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

const BottleneckAnalysis = () => {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [bottlenecks, setBottlenecks] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    loadBottlenecks()
  }, [])

  const loadBottlenecks = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fundFlowService.getBottlenecks()
      setBottlenecks(data.bottlenecks || data || [])
    } catch (err) {
      console.error('Error loading bottlenecks:', err)
      setError(err.message || 'Failed to load bottleneck analysis')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-600">Analyzing bottlenecks...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-neutral-50 p-8">
          <Card className="max-w-2xl mx-auto p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
            <p className="text-neutral-600 mb-4">{error}</p>
            <Button onClick={loadBottlenecks}>Retry</Button>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-neutral-50 p-8 md:ml-72">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={() => navigate('/admin/fund-flow')}
              className="mb-4 flex items-center gap-2"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>

            <div>
              <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
                Bottleneck Analysis
              </h1>
              <p className="text-neutral-600 mt-2">
                Identify entities where funds are pooling and not flowing efficiently
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-600">Total Bottlenecks</span>
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold">{bottlenecks.length}</p>
              <p className="text-xs text-neutral-500 mt-1">Nodes with stagnant funds</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-600">Total Stagnant</span>
                <DollarSign className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(
                  bottlenecks.reduce((sum, b) => sum + (b.stagnant_amount || 0), 0)
                )}
              </p>
              <p className="text-xs text-neutral-500 mt-1">Funds not flowing</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-600">Critical Issues</span>
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-red-600">
                {bottlenecks.filter(b => b.severity === 'CRITICAL').length}
              </p>
              <p className="text-xs text-neutral-500 mt-1">Require immediate action</p>
            </Card>
          </div>

          {/* Bottlenecks List */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Detected Bottlenecks</h2>

            {bottlenecks.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Bottlenecks Detected</h3>
                <p className="text-neutral-600">
                  All funds are flowing efficiently through the system
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bottlenecks.map((bottleneck, index) => (
                  <Card key={index} className="p-6 border-l-4 border-orange-500">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {bottleneck.node_name || bottleneck.node_code}
                          </h3>
                          {bottleneck.severity && (
                            <Badge className={getSeverityColor(bottleneck.severity)}>
                              {bottleneck.severity}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-neutral-600 font-mono">
                          {bottleneck.node_code}
                        </p>
                        {bottleneck.node_type && (
                          <p className="text-sm text-neutral-500 mt-1">
                            Type: {bottleneck.node_type}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="text-xs font-medium text-neutral-500">
                          Stagnant Amount
                        </label>
                        <p className="text-lg font-semibold text-red-600">
                          {formatCurrency(bottleneck.stagnant_amount)}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-neutral-500">
                          Flow Efficiency
                        </label>
                        <p className={`text-lg font-semibold ${
                          (bottleneck.flow_efficiency || 0) >= 0.5
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {((bottleneck.flow_efficiency || 0) * 100).toFixed(1)}%
                        </p>
                      </div>

                      {bottleneck.days_stagnant && (
                        <div>
                          <label className="text-xs font-medium text-neutral-500">
                            Days Stagnant
                          </label>
                          <p className="text-lg font-semibold text-orange-600 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {bottleneck.days_stagnant}
                          </p>
                        </div>
                      )}

                      {bottleneck.incoming_flows !== undefined && (
                        <div>
                          <label className="text-xs font-medium text-neutral-500">
                            Incoming/Outgoing
                          </label>
                          <p className="text-lg font-semibold">
                            {bottleneck.incoming_flows} / {bottleneck.outgoing_flows || 0}
                          </p>
                        </div>
                      )}
                    </div>

                    {bottleneck.reason && (
                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-sm text-orange-900">
                          <span className="font-semibold">Reason: </span>
                          {bottleneck.reason}
                        </p>
                      </div>
                    )}

                    {bottleneck.recommendation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Recommendation: </span>
                          {bottleneck.recommendation}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}

export default BottleneckAnalysis
