import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, Info, BrainCircuit, Activity, ShieldAlert, Target } from 'lucide-react'
import Navigation from '../../components/Navigation'
import { formatCurrency } from '../../utils/utils'
import { predictiveModelingService } from '../../services'
import { useAuth } from '../../context/AuthContext'
import { showError } from '../../utils/utils'

const PredictiveModeling = () => {
  const { user, admin } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Determine user role for navigation
  const currentUser = user || admin
  const userRole = currentUser?.role || 'admin'

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true)
        const response = await predictiveModelingService.getPredictiveModels()
        setData(response)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch predictive models:', err)
        setError(err.message || 'Failed to load predictive data. Please check if the backend is running.')
        showError(err.message || 'Failed to load predictive data')
      } finally {
        setLoading(false)
      }
    }

    fetchPredictions()
  }, [])

  // Process data
  const highRiskCount = data.filter(d => d.predictions?.lapse_risk === 'High').length
  const totalAllocation = data.reduce((acc, curr) => acc + (curr.current_status?.allocation || 0), 0)
  const totalPredictedUnspent = data.reduce((acc, curr) => acc + (curr.predictions?.forecast?.predicted_unspent || 0), 0)
  const overallLapseRiskPercent = totalAllocation > 0 ? (totalPredictedUnspent / totalAllocation) * 100 : 0

  const trendCounts = {
      UP: data.filter(d => d.predictions?.next_period_trend === 'UP').length,
      DOWN: data.filter(d => d.predictions?.next_period_trend === 'DOWN').length,
      STABLE: data.filter(d => d.predictions?.next_period_trend === 'STABLE').length
  }

  const renderTrendIcon = (trend) => {
    switch (trend) {
      case 'UP': return <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><TrendingUp size={14} /> <span className="text-xs font-bold tracking-wider">GROWING</span></div>
      case 'DOWN': return <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20"><TrendingDown size={14} /> <span className="text-xs font-bold tracking-wider">DECLINING</span></div>
      case 'STABLE': return <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20"><Minus size={14} /> <span className="text-xs font-bold tracking-wider">STABLE</span></div>
      default: return null
    }
  }

  const renderRiskBadge = (risk, score) => {
    switch (risk) {
      case 'High':
        return (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm font-bold text-red-400 uppercase tracking-widest">CRITICAL RISK</span>
            </div>
            <span className="text-xs font-mono text-red-500/70 border border-red-500/30 px-2 py-0.5 rounded bg-red-500/10">{score}</span>
          </div>
        )
      case 'Medium':
        return (
           <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-sm font-bold text-amber-400 uppercase tracking-widest">ELEVATED RISK</span>
            </div>
            <span className="text-xs font-mono text-amber-500/70 border border-amber-500/30 px-2 py-0.5 rounded bg-amber-500/10">{score}</span>
          </div>
        )
      case 'Low':
         return (
           <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest">STABLE TIER</span>
            </div>
            <span className="text-xs font-mono text-emerald-500/70 border border-emerald-500/30 px-2 py-0.5 rounded bg-emerald-500/10">{score}</span>
          </div>
        )
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
      <Navigation role={userRole} />

      <main className="md:ml-72 min-h-screen relative overflow-hidden flex flex-col">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-blue-900/20 via-indigo-900/10 to-transparent pointer-events-none" />
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />

        {/* Header content */}
        <div className="relative z-10 px-8 py-10 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <BrainCircuit className="text-blue-400" size={24} />
                        </div>
                        <h2 className="text-sm font-bold text-blue-400 tracking-widest uppercase">Nexus Engine</h2>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                        Predictive <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Forecasting</span>
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl text-sm md:text-base">
                        Algorithmic projections for Scheme Lapse Risk, Underutilization, and future momentum paths.
                    </p>
                </div>

                {/* Live Status Indicator */}
                <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase">Models Active</span>
                </div>
            </div>
        </div>

        {/* Main Dashboard Area */}
        <div className="relative z-10 flex-1 px-8 py-8 w-full max-w-7xl mx-auto">

          {loading ? (
             <div className="h-[60vh] flex flex-col items-center justify-center">
                <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
                    <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BrainCircuit className="text-blue-500 animate-pulse" size={24} />
                    </div>
                </div>
                <p className="text-slate-400 font-mono tracking-widest text-sm uppercase">Synthesizing predictions...</p>
             </div>
          ) : error ? (
              <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4">
                  <AlertTriangle className="text-red-400 mt-1" />
                  <div>
                      <h3 className="text-red-400 font-bold mb-1">System Architecture Error</h3>
                      <p className="text-red-300/80 text-sm">{error}</p>
                  </div>
              </div>
          ) : (
              <div className="space-y-8">
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  {/* Card 1 */}
                  <div className="group relative overflow-hidden bg-slate-900/40 backdrop-blur-md border border-slate-800 hover:border-blue-500/50 p-6 rounded-2xl transition-all duration-300">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Activity size={80} className="text-blue-500" />
                      </div>
                      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Portfolio At Risk</h3>
                      <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-white">{formatCurrency(totalPredictedUnspent).split('.')[0]}</span>
                          <span className="text-sm font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">{overallLapseRiskPercent.toFixed(1)}%</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-3 border-t border-slate-800 pt-3">Projected unspent allocation by year-end</p>
                  </div>

                  {/* Card 2 */}
                  <div className="group relative overflow-hidden bg-slate-900/40 backdrop-blur-md border border-slate-800 hover:border-red-500/50 p-6 rounded-2xl transition-all duration-300">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <ShieldAlert size={80} className="text-red-500" />
                      </div>
                      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Critical Threat Level</h3>
                      <div className="flex items-baseline gap-3">
                          <span className="text-3xl font-black text-white">{highRiskCount}</span>
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">/ {data.length} Schemes</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-3 border-t border-slate-800 pt-3">Schemes requiring immediate intervention</p>
                  </div>

                  {/* Card 3 */}
                  <div className="group relative overflow-hidden bg-slate-900/40 backdrop-blur-md border border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl transition-all duration-300">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Target size={80} className="text-emerald-500" />
                      </div>
                      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Network Momentum</h3>
                      <div className="flex items-center gap-4 mt-2">
                          <div className="flex flex-col">
                              <span className="text-2xl font-black text-white">{trendCounts.UP}</span>
                              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Growing</span>
                          </div>
                          <div className="w-px h-8 bg-slate-800" />
                          <div className="flex flex-col">
                              <span className="text-2xl font-black text-white">{trendCounts.STABLE}</span>
                              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Stable</span>
                          </div>
                          <div className="w-px h-8 bg-slate-800" />
                          <div className="flex flex-col">
                              <span className="text-2xl font-black text-white">{trendCounts.DOWN}</span>
                              <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Declining</span>
                          </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-4 border-t border-slate-800 pt-3">Aggregated 90-day trajectory vectors</p>
                  </div>
              </div>

              {/* Data Grid Label */}
              <div className="flex items-center gap-3 pt-6 pb-2">
                  <div className="h-4 w-1 bg-blue-500 rounded-full" />
                  <h3 className="text-lg font-bold text-white tracking-wide">Algorithmic Scheme Matrix</h3>
                  <div className="flex-1 border-t border-slate-800 ml-4" />
              </div>

              {/* Advanced UI Cards instead of a boring table */}
              <div className="grid grid-cols-1 gap-4 lg:gap-6">
                {data.map((row, idx) => (
                    <div key={idx} className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 hover:bg-slate-800/50 transition-all duration-300">
                        {/* Top Banner indicating Risk Level */}
                        <div className={`h-1 w-full ${
                            row.predictions?.lapse_risk === 'High' ? 'bg-red-500' :
                            row.predictions?.lapse_risk === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />

                        <div className="p-5 lg:p-6">
                            {/* Card Header */}
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{row.entity_name}</h4>
                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                        <span className="uppercase tracking-widest font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded">{row.entity_id}</span>
                                        <span>•</span>
                                        <span>{row.ministry}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    {renderTrendIcon(row.predictions?.next_period_trend)}
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider border flex items-center gap-1.5 ${
                                        row.predictions?.forecast?.confidence === 'High' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        row.predictions?.forecast?.confidence === 'Medium' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                        'bg-slate-800 text-slate-400 border-slate-700'
                                    }`}>
                                        <Info size={12} />
                                        {row.predictions?.forecast?.confidence?.toUpperCase() || 'LOW'} CONFIDENCE
                                    </div>
                                </div>
                            </div>

                            {/* Main Grid Content */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                {/* Column 1: Utilization Progress */}
                                <div className="md:col-span-4 space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Year-to-Date Burn</span>
                                        <span className={`font-mono text-sm font-bold ${Number(row.current_status?.utilization_percent) > 0 ? "text-white" : "text-slate-500 uppercase text-[10px] tracking-widest bg-slate-800/50 px-2 py-0.5 rounded"}`}>
                                            {Number(row.current_status?.utilization_percent) > 0 ? `${row.current_status.utilization_percent}%` : 'NO SPEND'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 relative"
                                            style={{ width: `${Math.min(row.current_status?.utilization_percent || 0, 100)}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs font-mono text-slate-400">
                                        <span>Spent: {formatCurrency(row.current_status?.spent || 0).split('.')[0]}</span>
                                        <span>Alloc: {formatCurrency(row.current_status?.allocation || 0).split('.')[0]}</span>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="hidden md:block md:col-span-1 border-l border-slate-800 h-16 mx-auto" />

                                {/* Column 2: Threat Analysis */}
                                <div className="md:col-span-3 space-y-4">
                                     {renderRiskBadge(row.predictions?.lapse_risk, row.predictions?.risk_score)}
                                </div>

                                {/* Divider */}
                                <div className="hidden md:block md:col-span-1 border-l border-slate-800 h-16 mx-auto" />

                                {/* Column 3: Machine Output */}
                                <div className="md:col-span-3">
                                    <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 shadow-inner">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><BrainCircuit size={12}/> AI End-Year Projection</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-black text-white">{formatCurrency(row.predictions?.forecast?.predicted_unspent || 0).split('.')[0]}</span>
                                            <span className="text-xs text-slate-500">Unspent</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Explanations Accordion/Section */}
                            {row.explanation_factors && row.explanation_factors.length > 0 && (
                              <div className="mt-6 pt-4 border-t border-slate-800">
                                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-3">Model Inference Factors</p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {row.explanation_factors.map((factor, fIdx) => (
                                          <div key={fIdx} className="flex gap-2.5 items-start">
                                              <div className="mt-0.5 min-w-[12px]"><CheckCircle2 size={12} className="text-blue-500" /></div>
                                              <p className="text-xs text-slate-400 leading-relaxed">{factor}</p>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                            )}

                        </div>
                    </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default PredictiveModeling
