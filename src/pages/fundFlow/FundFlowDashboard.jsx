/**
 * FundFlowDashboard Page
 * National fund flow overview with AI insights from Gemini
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../../components/Navigation'
import Card from '../../components/Card'
import Button from '../../components/Button'
import FundFlowGraph from '../../components/fundFlow/FundFlowGraph'
import NodeDetails from '../../components/fundFlow/NodeDetails'
import fundFlowService from '../../services/fundFlow.service'
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  DollarSign,
  Activity
} from 'lucide-react'

const formatCurrency = (amount) => {
  if (!amount) return '₹0'
  if (amount >= 1e9) return `₹${(amount / 1e9).toFixed(2)}B`
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(2)}Cr`
  if (amount >= 1e5) return `₹${(amount / 1e5).toFixed(2)}L`
  return `₹${amount.toLocaleString('en-IN')}`
}

const FundFlowDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [rebuilding, setRebuilding] = useState(false)
  const [summary, setSummary] = useState(null)
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [selectedNode, setSelectedNode] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Load national summary and graph in parallel
      const [summaryData, graphDataResult] = await Promise.all([
        fundFlowService.getNationalSummary(),
        fundFlowService.getFullGraph()
      ])

      setSummary(summaryData)

      // Ensure graph data has the correct structure
      const validGraphData = {
        nodes: graphDataResult?.nodes || graphDataResult?.graph?.nodes || [],
        links: graphDataResult?.links || graphDataResult?.edges || graphDataResult?.graph?.links || graphDataResult?.graph?.edges || []
      }

      setGraphData(validGraphData)
    } catch (err) {
      console.error('Error loading fund flow data:', err)
      setError(err.message || 'Failed to load fund flow data')
    } finally {
      setLoading(false)
    }
  }

  const handleRebuildGraph = async () => {
    setRebuilding(true)
    try {
      await fundFlowService.rebuildGraph()
      await loadData()
    } catch (err) {
      console.error('Error rebuilding graph:', err)
      setError(err.message || 'Failed to rebuild graph')
    } finally {
      setRebuilding(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center md:ml-72">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-600">Loading fund flow intelligence...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-neutral-50 p-8 md:ml-72">
          <Card className="max-w-2xl mx-auto p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
            <p className="text-neutral-600 mb-4">{error}</p>
            <Button onClick={loadData}>Retry</Button>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">
                  National Fund Flow Intelligence
                </h1>
                <p className="text-neutral-600 mt-2">
                  Live knowledge graph tracking ₹{summary?.financial_summary?.total_central_allocation_cr
                    ? (summary.financial_summary.total_central_allocation_cr / 100000).toFixed(2)
                    : '0'}L Cr across {summary?.graph_stats?.total_nodes || 0} entities
                </p>
              </div>
              <Button
                onClick={handleRebuildGraph}
                disabled={rebuilding}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${rebuilding ? 'animate-spin' : ''}`} />
                {rebuilding ? 'Rebuilding...' : 'Rebuild Graph'}
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          {(summary?.graph_stats || summary?.financial_summary) && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">Total Nodes</span>
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold">{summary.graph_stats?.total_nodes || 0}</p>
                <p className="text-xs text-neutral-500 mt-1">
                  {summary.graph_stats?.total_edges || 0} connections
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">Total Allocation</span>
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency((summary.financial_summary?.total_central_allocation_cr || 0) * 1e7)}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Across all ministry flows
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">Absorption Rate</span>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {(summary.financial_summary?.overall_absorption_pct || 0).toFixed(2)}%
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {formatCurrency((summary.financial_summary?.total_actual_expenditure_cr || 0) * 1e7)} utilized
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">Risk Nodes</span>
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {(summary.risk_distribution?.RED || 0) + (summary.risk_distribution?.ORANGE || 0)}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Require attention
                </p>
              </Card>
            </div>
          )}

          {/* AI Intelligence Report */}
          {summary?.gemini_intelligence_report && (
            <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    PRAHARI AI Intelligence Report
                    <span className="text-xs px-2 py-1 bg-purple-200 text-purple-800 rounded-full">
                      Powered by Gemini
                    </span>
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-neutral-700 whitespace-pre-line">
                      {summary.gemini_intelligence_report}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate('/admin/fund-flow/bottlenecks')}
            >
              <AlertTriangle className="w-8 h-8 text-orange-500 mb-3" />
              <h3 className="font-semibold mb-1">Bottleneck Analysis</h3>
              <p className="text-sm text-neutral-600 mb-3">
                Identify where funds are pooling and stagnating
              </p>
              <div className="flex items-center text-primary-600 text-sm font-medium">
                View Bottlenecks <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Card>

            <Card
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate('/admin/fund-flow/absorption')}
            >
              <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
              <h3 className="font-semibold mb-1">Absorption Leaderboard</h3>
              <p className="text-sm text-neutral-600 mb-3">
                Best and worst performing entities by efficiency
              </p>
              <div className="flex items-center text-primary-600 text-sm font-medium">
                View Rankings <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Card>

            <Card
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate('/admin/fund-flow/trace')}
            >
              <Activity className="w-8 h-8 text-blue-500 mb-3" />
              <h3 className="font-semibold mb-1">Fund Tracer</h3>
              <p className="text-sm text-neutral-600 mb-3">
                Trace money flow from source to destination
              </p>
              <div className="flex items-center text-primary-600 text-sm font-medium">
                Trace Funds <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Card>
          </div>

          {/* Interactive Graph */}
          {graphData && graphData.nodes && graphData.nodes.length > 0 ? (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Fund Flow — Central to Ministry to States
              </h2>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Card className="p-6">
                    <FundFlowGraph
                      graphData={graphData}
                      onNodeClick={setSelectedNode}
                    />
                  </Card>
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
          ) : (
            <Card className="p-12 text-center mb-8">
              <Activity className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Graph Data Available</h3>
              <p className="text-neutral-600 mb-4">
                The fund flow graph is not available yet. This could be because:
              </p>
              <ul className="text-sm text-neutral-600 text-left max-w-md mx-auto mb-4">
                <li>• No budget allocations or transactions have been recorded</li>
                <li>• The graph needs to be built from the backend</li>
                <li>• The API endpoint is not accessible</li>
              </ul>
              <Button onClick={handleRebuildGraph} disabled={rebuilding}>
                {rebuilding ? 'Building Graph...' : 'Build Graph Now'}
              </Button>
            </Card>
          )}

          {/* Risk Summary */}
          {summary?.risk_distribution && (
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Risk Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-3xl font-bold text-red-600">
                    {summary.risk_distribution.RED || 0}
                  </p>
                  <p className="text-sm text-red-800 mt-1">High Risk</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-3xl font-bold text-orange-600">
                    {summary.risk_distribution.ORANGE || 0}
                  </p>
                  <p className="text-sm text-orange-800 mt-1">Medium Risk</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-3xl font-bold text-yellow-600">
                    {summary.risk_distribution.YELLOW || 0}
                  </p>
                  <p className="text-sm text-yellow-800 mt-1">Low Risk</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-3xl font-bold text-green-600">
                    {summary.risk_distribution.GREEN || 0}
                  </p>
                  <p className="text-sm text-green-800 mt-1">Healthy</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

export default FundFlowDashboard
