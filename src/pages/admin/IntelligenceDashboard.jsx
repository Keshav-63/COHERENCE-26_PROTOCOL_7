import React, { useState, useEffect } from 'react'
import {
  AlertTriangle, TrendingUp, DollarSign, Users, Activity, Shield,
  Search, Clock, Building2, ArrowRightLeft, Target, Wallet
} from 'lucide-react'
import { intelligenceService } from '../../services'
import { useAuth } from '../../context/AuthContext'
import { showError } from '../../utils/utils'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Navigation from '../../components/Navigation'
import TransactionAuditForm from '../../components/TransactionAuditForm'

const IntelligenceDashboard = () => {
  const { user, admin } = useAuth()

  // Determine user role for navigation
  const currentUser = user || admin
  const userRole = currentUser?.role || 'admin'
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardData, setDashboardData] = useState(null)
  const [anomalies, setAnomalies] = useState([])
  const [leakageRisks, setLeakageRisks] = useState([])
  const [vendorIntel, setVendorIntel] = useState([])
  const [marchRushData, setMarchRushData] = useState([])
  const [reallocationData, setReallocationData] = useState([])
  const [selectedFilter, setSelectedFilter] = useState('ALL')

  console.log('🎯 IntelligenceDashboard mounted')
  console.log('👤 Admin data:', admin)
  console.log('🔑 Has access token:', !!localStorage.getItem('access_token'))

  // Check user role
  const isCentralAdmin = admin?.tenant_type === 'central_government' || admin?.tenant_type === 'central_admin'
  const tenantCode = admin?.tenant_code

  useEffect(() => {
    console.log('🚀 useEffect triggered - calling loadDashboardData')
    loadDashboardData()
  }, [selectedFilter])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load main dashboard data
      const dashboard = await intelligenceService.getIntelligenceDashboard()
      setDashboardData(dashboard)

      // Load anomalies
      const anomalyResponse = await intelligenceService.getAnomalies({
        limit: 100,
        status_filter: selectedFilter === 'ALL' ? null : selectedFilter
      })

      // Extract anomalies array from response
      const anomalyData = anomalyResponse?.anomalies || []

      // Filter anomalies based on user role
      const filteredAnomalies = isCentralAdmin
        ? anomalyData
        : filterDataByTenant(anomalyData, tenantCode)

      setAnomalies(filteredAnomalies)

      // Load leakage risks
      const riskResponse = await intelligenceService.getLeakageRisks()
      const riskData = riskResponse?.risk_heatmap || []
      const filteredRisks = isCentralAdmin
        ? riskData
        : filterDataByTenant(riskData, tenantCode)

      setLeakageRisks(filteredRisks)

      // Load vendor intelligence (Central Admin only)
      if (isCentralAdmin) {
        const vendorResponse = await intelligenceService.getVendorIntelligence({
          top_n: 50,
          risk_tier: null
        })
        setVendorIntel(vendorResponse?.vendors || [])
      }

      // Load march rush data
      const marchResponse = await intelligenceService.getMarchRushRisks({
        fiscal_year: null,
        risk_tier: null
      })
      const marchData = marchResponse?.results || []
      setMarchRushData(isCentralAdmin ? marchData : filterDataByTenant(marchData, tenantCode))

      // Load reallocation suggestions
      const reallocResponse = await intelligenceService.getReallocationSuggestions({
        fiscal_year: null,
        max_suggestions: 10
      })
      const reallocData = reallocResponse?.suggestions || []
      setReallocationData(isCentralAdmin ? reallocData : filterDataByTenant(reallocData, tenantCode))

    } catch (error) {
      showError(error.message || 'Failed to load intelligence data')
      console.error('Intelligence dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterDataByTenant = (data, tenantCode) => {
    if (!data) return []
    // Filter data to show only items related to the user's tenant
    if (Array.isArray(data)) {
      return data.filter(item =>
        item.tenant_code === tenantCode ||
        item.ministry_code === tenantCode ||
        item.dept_code === tenantCode
      )
    }
    return data
  }

  const getRiskColor = (tier) => {
    const colors = {
      CRITICAL: 'bg-red-100 text-red-800 border-red-300',
      RED: 'bg-red-100 text-red-800 border-red-300',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
      ORANGE: 'bg-orange-100 text-orange-800 border-orange-300',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      YELLOW: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      LOW: 'bg-green-100 text-green-800 border-green-300',
      GREEN: 'bg-green-100 text-green-800 border-green-300',
      FLAGGED: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    }
    return colors[tier] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading PRAHARI Intelligence...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation role={userRole} />

      <main className="md:ml-72 pt-20 md:pt-0">
        <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 p-6">
          {/* Header */}
          <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={32} className="text-primary-900" />
          <h1 className="text-3xl font-bold text-neutral-900">
            PRAHARI Intelligence Dashboard
          </h1>
        </div>
        <p className="text-neutral-600">
          {isCentralAdmin
            ? 'Complete oversight across all ministries and departments'
            : `Intelligence for ${admin?.tenant_name || 'your department'}`
          }
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Total Transactions Audited</p>
              <p className="text-3xl font-bold text-neutral-900">
                {dashboardData?.total_transactions?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity size={24} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Flagged Anomalies</p>
              <p className="text-3xl font-bold text-orange-600">
                {dashboardData?.flagged?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle size={24} className="text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Critical Cases</p>
              <p className="text-3xl font-bold text-red-600">
                {dashboardData?.critical?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Shield size={24} className="text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Estimated Leakage</p>
              <p className="text-3xl font-bold text-purple-600">
                ₹{dashboardData?.estimated_leakage_cr?.toFixed(2) || '0'} Cr
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign size={24} className="text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Gemini AI Executive Briefing */}
      {dashboardData?.gemini_executive_briefing && (
        <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-900 rounded-lg">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-neutral-900 mb-2">
                Gemini AI Executive Briefing
              </h3>
              <p className="text-neutral-700 whitespace-pre-line">
                {dashboardData.gemini_executive_briefing}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Intelligence Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
            { id: 'audit', label: 'Audit Transaction', icon: Search },
            { id: 'vendors', label: 'Vendor Intel', icon: Building2 },
            { id: 'march-rush', label: 'March Rush', icon: Clock },
            { id: 'reallocation', label: 'Reallocation', icon: ArrowRightLeft },
            { id: 'heatmap', label: 'Risk Heatmap', icon: Target },
          ].map((tab) => {
            const Icon = tab.icon
            // Hide vendor tab for non-central admins
            if (tab.id === 'vendors' && !isCentralAdmin) return null
            // Heatmap tab visible to all admins

            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} className="mr-1" />
                {tab.label}
              </Button>
            )
          }).filter(Boolean)}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-bold text-neutral-900 mb-4">
            Budget Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 mb-1">Total Budget Estimate</p>
              <p className="text-2xl font-bold text-blue-900">
                ₹{(dashboardData?.total_budget_estimate_cr || 0).toLocaleString()} Cr
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 mb-1">Actual Expenditure</p>
              <p className="text-2xl font-bold text-green-900">
                ₹{(dashboardData?.total_actual_expenditure_cr || 0).toLocaleString()} Cr
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 mb-1">Utilization %</p>
              <p className="text-2xl font-bold text-purple-900">
                {(dashboardData?.overall_utilization_pct || 0).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'audit' && (
        <TransactionAuditForm onAuditComplete={() => loadDashboardData()} />
      )}

      {activeTab === 'anomalies' && (
        <>
          {/* Filters */}
          <div className="mb-6">
            <div className="flex gap-3">
              {['ALL', 'FLAGGED', 'CRITICAL'].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>

          {/* Anomalies List */}
          <Card className="p-6 mb-8">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">
              Detected Anomalies ({anomalies.length})
            </h3>

            {anomalies && anomalies.length > 0 ? (
              <div className="space-y-4">
                {anomalies.map((anomaly, index) => (
                  <div
                    key={index}
                    className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm text-neutral-600">
                            {anomaly.trans_id}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getRiskColor(anomaly.status)}`}>
                            {anomaly.status}
                          </span>
                          {anomaly.source && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {anomaly.source}
                            </span>
                          )}
                        </div>
                        <p className="text-neutral-900 font-medium">
                          {anomaly.dept_name || 'Unknown Department'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-neutral-900">
                          ₹{(anomaly.amount / 100000).toFixed(2)} L
                        </p>
                        {anomaly.timestamp && (
                          <p className="text-xs text-neutral-500">
                            {new Date(anomaly.timestamp).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Risk Score */}
                    {anomaly.risk_score !== undefined && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-neutral-600">Risk Score:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-600 h-2 rounded-full"
                              style={{ width: `${anomaly.risk_score * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-red-600">
                            {(anomaly.risk_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Anomaly Reason */}
                    {anomaly.anomaly_reason && (
                      <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded">
                        <p className="text-sm text-orange-900">
                          <strong>Reason:</strong> {anomaly.anomaly_reason}
                        </p>
                      </div>
                    )}

                    {/* Anomaly Flags */}
                    {anomaly.anomaly_flags && anomaly.anomaly_flags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {anomaly.anomaly_flags.map((flag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs uppercase"
                          >
                            {flag.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Gemini AI Analysis */}
                    {anomaly.gemini_analysis && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="text-sm text-blue-900">
                          <strong>Gemini AI Analysis:</strong> {anomaly.gemini_analysis}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield size={48} className="mx-auto text-neutral-300 mb-3" />
                <p className="text-neutral-500">No anomalies detected</p>
              </div>
            )}
          </Card>
        </>
      )}

      {activeTab === 'vendors' && isCentralAdmin && (
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-bold text-neutral-900 mb-4">
            Vendor Intelligence Network ({vendorIntel.length} vendors)
          </h3>

          {vendorIntel && vendorIntel.length > 0 ? (
            <div className="space-y-4">
              {vendorIntel.slice(0, 20).map((vendor, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${getRiskColor(vendor.risk_tier)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-neutral-600">
                          {vendor.vendor_id}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getRiskColor(vendor.risk_tier)}`}>
                          {vendor.risk_tier}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-neutral-900">
                        {vendor.vendor_name}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {vendor.vendor_type} • {vendor.vendor_status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-neutral-600">Contract Value</p>
                      <p className="text-lg font-bold text-neutral-900">
                        ₹{vendor.total_contract_value_cr?.toFixed(2)} Cr
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3 p-3 bg-white bg-opacity-50 rounded">
                    <div>
                      <p className="text-xs text-neutral-600">Risk Score</p>
                      <p className="text-lg font-bold">{(vendor.risk_score * 100).toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600">Departments</p>
                      <p className="text-lg font-bold">{vendor.departments_served}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600">Network Score</p>
                      <p className="text-lg font-bold">{(vendor.network_centrality * 100).toFixed(1)}%</p>
                    </div>
                  </div>

                  {vendor.risk_signals && vendor.risk_signals.length > 0 && (
                    <div className="mb-3">
                      {vendor.risk_signals.map((signal, idx) => (
                        <p key={idx} className="text-sm text-red-800 mb-1">
                          • {signal}
                        </p>
                      ))}
                    </div>
                  )}

                  {vendor.gemini_risk_explanation && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-sm text-blue-900">
                        <strong>AI Risk Explanation:</strong> {vendor.gemini_risk_explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 size={48} className="mx-auto text-neutral-300 mb-3" />
              <p className="text-neutral-500">No vendor intelligence data available</p>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'march-rush' && (
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-neutral-900">
                March Rush Risk Analysis
              </h3>
              <p className="text-sm text-neutral-500 mt-1">
                {marchRushData.length} entities analyzed • FY {marchRushData[0]?.fiscal_year || '2025-26'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-bold">HIGH</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded font-bold">LOW</span>
            </div>
          </div>

          {marchRushData && marchRushData.length > 0 ? (
            <div className="space-y-4">
              {marchRushData.map((dept, index) => {
                const utilPct = dept.utilization_pct || 0
                const q4Pct = (dept.q4_spending_ratio_pct || 0)
                const marchPct = (dept.march_spending_ratio_pct || 0)
                const marchScore = dept.march_rush_score || 0
                const budgetEst = dept.budget_estimate_cr || (dept.budget_estimate ? dept.budget_estimate / 10000000 : 0)
                const actualExp = dept.actual_expenditure_cr || (dept.actual_expenditure ? dept.actual_expenditure / 10000000 : 0)
                const remainingBudget = dept.remaining_budget_cr || (dept.remaining_budget ? dept.remaining_budget / 10000000 : 0)
                const lapseRisk = dept.fund_lapse_risk || 0

                return (
                  <div
                    key={index}
                    className={`border rounded-xl overflow-hidden hover:shadow-lg transition-shadow ${getRiskColor(dept.fund_lapse_risk_level || dept.march_rush_risk || dept.risk_tier || 'LOW')}`}
                  >
                    {/* Header */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-neutral-500">
                              {dept.entity_code || dept.dept_code}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRiskColor(dept.fund_lapse_risk_level || dept.march_rush_risk || dept.risk_tier || 'LOW')}`}>
                              {dept.fund_lapse_risk_level || dept.march_rush_risk || dept.risk_tier || '—'}
                            </span>
                            {dept.prev_march_rush_history && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-bold">
                                REPEAT OFFENDER
                              </span>
                            )}
                          </div>
                          <p className="text-lg font-bold text-neutral-900">
                            {dept.entity_name || dept.dept_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-neutral-500 uppercase tracking-wider">March Rush Score</p>
                          <p className="text-2xl font-black text-neutral-900">{marchScore.toFixed(1)}</p>
                        </div>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="p-3 bg-white bg-opacity-60 rounded-lg">
                          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Budget Estimate</p>
                          <p className="text-base font-bold text-neutral-900">₹{budgetEst.toFixed(1)} Cr</p>
                        </div>
                        <div className="p-3 bg-white bg-opacity-60 rounded-lg">
                          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Actual Expenditure</p>
                          <p className="text-base font-bold text-green-700">₹{actualExp.toFixed(1)} Cr</p>
                        </div>
                        <div className="p-3 bg-white bg-opacity-60 rounded-lg">
                          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Remaining</p>
                          <p className="text-base font-bold text-amber-700">₹{remainingBudget.toFixed(1)} Cr</p>
                        </div>
                        <div className="p-3 bg-white bg-opacity-60 rounded-lg">
                          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Utilization</p>
                          <p className="text-base font-bold text-blue-700">{utilPct.toFixed(1)}%</p>
                        </div>
                      </div>

                      {/* Progress Bars */}
                      <div className="space-y-3 mb-4">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-neutral-600 font-medium">Utilization Rate</span>
                            <span className="font-bold text-neutral-800">{utilPct.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${utilPct > 90 ? 'bg-green-500' : utilPct > 70 ? 'bg-blue-500' : utilPct > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(utilPct, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-neutral-600 font-medium">Q4 Spending Ratio</span>
                            <span className="font-bold text-neutral-800">{q4Pct.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${q4Pct > 40 ? 'bg-red-500' : q4Pct > 30 ? 'bg-amber-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(q4Pct, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-neutral-600 font-medium">March Spending Ratio</span>
                            <span className="font-bold text-neutral-800">{marchPct.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${marchPct > 15 ? 'bg-red-500' : marchPct > 8 ? 'bg-amber-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(marchPct * 3, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Fund Lapse Risk */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-600 font-medium mb-1">Fund Lapse Risk</p>
                          <p className="text-xl font-bold text-red-700">
                            {typeof lapseRisk === 'string' ? lapseRisk : `${lapseRisk.toFixed(1)}%`}
                          </p>
                        </div>
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-xs text-orange-600 font-medium mb-1">Est. Lapse Amount</p>
                          <p className="text-xl font-bold text-orange-700">
                            ₹{(dept.estimated_lapse_amount || 0).toFixed(2)} Cr
                          </p>
                        </div>
                      </div>

                      {/* March Rush Signals */}
                      {dept.march_rush_signals && dept.march_rush_signals.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-2">Risk Signals</p>
                          <div className="flex flex-wrap gap-2">
                            {dept.march_rush_signals.map((signal, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-[11px] font-semibold"
                              >
                                ⚠ {signal.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Gemini AI Warning */}
                      {dept.gemini_warning && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <TrendingUp size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Gemini AI Analysis</p>
                              <p className="text-sm text-blue-900 leading-relaxed">
                                {dept.gemini_warning}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock size={48} className="mx-auto text-neutral-300 mb-3" />
              <p className="text-neutral-500">No March Rush data available</p>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'reallocation' && (
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-bold text-neutral-900 mb-4">
            AI-Optimized Fund Reallocation Suggestions ({reallocationData.length})
          </h3>

          {reallocationData && reallocationData.length > 0 ? (
            <div className="space-y-4">
              {reallocationData.map((suggestion, index) => (
                <div
                  key={index}
                  className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                      Rank #{suggestion.rank}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded font-bold">
                      ₹{suggestion.recommended_transfer_cr?.toLocaleString()} Cr
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-red-50 rounded">
                      <p className="text-xs text-red-600 mb-1">FROM (Under-utilized)</p>
                      <p className="font-bold text-neutral-900">{suggestion.from_entity}</p>
                      <p className="text-sm text-neutral-600">{suggestion.from_ministry}</p>
                      <p className="text-xs text-red-700 mt-1">
                        Utilization: {suggestion.from_utilization_pct}% • {suggestion.from_lapse_risk} Risk
                      </p>
                    </div>

                    <div className="p-3 bg-green-50 rounded">
                      <p className="text-xs text-green-600 mb-1">TO (High-absorption)</p>
                      <p className="font-bold text-neutral-900">{suggestion.to_entity}</p>
                      <p className="text-sm text-neutral-600">{suggestion.to_ministry}</p>
                      <p className="text-xs text-green-700 mt-1">
                        Utilization: {suggestion.to_utilization_pct}%
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded mb-3">
                    <p className="text-sm text-blue-900">
                      <strong>Rationale:</strong> {suggestion.rationale}
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-900">
                      <strong>Estimated Benefit:</strong> {suggestion.estimated_benefit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ArrowRightLeft size={48} className="mx-auto text-neutral-300 mb-3" />
              <p className="text-neutral-500">No reallocation suggestions available</p>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'heatmap' && (
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-neutral-900">
                Ministry Leakage Risk Heatmap
              </h3>
              <p className="text-sm text-neutral-500 mt-1">
                {leakageRisks.length} ministries analyzed
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-bold">RED</span>
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded font-bold">ORANGE</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded font-bold">YELLOW</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-bold">GREEN</span>
            </div>
          </div>

          {leakageRisks && leakageRisks.length > 0 ? (
            <div className="space-y-4">
              {leakageRisks.slice(0, 30).map((risk, index) => {
                const utilPct = risk.utilization_pct || 0
                const riskPct = (risk.leakage_risk_score || 0) * 100
                const budgetCr = risk.total_budget_estimate_cr || 0
                const actualCr = risk.total_actual_expenditure_cr || 0
                const remainCr = risk.remaining_budget_cr || (budgetCr - actualCr)

                return (
                  <div
                    key={index}
                    className={`border rounded-xl overflow-hidden hover:shadow-lg transition-shadow ${getRiskColor(risk.risk_tier)}`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-neutral-500">
                              {risk.ministry_code}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRiskColor(risk.risk_tier)}`}>
                              {risk.risk_tier}
                            </span>
                          </div>
                          <p className="text-lg font-bold text-neutral-900">
                            {risk.ministry_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-neutral-500 uppercase tracking-wider">Risk Score</p>
                          <p className="text-2xl font-black text-neutral-900">{riskPct.toFixed(0)}</p>
                        </div>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="p-3 bg-white bg-opacity-60 rounded-lg">
                          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Budget Estimate</p>
                          <p className="text-base font-bold text-neutral-900">₹{budgetCr.toLocaleString()} Cr</p>
                        </div>
                        <div className="p-3 bg-white bg-opacity-60 rounded-lg">
                          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Actual Expenditure</p>
                          <p className="text-base font-bold text-green-700">₹{actualCr.toLocaleString()} Cr</p>
                        </div>
                        <div className="p-3 bg-white bg-opacity-60 rounded-lg">
                          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Remaining</p>
                          <p className="text-base font-bold text-amber-700">₹{remainCr.toLocaleString()} Cr</p>
                        </div>
                        <div className="p-3 bg-white bg-opacity-60 rounded-lg">
                          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Schemes</p>
                          <p className="text-base font-bold text-blue-700">{risk.scheme_count}</p>
                        </div>
                      </div>

                      {/* Progress Bars */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-neutral-600 font-medium">Utilization Rate</span>
                            <span className="font-bold text-neutral-800">{utilPct.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${utilPct > 80 ? 'bg-green-500' : utilPct > 60 ? 'bg-blue-500' : utilPct > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(utilPct, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-neutral-600 font-medium">Leakage Risk</span>
                            <span className="font-bold text-neutral-800">{riskPct.toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${riskPct > 70 ? 'bg-red-500' : riskPct > 50 ? 'bg-orange-500' : riskPct > 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(riskPct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target size={48} className="mx-auto text-neutral-300 mb-3" />
              <p className="text-neutral-500">No heatmap data available</p>
            </div>
          )}
        </Card>
      )}
        </div>
      </main>
    </div>
  )
}

export default IntelligenceDashboard
