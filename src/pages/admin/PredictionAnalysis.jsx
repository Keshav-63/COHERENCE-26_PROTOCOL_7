import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts'
import { Brain, AlertTriangle, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react'
import Navigation from '../../components/Navigation'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/* ─── Helpers ─── */
const fmtCr = (v) => `₹${(v / 10000000).toFixed(1)} Cr`
const fmtPct = (v) => `${v.toFixed(1)}%`

const riskColor = (prob) => {
  if (prob >= 0.7) return '#EF4444'
  if (prob >= 0.4) return '#F59E0B'
  return '#10B981'
}
const riskLabel = (prob) => {
  if (prob >= 0.7) return 'HIGH'
  if (prob >= 0.4) return 'MEDIUM'
  return 'LOW'
}

/* ─── Sub-Components ─── */
const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div style={{
    background: '#fff', borderRadius: 16, padding: 24,
    border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    display: 'flex', gap: 16, alignItems: 'center'
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: 12,
      background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 500, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color: '#1A1D26' }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{sub}</p>}
    </div>
  </div>
)

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12,
      padding: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12
    }}>
      <p style={{ fontWeight: 600, marginBottom: 6, color: '#1A1D26' }}>{d.department}</p>
      <p style={{ color: '#6B7280' }}>Allocated: <b style={{ color: '#3B82F6' }}>{fmtCr(d.allocated_budget)}</b></p>
      <p style={{ color: '#6B7280' }}>Predicted Spend: <b style={{ color: '#10B981' }}>{fmtCr(d.predicted_spend)}</b></p>
      <p style={{ color: '#6B7280' }}>Est. Lapse: <b style={{ color: '#EF4444' }}>{fmtCr(d.estimated_lapse)}</b></p>
      <p style={{ color: '#6B7280' }}>Lapse Risk: <b style={{ color: riskColor(d.lapse_probability) }}>{fmtPct(d.lapse_probability * 100)}</b></p>
    </div>
  )
}

