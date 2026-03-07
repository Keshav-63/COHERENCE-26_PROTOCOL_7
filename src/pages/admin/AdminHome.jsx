import React, { useState, useEffect, useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from 'recharts'
import Navigation from '../../components/Navigation'

/* ─── Light Theme Palette ─── */
const C = {
  bgMain: '#F8F9FB',
  bgCard: '#FFFFFF',
  textMain: '#1A1D26',
  textMuted: '#6B7280',
  accentBlue: '#1DA1F2',
  accentGreen: '#34A853',
  accentYellow: '#FBBC05',
  borderColor: '#E5E7EB',
}

const DONUT_COLORS = [C.accentBlue, '#CBD5E1', C.accentYellow, '#E2E8F0', '#6366f1']
const formatCrore = (v) => `₹${(v / 10000000).toFixed(1)} Cr`

/* ─── Tooltip ─── */
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.borderColor}`, borderRadius: 10, padding: '6px 10px', fontSize: 11, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <p style={{ color: C.textMuted, marginBottom: 2 }}>{label}</p>
      {payload.map((e, i) => (
        <div key={i} style={{ color: e.color, fontWeight: 600 }}>{e.name}: {e.value} Cr</div>
      ))}
    </div>
  )
}

/* ─── Card Wrapper ─── */
const Card = ({ children, className = '', style = {} }) => (
  <div className={className} style={{ background: C.bgCard, borderRadius: 16, padding: 20, border: `1px solid ${C.borderColor}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', ...style }}>
    {children}
  </div>
)

