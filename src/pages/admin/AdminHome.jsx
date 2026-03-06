// import React from 'react'
// import { Link } from 'react-router-dom'
// import {
//   Activity,
//   AlertTriangle,
//   ArrowRight,
//   Landmark,
//   RefreshCw,
//   Wallet,
// } from 'lucide-react'
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   Cell,
//   Legend,
//   Line,
//   LineChart,
//   Pie,
//   PieChart,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from 'recharts'
// import Navigation from '../../components/Navigation'
// import Card from '../../components/Card'
// import Badge from '../../components/Badge'
// import { ANOMALIES, BUDGET_DATA } from '../../utils/mockData'
// import { formatCurrency } from '../../utils/utils'

// const COLORS = ['#0f766e', '#1d4ed8', '#b45309', '#be123c', '#047857']

// const toCrore = (value) => `${(value / 10000000).toFixed(1)} Cr`

// const AdminHome = () => {
//   const totalBudget = BUDGET_DATA.totalAllocation
//   const utilizedBudget = BUDGET_DATA.totalSpent
//   const remainingBudget = totalBudget - utilizedBudget

//   const comparisonData = BUDGET_DATA.ministrywise.slice(0, 6).map((item) => ({
//     department: item.ministry.split('&')[0].trim(),
//     allocated: Math.round(item.allocated / 10000000),
//     utilized: Math.round(item.spent / 10000000),
//   }))

//   const distributionData = BUDGET_DATA.ministrywise.slice(0, 5).map((item) => ({
//     name: item.ministry.split('&')[0].trim(),
//     value: item.allocated,
//   }))

//   const trendData = BUDGET_DATA.monthlyTrend.map((item) => ({
//     month: item.month,
//     utilized: Math.round(item.spent / 10000000),
//   }))

//   const reallocationFeed = [
//     { from: 'Pune Health Dept', to: 'Mumbai Health Dept', amount: '4.2M', time: '2 mins ago' },
//     { from: 'Nagpur Transport', to: 'Nashik Transport', amount: '2.1M', time: '9 mins ago' },
//     { from: 'Thane Health Dept', to: 'Mumbai Health Dept', amount: '1.3M', time: '15 mins ago' },
//     { from: 'Delhi Education', to: 'UP Education', amount: '3.8M', time: '23 mins ago' },
//     { from: 'Goa Infra', to: 'Karnataka Infra', amount: '1.9M', time: '31 mins ago' },
//   ]

//   const stressData = [
//     { name: 'Mumbai Health Dept', score: 88 },
//     { name: 'Pune Health Dept', score: 62 },
//     { name: 'Nagpur Health Dept', score: 27 },
//     { name: 'UP Infra Cell', score: 74 },
//     { name: 'Rajasthan Education', score: 51 },
//   ]

//   const kpiCards = [
//     {
//       title: 'Total National Budget',
//       value: formatCurrency(totalBudget),
//       icon: Landmark,
//       tone: 'text-blue-700 bg-blue-50 border-blue-200',
//     },
//     {
//       title: 'Total Utilized Budget',
//       value: formatCurrency(utilizedBudget),
//       icon: Wallet,
//       tone: 'text-emerald-700 bg-emerald-50 border-emerald-200',
//     },
//     {
//       title: 'Remaining Budget',
//       value: formatCurrency(remainingBudget),
//       icon: Activity,
//       tone: 'text-amber-700 bg-amber-50 border-amber-200',
//     },
//     {
//       title: 'AI Reallocation Events',
//       value: '126',
//       icon: RefreshCw,
//       tone: 'text-cyan-700 bg-cyan-50 border-cyan-200',
//     },
//     {
//       title: 'Anomaly Alerts',
//       value: `${ANOMALIES.length}`,
//       icon: AlertTriangle,
//       tone: 'text-rose-700 bg-rose-50 border-rose-200',
//     },
//   ]

//   const riskColor = (score) => {
//     if (score >= 75) return 'bg-red-500'
//     if (score >= 45) return 'bg-amber-400'
//     return 'bg-emerald-500'
//   }

//   const riskLabel = (score) => {
//     if (score >= 75) return 'Critical'
//     if (score >= 45) return 'Moderate'
//     return 'Healthy'
//   }

//   return (
//     <div className="min-h-screen flex bg-slate-100">
//       <Navigation role="admin" />

