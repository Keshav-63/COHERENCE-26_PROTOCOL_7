/**
 * FundTracer Page
 * Trace money flow from source to destination
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../../components/Navigation'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import FundFlowGraph from '../../components/fundFlow/FundFlowGraph'
import fundFlowService from '../../services/fundFlow.service'
import { ArrowLeft, Search, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'

const formatCurrency = (amount) => {
  if (!amount) return '₹0'
  if (amount >= 1e9) return `₹${(amount / 1e9).toFixed(2)}B`
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(2)}Cr`
  return `₹${amount.toLocaleString('en-IN')}`
}

const FundTracer = () => {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [fromNode, setFromNode] = useState('')
  const [toNode, setToNode] = useState('')
  const [traceResult, setTraceResult] = useState(null)
  const [error, setError] = useState(null)

  const handleTrace = async (e) => {
    e.preventDefault()

    if (!fromNode.trim() || !toNode.trim()) {
      setError('Please enter both source and destination nodes')
      return
    }

    setLoading(true)
    setError(null)
    setTraceResult(null)

    try {
      const result = await fundFlowService.traceFundPath(fromNode.trim(), toNode.trim())
      setTraceResult(result)
    } catch (err) {
      console.error('Error tracing fund path:', err)
      setError(err.message || 'Failed to trace fund path')
    } finally {
      setLoading(false)
    }
  }

  // Build graph data from trace result
  const getGraphData = () => {
    if (!traceResult || !traceResult.path) {
      return { nodes: [], links: [] }
    }

    const nodes = traceResult.path.map(nodeId => ({
      id: nodeId,
      code: nodeId,
      name: nodeId,
    }))

    const links = []
    for (let i = 0; i < traceResult.path.length - 1; i++) {
      links.push({
        source: traceResult.path[i],
        target: traceResult.path[i + 1],
      })
    }

    return { nodes, links }
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
                <Search className="w-8 h-8 text-blue-600" />
                Fund Flow Tracer
              </h1>
              <p className="text-neutral-600 mt-2">
                Trace the complete path of money from source to destination
              </p>
            </div>
          </div>

          {/* Search Form */}
          <Card className="p-6 mb-8">
            <form onSubmit={handleTrace}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Source Node</label>
                  <Input
                    type="text"
                    placeholder="e.g., CENTRAL, MIN001, SCH001"
                    value={fromNode}
                    onChange={(e) => setFromNode(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Destination Node</label>
                  <Input
                    type="text"
                    placeholder="e.g., VEN001, DIST001"
                    value={toNode}
                    onChange={(e) => setToNode(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                {loading ? 'Tracing...' : 'Trace Fund Path'}
              </Button>
            </form>
          </Card>

          {/* Error */}
          {error && (
            <Card className="p-6 mb-8 bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Trace Result */}
          {traceResult && (
            <>
              {/* Success Message */}
              {traceResult.path && traceResult.path.length > 0 && (
                <Card className="p-6 mb-8 bg-green-50 border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 mb-1">Path Found!</h3>
                      <p className="text-sm text-green-700 mb-3">
                        Found {traceResult.path_length || traceResult.path.length} hop(s) from {fromNode} to {toNode}
                      </p>

                      {traceResult.total_amount && (
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-green-700">Total Flow: </span>
                            <span className="font-semibold text-green-900">
                              {formatCurrency(traceResult.total_amount)}
                            </span>
                          </div>
                          {traceResult.flow_efficiency && (
                            <div>
                              <span className="text-green-700">Efficiency: </span>
                              <span className="font-semibold text-green-900">
                                {(traceResult.flow_efficiency * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Path Visualization */}
              {traceResult.path && traceResult.path.length === 0 && (
                <Card className="p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Path Found</h3>
                  <p className="text-neutral-600">
                    No direct or indirect fund flow path exists between these nodes
                  </p>
                </Card>
              )}

              {/* Path Steps */}
              {traceResult.path && traceResult.path.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Step-by-step Path */}
                  <Card className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Fund Flow Path</h3>
                    <div className="space-y-3">
                      {traceResult.path.map((node, index) => (
                        <div key={index}>
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-mono font-semibold">{node}</p>
                              {traceResult.path_details && traceResult.path_details[index] && (
                                <p className="text-sm text-neutral-600">
                                  {traceResult.path_details[index].name}
                                </p>
                              )}
                            </div>
                          </div>
                          {index < traceResult.path.length - 1 && (
                            <div className="ml-4 my-2">
                              <ArrowRight className="w-5 h-5 text-neutral-400" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Interactive Graph */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Visual Path</h3>
                    <FundFlowGraph
                      graphData={getGraphData()}
                      highlightNodes={traceResult.path}
                      width={500}
                      height={400}
                    />
                  </div>
                </div>
              )}

              {/* Edge Details */}
              {traceResult.edges && traceResult.edges.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Flow Details</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="text-left p-3 font-semibold">From</th>
                          <th className="text-left p-3 font-semibold">To</th>
                          <th className="text-right p-3 font-semibold">Allocated</th>
                          <th className="text-right p-3 font-semibold">Actual</th>
                          <th className="text-right p-3 font-semibold">Efficiency</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {traceResult.edges.map((edge, index) => (
                          <tr key={index} className="hover:bg-neutral-50">
                            <td className="p-3 font-mono">{edge.source_code || edge.source}</td>
                            <td className="p-3 font-mono">{edge.target_code || edge.target}</td>
                            <td className="p-3 text-right font-semibold text-blue-600">
                              {formatCurrency(edge.allocated_amount)}
                            </td>
                            <td className="p-3 text-right font-semibold text-green-600">
                              {formatCurrency(edge.actual_amount)}
                            </td>
                            <td className="p-3 text-right">
                              <span className={`font-semibold ${
                                (edge.flow_efficiency || 0) >= 0.8 ? 'text-green-600' :
                                (edge.flow_efficiency || 0) >= 0.5 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {((edge.flow_efficiency || 0) * 100).toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Empty State */}
          {!traceResult && !loading && !error && (
            <Card className="p-12 text-center">
              <Search className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ready to Trace</h3>
              <p className="text-neutral-600">
                Enter source and destination nodes to trace the fund flow path
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

export default FundTracer
