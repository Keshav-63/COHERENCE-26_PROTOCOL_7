import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts'
import {
  Activity, ArrowUpRight, ArrowDownRight,
  RefreshCw, TrendingUp, AlertTriangle, ShieldAlert,
  MapPin, Landmark, Layers
} from 'lucide-react'
import { showSuccess, showError, formatCurrency } from '../../utils/utils'

// Utility function to determine color based on risk or utilization
const getRiskColor = (risk) => {
  if (risk === 'High') return 'text-rose-400 bg-rose-500/10 border-rose-500/30'
  if (risk === 'Medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
}

const AnalyticsDashboard = () => {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState({
        top_schemes: [],
        state_benchmarks: [],
        districts: []
    })

    useEffect(() => {
        fetchAnalyticsData()
    }, [])

    const fetchAnalyticsData = async () => {
        setLoading(true)
        try {
            const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
            const response = await axios.get(`${VITE_API_BASE_URL}/api/v1/analytics/dashboard`)
            setData(response.data)
            showSuccess('Analytics Hub Synced')
        } catch (error) {
            console.error('Error fetching analytics:', error)
            showError('Failed to sync analytics')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="h-10 w-10 animate-spin text-blue-500" />
                    <p className="font-mono text-sm text-blue-400 uppercase tracking-widest animate-pulse">Establishing Secure Uplink</p>
                </div>
            </div>
        )
    }

    // Chart customization for custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl">
                    <p className="font-bold text-white mb-2">{label}</p>
                    <div className="space-y-1">
                        <p className="text-sm">
                            <span className="text-slate-400">Allocated:</span> <span className="text-blue-400 font-mono font-bold">₹{formatCurrency(payload[0].payload.allocation).split('.')[0]} Cr</span>
                        </p>
                        <p className="text-sm">
                            <span className="text-slate-400">Spent:</span> <span className="text-emerald-400 font-mono font-bold">₹{formatCurrency(payload[0].payload.spent).split('.')[0]} Cr</span>
                        </p>
                        <p className="text-sm mt-2 pt-2 border-t border-slate-700">
                            <span className="text-slate-400">Utilization:</span> <span className="text-white font-mono font-bold">{payload[0].payload.utilization}%</span>
                        </p>
                    </div>
                </div>
            )
        }
        return null
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-[#020617] text-slate-200">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6 mb-8">
                <div>
                   <div className="flex items-center gap-3 mb-2">
                       <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg border border-white/10">
                           <Activity size={24} className="text-white" />
                       </div>
                       <div>
                           <h1 className="text-3xl font-black tracking-tight text-white">Analytics Hub</h1>
                           <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest mt-1">
                               <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                               Live Aggregation Active
                           </div>
                       </div>
                   </div>
                </div>
                <button
                    onClick={fetchAnalyticsData}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-blue-400 text-sm font-semibold rounded-lg transition-colors border border-blue-500/20"
                >
                    <RefreshCw size={16} /> Sync Data
                </button>
            </div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Top Schemes Bar Chart */}
                <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10 flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2"><Layers size={18} className="text-blue-400"/> Scheme Capital Deployment</h2>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer>
                            <BarChart data={data.top_schemes} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                                <XAxis type="number" tickFormatter={(v) => `₹${v}`} stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 12}} />
                                <YAxis dataKey="name" type="category" width={120} stroke="#64748b" tick={{fill: '#e2e8f0', fontSize: 11, fontWeight: 'bold'}} />
                                <RechartsTooltip content={<CustomTooltip />} cursor={{fill: '#1e293b'}} />
                                <Bar dataKey="allocation" name="Allocated" fill="#1e293b" radius={[0, 4, 4, 0]} barSize={20} />
                                <Bar dataKey="spent" name="Spent" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                                    {data.top_schemes.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={'url(#colorSpent)'} />
                                    ))}
                                </Bar>
                                <defs>
                                    <linearGradient id="colorSpent" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1}/>
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. State Benchmarking (Leaderboard) */}
                <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2"><MapPin size={18} className="text-emerald-400"/> State Execution Velocity</h2>
                        <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase px-2 py-1 bg-slate-900 rounded">Multistate Protocol</span>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                        {data.state_benchmarks.map((state, index) => (
                            <div key={index} className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-white/5 relative overflow-hidden group hover:bg-slate-800/80 transition-colors">
                                {/* Rank */}
                                <div className={`font-black text-2xl w-8 text-center ${index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-400' : 'text-slate-600'}`}>
                                    #{index + 1}
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex justify-between items-end mb-2">
                                        <p className="font-bold text-white">{state.state}</p>
                                        <p className="font-mono text-sm font-bold text-white"><span className="text-emerald-400 text-xs mr-1 opacity-0 group-hover:opacity-100 transition-opacity">UTILIZATION</span>{state.utilization}%</p>
                                    </div>
                                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${index < 2 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : index === data.state_benchmarks.length - 1 ? 'bg-gradient-to-r from-rose-500 to-red-400' : 'bg-gradient-to-r from-blue-500 to-indigo-400'}`} 
                                            style={{ width: `${Math.min(state.utilization, 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1.5 uppercase">
                                        <span>Alloc: ₹{state.allocation}Cr</span>
                                        <span>Spent: ₹{state.spent}Cr</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. District Performance Matrix */}
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Landmark size={20} className="text-purple-400"/> District Performance Matrix</h2>
                        <p className="text-xs text-slate-400 mt-1">Cross-regional expenditure tracking and threat detection</p>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-950 text-xs uppercase font-mono text-slate-500 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4 font-bold tracking-widest">District Entity</th>
                                <th className="px-6 py-4 font-bold tracking-widest">Utilization</th>
                                <th className="px-6 py-4 font-bold tracking-widest">Risk Index</th>
                                <th className="px-6 py-4 font-bold tracking-widest text-center">Anomalies</th>
                                <th className="px-6 py-4 font-bold tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.districts.map((district, idx) => (
                                <tr key={district.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-white/5 font-bold text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">
                                                {district.district.substring(0,2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{district.district}</p>
                                                <p className="text-[10px] font-mono text-slate-500">Vol: ₹{formatCurrency(district.allocation).split(".")[0]}Cr</p>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 w-64">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                                <div 
                                                    className="h-full bg-blue-500 rounded-full" 
                                                    style={{ width: `${Math.min(district.utilization, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="font-mono font-bold text-white w-10">{district.utilization}%</span>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded border text-[10px] font-black uppercase tracking-widest ${getRiskColor(district.risk_level)}`}>
                                            {district.risk_level} 
                                        </span>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-center">
                                        {district.anomalies > 0 ? (
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30 animate-pulse">
                                                {district.anomalies}
                                            </span>
                                        ) : (
                                            <span className="text-slate-600 font-mono">-</span>
                                        )}
                                    </td>
                                    
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-400 hover:text-white hover:bg-blue-600/20 px-3 py-1.5 rounded transition-colors text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1">
                                            Extract <ArrowUpRight size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}

export default AnalyticsDashboard
