import React, { useState } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Filter } from 'lucide-react'
import Card from '../../components/Card'
import Navigation from '../../components/Navigation'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import { formatCurrency, formatPercentage } from '../../utils/utils'
import { BUDGET_DATA } from '../../utils/mockData'
import { useAuth } from '../../context/AuthContext'

const COLORS = ['#0052FF', '#4D7CFF', '#00d9ff', '#10b981', '#f97316']

const BudgetAnalytics = () => {
  const { user, admin } = useAuth()
  const [activeTab, setActiveTab] = useState('statewise')
  const [selectedState, setSelectedState] = useState(null)

  // Determine user role for navigation
  const currentUser = user || admin
  const userRole = currentUser?.role || 'admin'

  const tabs = [
    { id: 'statewise', label: 'State-wise Analysis' },
    { id: 'ministrywise', label: 'Ministry-wise Analysis' },
    { id: 'trend', label: 'Monthly Trend' },
  ]

  const stateData = BUDGET_DATA.statewise.map((s) => ({
    name: s.state.substring(0, 3).toUpperCase(),
    fullName: s.state,
    allocated: s.allocated / 1000000000,
    spent: s.spent / 1000000000,
    percentage: s.percentage,
  }))

  const ministryData = BUDGET_DATA.ministrywise.map((m) => ({
    name: m.ministry.substring(0, 4),
    fullName: m.ministry,
    allocated: m.allocated / 1000000000,
    spent: m.spent / 1000000000,
    percentage: m.percentage,
  }))

  const trendData = BUDGET_DATA.monthlyTrend.map((t) => ({
    name: t.month,
    allocated: t.allocated / 1000000000,
    spent: t.spent / 1000000000,
  }))

  const pieData = BUDGET_DATA.statewise.slice(0, 5).map((s) => ({
    name: s.state,
    value: s.spent / 1000000000,
  }))

  const renderContent = () => {
    switch (activeTab) {
      case 'statewise':
        return (
          <div className="space-y-6">
            <Card shadow="glass">
              <h3 className="text-xl font-bold mb-4">State-wise Budget Allocation vs Spending</h3>
              <div className="overflow-x-auto">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={stateData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Billion INR', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      formatter={(value) => `₹${value.toFixed(2)}B`}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5' }}
                    />
                    <Legend />
                    <Bar dataKey="allocated" fill="#0052FF" name="Allocated" />
                    <Bar dataKey="spent" fill="#10b981" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card shadow="glass">
                <h3 className="text-lg font-bold mb-4">Budget Utilization Rate</h3>
                <div className="space-y-3">
                  {BUDGET_DATA.statewise.map((state, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{state.state}</span>
                        <span className="text-sm font-bold text-primary-900">{state.percentage}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div
                          className="bg-primary-900 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${state.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card shadow="glass">
                <h3 className="text-lg font-bold mb-4">Top 5 States by Spending</h3>
                <div className="overflow-x-auto">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ₹${value.toFixed(1)}B`}
                        outerRadius={80}
                        fill="#0052FF"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toFixed(2)}B`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        )

      case 'ministrywise':
        return (
          <div className="space-y-6">
            <Card shadow="glass">
              <h3 className="text-xl font-bold mb-4">Ministry-wise Budget Distribution</h3>
              <div className="overflow-x-auto">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={ministryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip
                      formatter={(value) => `₹${value.toFixed(2)}B`}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5' }}
                    />
                    <Legend />
                    <Bar dataKey="allocated" fill="#0052FF" name="Allocated" />
                    <Bar dataKey="spent" fill="#10b981" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card shadow="glass">
              <h3 className="text-lg font-bold mb-4">Ministry Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 px-4 font-bold">Ministry</th>
                      <th className="text-left py-3 px-4 font-bold">Allocated</th>
                      <th className="text-left py-3 px-4 font-bold">Spent</th>
                      <th className="text-left py-3 px-4 font-bold">Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BUDGET_DATA.ministrywise.map((ministry, idx) => (
                      <tr key={idx} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="py-3 px-4 font-medium">{ministry.ministry}</td>
                        <td className="py-3 px-4">{formatCurrency(ministry.allocated).split('.')[0]}</td>
                        <td className="py-3 px-4">{formatCurrency(ministry.spent).split('.')[0]}</td>
                        <td className="py-3 px-4">
                          <Badge variant={ministry.percentage > 90 ? 'success' : 'warning'}>
                            {ministry.percentage}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )

      case 'trend':
        return (
          <Card shadow="glass">
            <h3 className="text-xl font-bold mb-4">Monthly Budget Spending Trend (FY 2024-25)</h3>
            <div className="overflow-x-auto">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Billion INR', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    formatter={(value) => `₹${value.toFixed(2)}B`}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="allocated"
                    stroke="#0052FF"
                    strokeWidth={2}
                    dot={{ fill: '#0052FF', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Allocated"
                  />
                  <Line
                    type="monotone"
                    dataKey="spent"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Spent"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )

      default:
        return null
    }
  }

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
                  <span className="gradient-text">Budget Analytics</span>
                </h1>
                <p className="text-neutral-600">
                  Comprehensive analysis of budget allocation and spending patterns
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-8 md:px-16 py-6 md:py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-900 text-white shadow-lg'
                      : 'bg-white text-neutral-700 border border-neutral-200 hover:border-primary-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            {renderContent()}
          </div>
        </section>
      </main>
    </div>
  )
}

export default BudgetAnalytics
