/**
 * MinistryFlowView Page
 * Ministry-centric fund flow visualization
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
import { ArrowLeft, Search, Building2, TrendingUp, AlertCircle } from 'lucide-react'

const formatCurrency = (amount) => {
  if (!amount) return '₹0'
  if (amount >= 1e9) return `₹${(amount / 1e9).toFixed(2)}B`
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(2)}Cr`
  return `₹${amount.toLocaleString('en-IN')}`
}

const MinistryFlowView = () => {
  const { ministryCode } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [searchCode, setSearchCode] = useState(ministryCode || '')
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [ministryInfo, setMinistryInfo] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (ministryCode) {
      loadMinistryGraph(ministryCode)
    }
  }, [ministryCode])

  const loadMinistryGraph = async (code) => {
    setLoading(true)
    setError(null)

    try {
      const data = await fundFlowService.getMinistryGraph(code)

      // Ensure graph data has the correct structure
      const validGraphData = {
        nodes: data?.nodes || data?.graph?.nodes || [],
        links: data?.links || data?.edges || data?.graph?.links || data?.graph?.edges || []
      }

      setGraphData(validGraphData)

      // Extract ministry node info
      const ministryNode = validGraphData.nodes.find(
        n => n.node_type === 'MINISTRY' && n.code === code
      )

      setMinistryInfo(ministryNode)
    } catch (err) {
      console.error('Error loading ministry graph:', err)
      setError(err.message || 'Failed to load ministry graph')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchCode.trim()) {
      navigate(`/admin/fund-flow/ministry/${searchCode.trim()}`)
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
                  <Building2 className="w-8 h-8 text-blue-600" />
                  Ministry Fund Flow
                </h1>
                <p className="text-neutral-600 mt-2">
                  Explore downstream fund allocation and utilization
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
                  placeholder="Enter Ministry Code (e.g., MIN001, MIN002...)"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="w-full"
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
              <p className="text-neutral-600">Loading ministry graph...</p>
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

          {/* Ministry Info */}
          {ministryInfo && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-neutral-600">Ministry</span>
                </div>
                <p className="text-lg font-semibold">{ministryInfo.name || ministryInfo.code}</p>
                <p className="text-xs text-neutral-500 mt-1">Code: {ministryInfo.code}</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-neutral-600">Total Allocation</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(ministryInfo.allocated_amount)}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {formatCurrency(ministryInfo.actual_amount)} utilized
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-neutral-600">Performance</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {ministryInfo.allocated_amount
                    ? ((ministryInfo.actual_amount / ministryInfo.allocated_amount) * 100).toFixed(1)
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
                Downstream Fund Flow ({graphData.nodes.length} nodes, {graphData.links?.length || 0} flows)
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
          {!loading && !error && !ministryCode && (
            <Card className="p-12 text-center">
              <Search className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Enter Ministry Code</h3>
              <p className="text-neutral-600">
                Search for a ministry to visualize its fund flow network
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

export default MinistryFlowView
