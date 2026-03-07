/**
 * StateFlowView Page
 * State-centric fund flow visualization
 */

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navigation from '../../components/Navigation'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import FundFlowGraph from '../../components/fundFlow/FundFlowGraph'
import NodeDetails from '../../components/fundFlow/NodeDetails'
import fundFlowService from '../../services/fundFlow.service'
import { ArrowLeft, Search, MapPin, TrendingUp, AlertCircle } from 'lucide-react'

const formatCurrency = (amount) => {
  if (!amount) return '₹0'
  if (amount >= 1e9) return `₹${(amount / 1e9).toFixed(2)}B`
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(2)}Cr`
  return `₹${amount.toLocaleString('en-IN')}`
}

const StateFlowView = () => {
  const { stateCode } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [searchCode, setSearchCode] = useState(stateCode || '')
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [stateInfo, setStateInfo] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (stateCode) {
      loadStateGraph(stateCode)
    }
  }, [stateCode])

  const loadStateGraph = async (code) => {
    setLoading(true)
    setError(null)

    try {
      const data = await fundFlowService.getStateGraph(code)

      // Ensure graph data has the correct structure
      const validGraphData = {
        nodes: data?.nodes || data?.graph?.nodes || [],
        links: data?.links || data?.edges || data?.graph?.links || data?.graph?.edges || []
      }

      setGraphData(validGraphData)

      // Extract state node info
      const stateNode = validGraphData.nodes.find(
        n => n.node_type === 'STATE' && n.code === code
      )

      setStateInfo(stateNode)
    } catch (err) {
      console.error('Error loading state graph:', err)
      setError(err.message || 'Failed to load state graph')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchCode.trim()) {
      navigate(`/admin/fund-flow/state/${searchCode.trim().toUpperCase()}`)
    }
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

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
                  <MapPin className="w-8 h-8 text-cyan-600" />
                  State Fund Flow
                </h1>
                <p className="text-neutral-600 mt-2">
                  Track state-level fund allocation and district-wise distribution
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <Card className="p-6 mb-8">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter State Code (e.g., MH, DL, UP, KA...)"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                  className="w-full"
                  maxLength={2}
                />
              </div>
              <Button type="submit" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Load Graph
              </Button>
            </form>
          </Card>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-neutral-600">Loading state graph...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error</h3>
              <p className="text-neutral-600">{error}</p>
            </Card>
          )}

          {/* State Info */}
          {stateInfo && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-cyan-500" />
                  <span className="text-sm text-neutral-600">State</span>
                </div>
                <p className="text-lg font-semibold">{stateInfo.name || stateInfo.code}</p>
                <p className="text-xs text-neutral-500 mt-1">Code: {stateInfo.code}</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-neutral-600">Total Allocation</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stateInfo.allocated_amount)}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {formatCurrency(stateInfo.actual_amount)} utilized
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-neutral-600">Performance</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {stateInfo.allocated_amount
                    ? ((stateInfo.actual_amount / stateInfo.allocated_amount) * 100).toFixed(1)
                    : '0'}%
                </p>
                <p className="text-xs text-neutral-500 mt-1">Absorption rate</p>
              </Card>
            </div>
          )}

          {/* Graph */}
          {graphData.nodes?.length > 0 && !loading && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                State Fund Flow Network ({graphData.nodes.length} nodes, {graphData.links?.length || 0} flows)
              </h2>
              <div className="flex gap-4">
                <div className="flex-1">
                  <FundFlowGraph
                    graphData={graphData}
                    onNodeClick={setSelectedNode}
                    width={selectedNode ? 900 : 1200}
                    height={700}
                  />
                </div>
                {selectedNode && (
                  <div>
                    <NodeDetails
                      node={selectedNode}
                      onClose={() => setSelectedNode(null)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && !stateCode && (
            <Card className="p-12 text-center">
              <Search className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Enter State Code</h3>
              <p className="text-neutral-600">
                Search for a state to visualize its fund flow network
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

export default StateFlowView