/* ─── Main Page ─── */
export default function PredictionAnalysis() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retraining, setRetraining] = useState(false)

  const fetchPredictions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/v1/analytics/predictions`)
      if (!res.ok) throw new Error('Failed to fetch predictions')
      const json = await res.json()
      setData(json.predictions || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRetrain = async () => {
    setRetraining(true)
    try {
      await fetch(`${API}/api/v1/analytics/train-models`, { method: 'POST' })
      await fetchPredictions()
    } catch (e) {
      console.error(e)
    } finally {
      setRetraining(false)
    }
  }

  useEffect(() => { fetchPredictions() }, [])

  /* ─── Computed Stats ─── */
  const totalAllocated = data.reduce((s, d) => s + d.allocated_budget, 0)
  const totalPredictedSpend = data.reduce((s, d) => s + d.predicted_spend, 0)
  const totalLapse = data.reduce((s, d) => s + d.estimated_lapse, 0)
  const avgRisk = data.length ? (data.reduce((s, d) => s + d.lapse_probability, 0) / data.length) : 0
  const highRiskCount = data.filter(d => d.lapse_probability >= 0.7).length

  /* ─── Chart data for comparison ─── */
  const comparisonData = data.map(d => ({
    ...d,
    name: d.department.length > 12 ? d.department.slice(0, 12) + '…' : d.department,
    alloc: d.allocated_budget / 10000000,
    pred: d.predicted_spend / 10000000,
    lapse: d.estimated_lapse / 10000000,
    nextBudget: d.recommended_next_budget / 10000000
  }))

  /* ─── Donut for risk distribution ─── */
  const riskBuckets = [
    { name: 'Low Risk', value: data.filter(d => d.lapse_probability < 0.4).length, color: '#10B981' },
    { name: 'Medium Risk', value: data.filter(d => d.lapse_probability >= 0.4 && d.lapse_probability < 0.7).length, color: '#F59E0B' },
    { name: 'High Risk', value: data.filter(d => d.lapse_probability >= 0.7).length, color: '#EF4444' }
  ].filter(b => b.value > 0)

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FB', fontFamily: "'Inter', sans-serif" }} className="md:pl-72">
      <Navigation />

      <main style={{ padding: '20px 30px', maxWidth: 1400, margin: '0 auto' }}>

        {/* ─── Header ─── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1A1D26', marginBottom: 4 }}>
              <Brain size={24} style={{ display: 'inline', marginRight: 10, verticalAlign: 'middle', color: '#7C3AED' }} />
              Prediction Analysis
            </h1>
            <p style={{ fontSize: 13, color: '#6B7280' }}>Advanced ML-based fund lapse prediction &amp; smart budget reallocation</p>
          </div>
          <button
            onClick={handleRetrain}
            disabled={retraining}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
              background: retraining ? '#D1D5DB' : '#7C3AED', color: '#fff',
              border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 13,
              cursor: retraining ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(124,58,237,0.25)'
            }}
          >
            <RefreshCw size={15} className={retraining ? 'animate-spin' : ''} />
            {retraining ? 'Retraining…' : 'Retrain Models'}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6B7280' }}>
            <div style={{ width: 40, height: 40, border: '4px solid #7C3AED', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
            <p>Loading ML predictions…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#EF4444' }}>
            <AlertTriangle size={40} style={{ margin: '0 auto 12px', display: 'block' }} />
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* ─── Stat Cards ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" style={{ marginBottom: 24 }}>
              <StatCard icon={TrendingUp} label="Total Allocated" value={fmtCr(totalAllocated)} color="#3B82F6" />
              <StatCard icon={TrendingDown} label="Total Predicted Spend" value={fmtCr(totalPredictedSpend)} color="#10B981" />
              <StatCard icon={AlertTriangle} label="Estimated Lapse" value={fmtCr(totalLapse)} sub={`${fmtPct((totalLapse / totalAllocated) * 100)} of allocation`} color="#EF4444" />
              <StatCard icon={Brain} label="Avg. Lapse Risk" value={fmtPct(avgRisk * 100)} sub={`${highRiskCount} high-risk dept${highRiskCount !== 1 ? 's' : ''}`} color="#7C3AED" />
            </div>

            {/* ─── Charts Row ─── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5" style={{ marginBottom: 24 }}>

              {/* Comparative Bar Chart */}
              <div style={{
                background: '#fff', borderRadius: 16, padding: 24,
                border: '1px solid #E5E7EB', gridColumn: 'span 2 / span 2'
              }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1A1D26', marginBottom: 18 }}>
                  Allocated vs Predicted Spend (₹ Cr)
                </h3>
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} barGap={3} barCategoryGap="25%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                      <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="alloc" name="Allocated" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pred" name="Predicted Spend" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="nextBudget" name="Recommended Next Yr" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Risk Distribution Donut */}
              <div style={{
                background: '#fff', borderRadius: 16, padding: 24,
                border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center'
              }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1A1D26', marginBottom: 12, alignSelf: 'flex-start' }}>
                  Risk Distribution
                </h3>
                <div style={{ height: 180, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskBuckets} dataKey="value" cx="50%" cy="50%"
                        innerRadius={50} outerRadius={75} paddingAngle={4}
                        stroke="none"
                      >
                        {riskBuckets.map((b, i) => <Cell key={i} fill={b.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                  {riskBuckets.map((b, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6B7280' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: b.color }} />
                      {b.name} ({b.value})
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── Department Risk Table ─── */}
            <div style={{
              background: '#fff', borderRadius: 16, padding: 24,
              border: '1px solid #E5E7EB'
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1A1D26', marginBottom: 18 }}>
                Department Lapse Risk — Ranked by Probability
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #F3F4F6' }}>
                      {['Department', 'Allocated', 'Predicted Spend', 'Est. Lapse', 'Lapse Risk', 'Next-Yr Budget', 'Adjust'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#6B7280', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((d, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #F9FAFB' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#1A1D26' }}>{d.department}</td>
                        <td style={{ padding: '12px', color: '#3B82F6', fontWeight: 500 }}>{fmtCr(d.allocated_budget)}</td>
                        <td style={{ padding: '12px', color: '#10B981', fontWeight: 500 }}>{fmtCr(d.predicted_spend)}</td>
                        <td style={{ padding: '12px', color: '#EF4444', fontWeight: 500 }}>{fmtCr(d.estimated_lapse)}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                            background: `${riskColor(d.lapse_probability)}15`,
                            color: riskColor(d.lapse_probability)
                          }}>
                            {riskLabel(d.lapse_probability)} — {fmtPct(d.lapse_probability * 100)}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#7C3AED' }}>{fmtCr(d.recommended_next_budget)}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            fontSize: 11, fontWeight: 600,
                            color: d.increase_pct >= 5 ? '#10B981' : '#F59E0B'
                          }}>
                            {d.increase_pct >= 5 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                            +{d.increase_pct.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
