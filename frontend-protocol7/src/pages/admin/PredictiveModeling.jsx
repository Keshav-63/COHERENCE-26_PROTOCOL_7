import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import Card from '../../components/Card'
import Navigation from '../../components/Navigation'
import Badge from '../../components/Badge'
import { formatCurrency } from '../../utils/utils'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const PredictiveModeling = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Dashboard state
  const [activeTab, setActiveTab] = useState('schemes')

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true)
        // Adjust headers if you have a real auth token mechanism here
        const response = await axios.get(`${API_BASE_URL}/api/v1/predictive-modeling/schemes`)
        setData(response.data)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch predictive models:', err)
        setError('Failed to load predictive data. Please check if the backend is running.')
      } finally {
        setLoading(false)
      }
    }

    fetchPredictions()
  }, [])

  // Process data for charts
  const highRiskCount = data.filter(d => d.predictions.lapse_risk === 'High').length
  const mediumRiskCount = data.filter(d => d.predictions.lapse_risk === 'Medium').length
  const lowRiskCount = data.filter(d => d.predictions.lapse_risk === 'Low').length
  
  const totalAllocation = data.reduce((acc, curr) => acc + curr.current_status.allocation, 0)
  const totalPredictedUnspent = data.reduce((acc, curr) => acc + curr.predictions.forecast.predicted_unspent, 0)
  const overallLapseRiskPercent = totalAllocation > 0 ? (totalPredictedUnspent / totalAllocation) * 100 : 0
  
  const trendCounts = {
      UP: data.filter(d => d.predictions.next_period_trend === 'UP').length,
      DOWN: data.filter(d => d.predictions.next_period_trend === 'DOWN').length,
      STABLE: data.filter(d => d.predictions.next_period_trend === 'STABLE').length
  }

  const renderTrendIcon = (trend) => {
    switch (trend) {
      case 'UP': return <TrendingUp className="text-emerald-500" size={20} />
      case 'DOWN': return <TrendingDown className="text-red-500" size={20} />
      case 'STABLE': return <Minus className="text-blue-500" size={20} />
      default: return null
    }
  }

  const renderRiskBadge = (risk) => {
    switch (risk) {
      case 'High': return <Badge variant="danger">High Risk</Badge>
      case 'Medium': return <Badge variant="warning">Medium</Badge>
      case 'Low': return <Badge variant="success">Low</Badge>
      default: return <Badge variant="default">{risk}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation role="admin" />

      <main className="md:ml-64 pt-20 md:pt-0">
        {/* Header */}
        <section className="bg-gradient-to-r from-primary-50 to-white border-b border-neutral-200 px-8 md:px-16 py-6 md:py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold font-display mb-2">
              <span className="gradient-text">Predictive Modeling Engine</span>
            </h1>
            <p className="text-neutral-600">
              AI-driven forecasting for Scheme Lapse Risk, Underutilization, and future spending trends.
            </p>
          </div>
        </section>

        <section className="px-8 md:px-16 py-6 md:py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {loading ? (
               <div className="flex flex-col items-center justify-center p-20">
                  <div className="w-12 h-12 border-4 border-primary-900 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-neutral-600">Running prediction models...</p>
               </div>
            ) : error ? (
                <Card shadow="none" className="bg-red-50 border-red-200">
                    <div className="flex items-center gap-3 text-red-600">
                        <AlertTriangle />
                        <p>{error}</p>
                    </div>
                </Card>
            ) : (
                <>
                {/* Executive Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card shadow="glass" className="border-l-4 border-l-red-500">
                        <h3 className="text-neutral-500 text-sm font-semibold uppercase tracking-wider mb-2">Portfolio At Risk</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-neutral-900">₹{formatCurrency(totalPredictedUnspent).split('.')[0]}</span>
                            <span className="text-sm font-medium text-red-600 mb-1">({overallLapseRiskPercent.toFixed(1)}%)</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-2">Predicted total unspent allocation by year-end</p>
                    </Card>

                    <Card shadow="glass" className="border-l-4 border-l-orange-500">
                        <h3 className="text-neutral-500 text-sm font-semibold uppercase tracking-wider mb-2">High Risk Schemes</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-neutral-900">{highRiskCount}</span>
                            <span className="text-sm font-medium text-neutral-600 mb-1">/ {data.length} Total</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-2">Schemes requiring immediate intervention</p>
                    </Card>

                    <Card shadow="glass" className="border-l-4 border-l-blue-500">
                        <h3 className="text-neutral-500 text-sm font-semibold uppercase tracking-wider mb-2">Spending Momentum</h3>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1"><TrendingUp size={16} className="text-emerald-500"/> <span className="font-bold">{trendCounts.UP}</span></div>
                            <div className="flex items-center gap-1"><Minus size={16} className="text-blue-500"/> <span className="font-bold">{trendCounts.STABLE}</span></div>
                            <div className="flex items-center gap-1"><TrendingDown size={16} className="text-red-500"/> <span className="font-bold">{trendCounts.DOWN}</span></div>
                        </div>
                        <p className="text-xs text-neutral-500 mt-3">Next period trend across all evaluated schemes</p>
                    </Card>
                </div>

                {/* Detailed Scheme Table */}
                <Card shadow="glass">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold">Scheme Intelligence Board</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-neutral-200 bg-neutral-50/50">
                          <th className="text-left py-4 px-4 font-bold text-neutral-700 rounded-tl-lg">Scheme & Ministry</th>
                          <th className="text-left py-4 px-4 font-bold text-neutral-700">Financials (Current)</th>
                          <th className="text-left py-4 px-4 font-bold text-neutral-700">Lapse Risk</th>
                          <th className="text-left py-4 px-4 font-bold text-neutral-700">Forecast (Year-End)</th>
                          <th className="text-left py-4 px-4 font-bold text-neutral-700 rounded-tr-lg">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {data.map((row, idx) => (
                          <tr key={idx} className="hover:bg-primary-50/30 transition-colors">
                            <td className="py-4 px-4 align-top">
                                <p className="font-bold text-neutral-900">{row.entity_name}</p>
                                <p className="text-xs text-neutral-500">{row.ministry}</p>
                                <p className="text-xs font-mono text-neutral-400 mt-1">{row.entity_id}</p>
                            </td>
                            <td className="py-4 px-4 align-top">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-neutral-500">Allocated:</span>
                                        <span className="font-medium">₹{formatCurrency(row.current_status.allocation).split('.')[0]}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-neutral-500">Spent M{row.current_status.current_month}:</span>
                                        <span className="font-medium text-emerald-600">₹{formatCurrency(row.current_status.spent).split('.')[0]}</span>
                                    </div>
                                    <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-2">
                                        <div 
                                            className="bg-primary-600 h-1.5 rounded-full" 
                                            style={{ width: `${Math.min(row.current_status.utilization_percent, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-right text-neutral-500 font-medium">{row.current_status.utilization_percent}% utilized</p>
                                </div>
                            </td>
                            <td className="py-4 px-4 align-top">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        {renderRiskBadge(row.predictions.lapse_risk)}
                                        <span className="text-xs text-neutral-400 font-mono">Score: {row.predictions.risk_score}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2" title="Next period spending trend">
                                        <span className="text-xs font-medium text-neutral-500">Next Period:</span>
                                        <div className="flex items-center gap-1 font-bold text-sm">
                                            {renderTrendIcon(row.predictions.next_period_trend)}
                                            {row.predictions.next_period_trend}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-4 align-top">
                                <div className="p-2 rounded bg-neutral-50 border border-neutral-100">
                                    <p className="text-xs text-neutral-600 mb-1">Predicted Lapse:</p>
                                    <p className="font-bold text-red-600">₹{formatCurrency(row.predictions.forecast.predicted_unspent).split('.')[0]}</p>
                                    <p className="text-[10px] text-neutral-400 mt-1">
                                        Confidence: <strong className={row.predictions.forecast.confidence === 'High' ? 'text-emerald-600' : 'text-orange-500'}>{row.predictions.forecast.confidence}</strong>
                                    </p>
                                </div>
                            </td>
                            <td className="py-4 px-4 align-top max-w-[250px]">
                                <ul className="text-xs text-neutral-600 space-y-2 list-disc pl-4">
                                    {row.explanation_factors.map((factor, fIdx) => (
                                        <li key={fIdx}>{factor}</li>
                                    ))}
                                </ul>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
                </>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default PredictiveModeling

