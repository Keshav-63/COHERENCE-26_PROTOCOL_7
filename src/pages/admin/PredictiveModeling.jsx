import React, { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, AlertTriangle } from 'lucide-react'
import Card from '../../components/Card'
import Navigation from '../../components/Navigation'
import Badge from '../../components/Badge'
import { formatCurrency } from '../../utils/utils'
import { PREDICTIVE_MODELS, RISK_FORECAST } from '../../utils/mockData'
import { useAuth } from '../../context/AuthContext'

const PredictiveModeling = () => {
  const { user, admin } = useAuth()
  const [selectedModel, setSelectedModel] = useState('budget')
  const [activeState, setActiveState] = useState('all')

  // Determine user role for navigation
  const currentUser = user || admin
  const userRole = currentUser?.role || 'admin'

  // Prepare chart data
  const budgetForecastData = PREDICTIVE_MODELS.map((item) => ({
    year: item.fiscal_year,
    'Andhra Pradesh': item.andhra_pradesh / 1000000000,
    'Karnataka': item.karnataka / 1000000000,
    'Maharashtra': item.maharashtra / 1000000000,
    'Uttar Pradesh': item.uttar_pradesh / 1000000000,
    'Tamil Nadu': item.tamil_nadu / 1000000000,
  }))

  const riskForecastByState = RISK_FORECAST.map((item) => ({
    state: item.state,
    lapseRisk: item.lapse_risk,
  }))

  const models = [
    {
      id: 'budget',
      title: 'Budget Forecast',
      description: 'Predicted budget allocation for next 3 fiscal years',
    },
    {
      id: 'risk',
      title: 'Risk Assessment',
      description: 'Predicted lapse and underutilization risks',
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation role={userRole} />

      <main className="md:ml-64 pt-20 md:pt-0">
        {/* Header */}
        <section className="bg-gradient-to-r from-primary-50 to-white border-b border-neutral-200 px-8 md:px-16 py-6 md:py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold font-display mb-2">
                  <span className="gradient-text">Predictive Modeling</span>
                </h1>
                <p className="text-neutral-600">
                  AI-powered forecasting for optimal budget allocation and risk management
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-8 md:px-16 py-6 md:py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Model Selection */}
            <div className="flex gap-4 flex-wrap">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedModel === model.id
                      ? 'border-primary-900 bg-primary-50'
                      : 'border-neutral-200 bg-white hover:border-primary-900'
                  }`}
                >
                  <p className="font-bold text-neutral-900">{model.title}</p>
                  <p className="text-sm text-neutral-600">{model.description}</p>
                </button>
              ))}
            </div>

            {/* Budget Forecast Model */}
            {selectedModel === 'budget' && (
              <div className="space-y-6">
                <Card shadow="glass">
                  <h3 className="text-2xl font-bold mb-4">3-Year Budget Forecast</h3>
                  <div className="overflow-x-auto">
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={budgetForecastData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                        <XAxis dataKey="year" />
                        <YAxis label={{ value: 'Billion INR', angle: -90, position: 'insideLeft' }} />
                        <Tooltip
                          formatter={(value) => `₹${value.toFixed(2)}B`}
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="Andhra Pradesh" stroke="#0052FF" strokeWidth={2} />
                        <Line type="monotone" dataKey="Karnataka" stroke="#4D7CFF" strokeWidth={2} />
                        <Line type="monotone" dataKey="Maharashtra" stroke="#00d9ff" strokeWidth={2} />
                        <Line type="monotone" dataKey="Uttar Pradesh" stroke="#10b981" strokeWidth={2} />
                        <Line type="monotone" dataKey="Tamil Nadu" stroke="#f97316" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card shadow="glass">
                    <h3 className="text-xl font-bold mb-4">Key Insights</h3>
                    <ul className="space-y-3 text-neutral-700">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-900 text-white flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                        <span>
                          <strong>Growth Trend:</strong> Overall budget allocation predicted to grow by 8-12% annually
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-900 text-white flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                        <span>
                          <strong>Top Growth:</strong> Maharashtra and Uttar Pradesh expected to see highest growth
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-900 text-white flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                        <span>
                          <strong>Stable Performers:</strong> Karnataka and Tamil Nadu show consistent growth patterns
                        </span>
                      </li>
                    </ul>
                  </Card>

                  <Card shadow="glass">
                    <h3 className="text-xl font-bold mb-4">Recommendations</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <p className="text-sm font-medium text-emerald-900">
                          Allocate additional resources to high-growth states while maintaining support for stable performers
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">
                          Plan infrastructure projects aligned with predicted budget trends
                        </p>
                      </div>
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm font-medium text-orange-900">
                          Implement capacity building in states with projected budget growth
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card shadow="glass">
                  <h3 className="text-xl font-bold mb-4">Detailed Forecast</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-neutral-200">
                          <th className="text-left py-3 px-4 font-bold">State</th>
                          <th className="text-left py-3 px-4 font-bold">2024-25</th>
                          <th className="text-left py-3 px-4 font-bold">2025-26</th>
                          <th className="text-left py-3 px-4 font-bold">2026-27</th>
                          <th className="text-left py-3 px-4 font-bold">Growth Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            state: 'Andhra Pradesh',
                            y1: 2500000000,
                            y2: 2600000000,
                            y3: 2750000000,
                          },
                          {
                            state: 'Karnataka',
                            y1: 2200000000,
                            y2: 2400000000,
                            y3: 2550000000,
                          },
                          {
                            state: 'Maharashtra',
                            y1: 2800000000,
                            y2: 2950000000,
                            y3: 3100000000,
                          },
                          {
                            state: 'Uttar Pradesh',
                            y1: 3100000000,
                            y2: 3250000000,
                            y3: 3400000000,
                          },
                          {
                            state: 'Tamil Nadu',
                            y1: 2000000000,
                            y2: 2150000000,
                            y3: 2300000000,
                          },
                        ].map((row, idx) => {
                          const growth = (((row.y3 - row.y1) / row.y1) * 100) / 2
                          return (
                            <tr key={idx} className="border-b border-neutral-100 hover:bg-neutral-50">
                              <td className="py-3 px-4 font-medium">{row.state}</td>
                              <td className="py-3 px-4">{formatCurrency(row.y1).split('.')[0]}</td>
                              <td className="py-3 px-4">{formatCurrency(row.y2).split('.')[0]}</td>
                              <td className="py-3 px-4">{formatCurrency(row.y3).split('.')[0]}</td>
                              <td className="py-3 px-4">
                                <Badge variant="success">{growth.toFixed(1)}%</Badge>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* Risk Forecast Model */}
            {selectedModel === 'risk' && (
              <div className="space-y-6">
                <Card shadow="glass">
                  <h3 className="text-2xl font-bold mb-4">Budget Lapse Risk Forecast</h3>
                  <div className="overflow-x-auto">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={riskForecastByState}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                        <XAxis dataKey="state" angle={-45} textAnchor="end" height={100} />
                        <YAxis label={{ value: 'Risk Level (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip
                          formatter={(value) => `${value}%`}
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5' }}
                        />
                        <Bar dataKey="lapseRisk" fill="#ef4444" name="Lapse Risk %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card shadow="glass">
                    <h3 className="text-xl font-bold mb-4">Risk Categories</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs font-medium text-red-900 mb-1">{'CRITICAL RISK (>35%)'}</p>
                        <p className="text-sm text-red-800">
                          {RISK_FORECAST.filter(r => r.lapse_risk > 35).map(r => r.state).join(', ')}
                        </p>
                      </div>
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-xs font-medium text-orange-900 mb-1">{'HIGH RISK (20-35%)'}</p>
                        <p className="text-sm text-orange-800">
                          {RISK_FORECAST.filter(r => r.lapse_risk >= 20 && r.lapse_risk <= 35)
                            .map(r => r.state)
                            .join(', ') || 'None'}
                        </p>
                      </div>
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <p className="text-xs font-medium text-emerald-900 mb-1">{'LOW RISK (<20%)'}</p>
                        <p className="text-sm text-emerald-800">
                          {RISK_FORECAST.filter(r => r.lapse_risk < 20)
                            .map(r => r.state)
                            .join(', ')}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card shadow="glass">
                    <h3 className="text-xl font-bold mb-4">Mitigation Strategies</h3>
                    <ul className="space-y-2 text-sm text-neutral-700">
                      <li className="flex gap-2">
                        <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <span><strong>High Risk States:</strong> Increase monitoring and support mechanisms</span>
                      </li>
                      <li className="flex gap-2">
                        <AlertTriangle size={16} className="text-orange-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Medium Risk:</strong> Implement capacity building programs</span>
                      </li>
                      <li className="flex gap-2">
                        <AlertTriangle size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Low Risk:</strong> Maintain current support structure</span>
                      </li>
                    </ul>
                  </Card>
                </div>

                <Card shadow="glass">
                  <h3 className="text-xl font-bold mb-4">Detailed Risk Assessment</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-neutral-200">
                          <th className="text-left py-3 px-4 font-bold">State</th>
                          <th className="text-left py-3 px-4 font-bold">Lapse Risk</th>
                          <th className="text-left py-3 px-4 font-bold">Underutilization Risk</th>
                          <th className="text-left py-3 px-4 font-bold">Recommendation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {RISK_FORECAST.map((risk, idx) => (
                          <tr key={idx} className="border-b border-neutral-100 hover:bg-neutral-50">
                            <td className="py-3 px-4 font-medium">{risk.state}</td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  risk.lapse_risk > 35 ? 'danger' : risk.lapse_risk > 20 ? 'warning' : 'success'
                                }
                              >
                                {risk.lapse_risk}%
                              </Badge>
                            </td>
                            <td className="py-3 px-4 capitalize text-neutral-700">{risk.underutilization_risk}</td>
                            <td className="py-3 px-4">{risk.recommendation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default PredictiveModeling