//       <main className="flex-1 pt-20 md:pt-0 overflow-x-hidden">
//         <section className="px-4 md:px-8 py-8">
//           <div className="max-w-7xl mx-auto space-y-6">
//             <div className="flex flex-wrap items-center justify-between gap-3">
//               <div>
//                 <h1 className="text-3xl font-bold text-slate-900">National Financial Command Dashboard</h1>
//                 <p className="text-slate-600 text-sm">Strategic overview of allocation, utilization, anomalies, and AI-led reallocation.</p>
//               </div>
//               <Link to="/admin/intelligence" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800">
//                 Open intelligence console <ArrowRight size={16} />
//               </Link>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
//               {kpiCards.map((item) => {
//                 const Icon = item.icon
//                 return (
//                   <Card key={item.title} className="p-4">
//                     <div className="flex items-start justify-between gap-3">
//                       <div>
//                         <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{item.title}</p>
//                         <p className="text-xl font-bold text-slate-900 mt-2">{item.value}</p>
//                       </div>
//                       <div className={`p-2 rounded-lg border ${item.tone}`}>
//                         <Icon size={18} />
//                       </div>
//                     </div>
//                   </Card>
//                 )
//               })}
//             </div>

//             <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
//               <Card className="xl:col-span-2">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-lg font-bold text-slate-900">Budget Allocation Analysis</h2>
//                   <Badge variant="info">Allocated vs Utilized</Badge>
//                 </div>
//                 <div className="h-72">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={comparisonData}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
//                       <XAxis dataKey="department" stroke="#64748b" fontSize={12} />
//                       <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `${value}Cr`} />
//                       <Tooltip formatter={(value) => `${value} Cr`} />
//                       <Legend />
//                       <Bar dataKey="allocated" fill="#1d4ed8" radius={[6, 6, 0, 0]} name="Allocated Budget" />
//                       <Bar dataKey="utilized" fill="#0f766e" radius={[6, 6, 0, 0]} name="Utilized Budget" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </Card>

//               <Card>
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-lg font-bold text-slate-900">Financial Distribution</h2>
//                   <Badge variant="gray">Donut View</Badge>
//                 </div>
//                 <div className="h-72 relative">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={distributionData}
//                         dataKey="value"
//                         nameKey="name"
//                         innerRadius={68}
//                         outerRadius={100}
//                         paddingAngle={2}
//                       >
//                         {distributionData.map((entry, index) => (
//                           <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
//                         ))}
//                       </Pie>
//                       <Tooltip formatter={(value) => toCrore(value)} />
//                     </PieChart>
//                   </ResponsiveContainer>
//                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                     <div className="text-center">
//                       <p className="text-xs text-slate-500 uppercase">Total Budget</p>
//                       <p className="text-sm font-bold text-slate-900">{toCrore(totalBudget)}</p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="space-y-2 mt-1">
//                   {distributionData.map((item, index) => (
//                     <div key={item.name} className="flex items-center justify-between text-sm">
//                       <div className="flex items-center gap-2">
//                         <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
//                         <span className="text-slate-700">{item.name}</span>
//                       </div>
//                       <span className="font-semibold text-slate-900">{((item.value / totalBudget) * 100).toFixed(1)}%</span>
//                     </div>
//                   ))}
//                 </div>
//               </Card>
//             </div>

//             <Card>
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-bold text-slate-900">Financial Behaviour Monitoring</h2>
//                 <Badge variant="success">Monthly Utilization Trend</Badge>
//               </div>
//               <div className="h-72">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={trendData}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
//                     <XAxis dataKey="month" stroke="#64748b" />
//                     <YAxis stroke="#64748b" tickFormatter={(value) => `${value}Cr`} />
//                     <Tooltip formatter={(value) => `${value} Cr`} />
//                     <Line
//                       type="monotone"
//                       dataKey="utilized"
//                       stroke="#0f766e"
//                       strokeWidth={3}
//                       dot={{ fill: '#0f766e', r: 4 }}
//                       activeDot={{ r: 6 }}
//                       name="Utilized Budget"
//                     />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             </Card>

//             <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-8">
//               <Card>
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-lg font-bold text-slate-900">AI Budget Reallocation Activity Feed</h2>
//                   <Badge variant="info">Live Feed</Badge>
//                 </div>
//                 <div className="space-y-3">
//                   {reallocationFeed.map((txn) => (
//                     <div key={`${txn.from}-${txn.to}-${txn.time}`} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3">
//                       <div>
//                         <p className="text-sm font-semibold text-slate-900">{txn.from} <span className="text-slate-500">to</span> {txn.to}</p>
//                         <p className="text-xs text-slate-500">{txn.time}</p>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-sm font-bold text-slate-900">Rs {txn.amount}</p>
//                         <p className="text-xs text-cyan-700 font-medium">AI generated</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </Card>