/* ─── Main Component ─── */
const AdminHome = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/analytics/admin-dashboard')
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalAllocation = data?.totalAllocation || 0
  const totalSpent = data?.totalSpent || 0
  const utilPct = totalAllocation ? ((totalSpent / totalAllocation) * 100).toFixed(2) : '0'

  // Chart 1: Allocation per ministry (Area)
  const ministryData = useMemo(() =>
    (data?.ministrywise || []).slice(0, 8).map((m, i) => ({
      x: m.ministry.split('&')[0].trim().slice(0, 8),
      allocated: Math.round(m.allocated / 10000000),
      utilized: Math.round(m.spent / 10000000),
    })), [data])

  // Chart 2 & 3: Monthly trend
  const trendData = useMemo(() =>
    (data?.monthlyTrend || []).map(t => ({
      x: t.month,
      allocated: Math.round(t.allocated / 10000000),
      utilized: Math.round(t.spent / 10000000),
      forecast: Math.round(t.forecast / 10000000),
    })), [data])

  // Donut: Top 4 ministries
  const donutData = useMemo(() =>
    (data?.ministrywise || []).slice(0, 4).map(m => ({
      name: m.ministry.split('&')[0].trim(),
      value: Math.round(m.allocated / 10000000),
    })), [data])

  const reallocationFeed = data?.reallocations || []

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bgMain, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="md:pl-72">
        <Navigation />
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #E5E7EB', borderTop: `3px solid ${C.accentBlue}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <p style={{ marginTop: 12, color: C.textMuted, fontSize: 14 }}>Loading dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bgMain, color: C.textMain, fontFamily: "'Inter', sans-serif" }} className="md:pl-72">
      <Navigation />

      <main style={{ padding: '20px 30px', maxWidth: 1400, margin: '0 auto' }}>



        <h1 style={{ marginBottom: 20, fontWeight: 600, fontSize: 24, color: C.textMain }}>Overview</h1>

        {/* ─── Dashboard Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {/* Card 1: Allocation Status (Comparative Bar) */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, fontSize: 14, color: C.textMuted }}>
              <span>Allocation Status ⓘ</span>
              <span style={{ background: 'rgba(29,161,242,0.2)', color: C.accentBlue, padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                {utilPct}%
              </span>
            </div>
            <div style={{ height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ministryData} barGap={2} barCategoryGap="20%">
                  <XAxis dataKey="x" tick={{ fill: C.textMuted, fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="allocated" name="Allocated" fill={C.accentBlue} radius={[3,3,0,0]} />
                  <Bar dataKey="utilized" name="Utilized" fill={C.accentYellow} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Card 2: Financial Velocity (Line) */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, fontSize: 14, color: C.textMuted }}>
              <span>Financial Velocity ⓘ</span>
              <span style={{ background: 'rgba(251,188,5,0.2)', color: C.accentYellow, padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                {trendData.length} months
              </span>
            </div>
            <div style={{ height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis dataKey="x" hide />
                  <YAxis hide />
                  <Tooltip content={<Tip />} />
                  <Line type="monotone" dataKey="allocated" name="Allocated" stroke={C.accentYellow} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="utilized" name="Utilized" stroke={C.textMuted} strokeWidth={1} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Card 3: Forecast Trend (Line) */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, fontSize: 14, color: C.textMuted }}>
              <span>Forecast Trend ⓘ</span>
              <span style={{ background: 'rgba(29,161,242,0.2)', color: C.accentBlue, padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                AI Model
              </span>
            </div>
            <div style={{ height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis dataKey="x" hide />
                  <YAxis hide />
                  <Tooltip content={<Tip />} />
                  <Line type="monotone" dataKey="forecast" name="Forecast" stroke={C.accentBlue} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="utilized" name="Utilized" stroke={C.textMuted} strokeWidth={1} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Card 4: Estimated Usage (span 2 cols) */}
          <Card className="md:col-span-2">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, fontSize: 14, color: C.textMuted }}>
              <span>Estimated Usage</span>
              <div style={{ display: 'flex', gap: 15, fontSize: 12, color: C.textMuted }}>
                <span>Today</span>
                <span style={{ color: C.textMain, fontWeight: 600 }}>Last Week</span>
                <span>Last Month</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
              <div style={{ fontSize: 28, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10, color: C.textMain }}>
                {formatCrore(totalSpent)}
                <span style={{ background: '#FEE2E2', color: '#EF4444', padding: '4px 8px', borderRadius: 6, fontSize: 12 }}>
                  {utilPct}%
                </span>
              </div>
            </div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid vertical={false} stroke={C.borderColor} />
                  <XAxis dataKey="x" tick={{ fill: C.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} orientation="right" width={40} />
                  <Tooltip content={<Tip />} />
                  <defs>
                    <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.accentBlue} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={C.accentBlue} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="utilized" name="Utilized" stroke={C.accentBlue} fill="url(#gE)" strokeWidth={3} />
                  <Area type="monotone" dataKey="forecast" name="Forecast" stroke={C.textMuted} fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Card 5: Current Allocation (Donut) */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, fontSize: 14 }}>
              <span style={{ color: C.textMain, fontWeight: 500 }}>Current Allocation</span>
              <span style={{ color: C.textMuted, fontSize: 12 }}>Live ●</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', width: 150, height: 150 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} dataKey="value" innerRadius={45} outerRadius={68} paddingAngle={3} cornerRadius={4} stroke="none" startAngle={90} endAngle={-270}>
                      {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: C.textMain }}>{Math.round(totalAllocation / 10000000)}</span>
                  <span style={{ fontSize: 9, color: C.textMuted }}>Total Cr</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
                {donutData.map((item, i) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 140 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.textMuted }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: DONUT_COLORS[i % DONUT_COLORS.length], display: 'inline-block' }} />
                      {item.name.slice(0, 10)}
                    </span>
                    <span style={{ color: C.textMain, fontWeight: 500 }}>{item.value} Cr</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Card 6: Reallocation History (span 3 cols) */}
          <Card className="md:col-span-2 xl:col-span-3">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                <h3 style={{ fontWeight: 600, fontSize: 16, color: C.textMain }}>Reallocation History</h3>
                <span style={{ background: 'rgba(29,161,242,0.2)', color: C.accentBlue, padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                  {reallocationFeed.length} movements
                </span>
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr>
                  {['#', 'From → To', 'Amount', 'Time', 'Status'].map((h, i) => (
                    <th key={i} style={{ color: C.textMuted, paddingBottom: 15, fontWeight: 400, textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reallocationFeed.map((txn, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '12px 0', borderTop: `1px solid ${C.borderColor}`, color: C.textMuted }}>{String(idx + 1).padStart(2, '0')}</td>
                    <td style={{ padding: '12px 0', borderTop: `1px solid ${C.borderColor}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, background: C.accentBlue, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 10, color: '#fff' }}>AI</div>
                        <div>
                          <div style={{ fontWeight: 600, color: C.textMain, fontSize: 12 }}>{txn.from}</div>
                          <div style={{ fontSize: 11, color: C.textMuted }}>→ {txn.to}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 0', borderTop: `1px solid ${C.borderColor}`, color: C.textMain, fontWeight: 500 }}>{txn.amount}</td>
                    <td style={{ padding: '12px 0', borderTop: `1px solid ${C.borderColor}`, color: C.textMuted, fontSize: 12 }}>{txn.time}</td>
                    <td style={{ padding: '12px 0', borderTop: `1px solid ${C.borderColor}`, textAlign: 'right' }}>
                      <span style={{ background: 'rgba(52,168,83,0.15)', color: C.accentGreen, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>Completed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

        </div>
      </main>
    </div>
  )
}

export default AdminHome