//               <Card>
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-lg font-bold text-slate-900">Budget Stress Heatmap</h2>
//                   <Badge variant="warning">Risk Bars</Badge>
//                 </div>
//                 <div className="space-y-4">
//                   {stressData.map((item) => (
//                     <div key={item.name}>
//                       <div className="flex items-center justify-between text-sm mb-1">
//                         <span className="font-medium text-slate-700">{item.name}</span>
//                         <span className="font-semibold text-slate-900">{riskLabel(item.score)}</span>
//                       </div>
//                       <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
//                         <div className={`h-full ${riskColor(item.score)}`} style={{ width: `${item.score}%` }} />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </Card>
//             </div>
//           </div>
//         </section>
//       </main>
//     </div>
//   )
// }

// export default AdminHome






import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity, AlertTriangle, ArrowRight, Landmark, RefreshCw, Wallet,
  BarChart2, PieChart as PieIcon, TrendingUp, Hexagon, ActivitySquare
} from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Area, AreaChart, Line, LineChart,
  Pie, PieChart, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import Navigation from '../../components/Navigation'
import { ANOMALIES, BUDGET_DATA } from '../../utils/mockData'

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6']

const formatCurrency = (value) => `₹${(value / 10000000).toFixed(1)} Cr`

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100/50">
        <p className="font-bold text-slate-800 mb-3 tracking-wide">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-6 text-sm mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-slate-500 font-medium">{entry.name}:</span>
            </div>
            <span className="font-extrabold text-slate-900">{entry.value} Cr</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const ChartToggle = ({ active, options, onChange }) => (
  <div className="flex items-center bg-slate-100/80 backdrop-blur-sm p-1 rounded-xl border border-slate-200/50">
    {options.map((opt) => {
      const Icon = opt.icon
      return (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`p-1.5 rounded-lg flex items-center justify-center transition-all duration-300 ${
            active === opt.id ? 'bg-white text-indigo-600 shadow-sm scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
          title={opt.label}
        >
          <Icon size={16} strokeWidth={active === opt.id ? 2.5 : 2} />
        </button>
      )
    })}
  </div>
)

const AdminHome = () => {
  const [allocChart, setAllocChart] = useState('bar')
  const [distChart, setDistChart] = useState('pie')
  const [trendChart, setTrendChart] = useState('area')

  const comparisonData = BUDGET_DATA.ministrywise.slice(0, 6).map((item) => ({
    department: item.ministry.split('&')[0].trim(),
    allocated: Math.round(item.allocated / 10000000),
    utilized: Math.round(item.spent / 10000000),
  }))

  const distributionData = BUDGET_DATA.ministrywise.slice(0, 5).map((item) => ({
    name: item.ministry.split('&')[0].trim(),
    value: Math.round(item.allocated / 10000000),
  }))

  const trendData = BUDGET_DATA.monthlyTrend.map((item) => ({
    month: item.month,
    utilized: Math.round(item.spent / 10000000),
  }))

  const kpiCards = [
    { title: 'Total National Budget', value: formatCurrency(BUDGET_DATA.totalAllocation), icon: Landmark, gradient: 'from-blue-500 to-indigo-600' },
    { title: 'Total Utilized', value: formatCurrency(BUDGET_DATA.totalSpent), icon: Wallet, gradient: 'from-emerald-400 to-teal-500' },
    { title: 'Remaining Reserve', value: formatCurrency(BUDGET_DATA.totalAllocation - BUDGET_DATA.totalSpent), icon: Activity, gradient: 'from-amber-400 to-orange-500' },
    { title: 'AI Reallocations', value: '126', icon: RefreshCw, gradient: 'from-cyan-400 to-blue-500' },
    { title: 'Anomaly Alerts', value: ANOMALIES.length, icon: AlertTriangle, gradient: 'from-rose-400 to-red-500' },
  ]

  return (
    <div className="min-h-screen flex bg-[#f8fafc] font-sans selection:bg-indigo-100">
      <Navigation role="admin" />

      <main className="flex-1 pt-20 md:pt-0 overflow-x-hidden">
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold tracking-widest uppercase mb-3">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span></span> Live System
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">National Command Center</h1>
            </div>
            <Link to="/admin/intelligence" className="group relative px-6 py-3 font-bold text-white rounded-xl bg-slate-900 hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">Intelligence Console <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            </Link>
          </div>

          {/* Layer 1: Strategic Overview (KPIs) */}
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-5">
            {kpiCards.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="relative p-6 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group overflow-hidden">
                  <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${item.gradient} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700 ease-out`} />
                  <div className="relative z-10">
                    <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg shadow-${item.gradient.split('-')[1]}/30 mb-4 text-white transform group-hover:-translate-y-1 transition-transform`}>
                      <Icon size={22} strokeWidth={2.5} />
                    </div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">{item.value}</p>
                    <p className="text-sm font-semibold text-slate-500 mt-1">{item.title}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Layers 2 & 3: Allocation Analysis & Financial Distribution */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Layer 2: Interactive Allocation Chart */}
            <div className="xl:col-span-2 p-6 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Allocation vs Utilization</h2>
                  <p className="text-sm font-medium text-slate-400 mt-1">Cross-department financial status</p>
                </div>
                <ChartToggle 
                  active={allocChart} 
                  onChange={setAllocChart} 
                  options={[
                    { id: 'bar', icon: BarChart2, label: 'Bar View' },
                    { id: 'area', icon: ActivitySquare, label: 'Area View' },
                    { id: 'radar', icon: Hexagon, label: 'Radar View' }
                  ]} 
                />
              </div>
              <div className="flex-1 min-h-[350px]">
                <ResponsiveContainer>
                  {allocChart === 'bar' ? (
                    <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }} />
                      <Bar dataKey="allocated" name="Allocated" fill="url(#colorAlloc)" radius={[6, 6, 0, 0]} maxBarSize={45}>
                        {comparisonData.map((_, i) => <Cell key={`cell-${i}`} fill={`url(#colorAlloc)`} />)}
                      </Bar>
                      <Bar dataKey="utilized" name="Utilized" fill="url(#colorUtil)" radius={[6, 6, 0, 0]} maxBarSize={45} />
                      <defs>
                        <linearGradient id="colorAlloc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={1}/><stop offset="100%" stopColor="#4f46e5" stopOpacity={0.8}/></linearGradient>
                        <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#14b8a6" stopOpacity={1}/><stop offset="100%" stopColor="#0d9488" stopOpacity={0.8}/></linearGradient>
                      </defs>
                    </BarChart>
                  ) : allocChart === 'area' ? (
                    <AreaChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }} />
                      <Area type="monotone" dataKey="allocated" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.1} />
                      <Area type="monotone" dataKey="utilized" stroke="#14b8a6" strokeWidth={3} fill="#14b8a6" fillOpacity={0.2} />
                    </AreaChart>
                  ) : (
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={comparisonData}>
                      <PolarGrid stroke="#f1f5f9" />
                      <PolarAngleAxis dataKey="department" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                      <Radar name="Allocated" dataKey="allocated" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.3} />
                      <Radar name="Utilized" dataKey="utilized" stroke="#14b8a6" strokeWidth={2} fill="#14b8a6" fillOpacity={0.5} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }} />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Layer 3: Interactive Distribution Chart */}
            <div className="p-6 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Distribution</h2>
                  <p className="text-sm font-medium text-slate-400 mt-1">Budget split</p>
                </div>
                <ChartToggle 
                  active={distChart} 
                  onChange={setDistChart} 
                  options={[
                    { id: 'pie', icon: PieIcon, label: 'Donut View' },
                    { id: 'bar', icon: BarChart2, label: 'Bar View' }
                  ]} 
                />
              </div>
              <div className="flex-1 min-h-[250px] relative">
                <ResponsiveContainer>
                  {distChart === 'pie' ? (
                    <PieChart>
                      <Pie data={distributionData} innerRadius="65%" outerRadius="90%" paddingAngle={6} dataKey="value" stroke="none" cornerRadius={8}>
                        {distributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  ) : (
                    <BarChart data={distributionData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} width={80} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                        {distributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
                {distChart === 'pie' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-slate-900">₹{Math.round(BUDGET_DATA.totalAllocation/10000000)}<span className="text-lg">Cr</span></span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Layer 4: Interactive Trend Monitoring */}
          <div className="p-6 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Financial Velocity</h2>
                <p className="text-sm font-medium text-slate-400 mt-1">Utilization timeline tracking</p>
              </div>
              <ChartToggle 
                active={trendChart} 
                onChange={setTrendChart} 
                options={[
                  { id: 'area', icon: ActivitySquare, label: 'Area Fill' },
                  { id: 'line', icon: TrendingUp, label: 'Line Trace' },
                  { id: 'bar', icon: BarChart2, label: 'Volume Bar' }
                ]} 
              />
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer>
                {trendChart === 'area' ? (
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="utilized" stroke="#ec4899" strokeWidth={4} fillOpacity={1} fill="url(#colorVelocity)" activeDot={{ r: 8, strokeWidth: 0, fill: '#be185d' }} />
                  </AreaChart>
                ) : trendChart === 'line' ? (
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="utilized" stroke="#ec4899" strokeWidth={4} dot={{ strokeWidth: 2, r: 4, fill: '#fff' }} activeDot={{ r: 8, fill: '#ec4899', strokeWidth: 0 }} />
                  </LineChart>
                ) : (
                  <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} />
                    <Bar dataKey="utilized" fill="#ec4899" radius={[6, 6, 0, 0]} maxBarSize={45} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminHome