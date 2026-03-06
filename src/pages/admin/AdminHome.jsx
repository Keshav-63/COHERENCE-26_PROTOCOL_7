// import React from 'react'
// import { BarChart3, TrendingUp, AlertTriangle, Users, ArrowRight, Zap, Shield, Brain } from 'lucide-react'
// import { Link } from 'react-router-dom'
// import Card from '../../components/Card'
// import Button from '../../components/Button'
// import Navigation from '../../components/Navigation'
// import { formatCurrency } from '../../utils/utils'
// import { BUDGET_DATA } from '../../utils/mockData'

// const AdminHome = () => {
//   const stats = [
//     {
//       title: 'Total Allocation',
//       value: BUDGET_DATA.totalAllocation,
//       icon: BarChart3,
//       trend: '+12.5%',
//       trendUp: true,
//     },
//     {
//       title: 'Successfully Spent',
//       value: BUDGET_DATA.totalSpent,
//       icon: TrendingUp,
//       trend: '+8.2%',
//       trendUp: true,
//     },
//     {
//       title: 'Underutilized Funds',
//       value: BUDGET_DATA.totalUnderUtilized,
//       icon: AlertTriangle,
//       trend: '-5.1%',
//       trendUp: false,
//     },
//     {
//       title: 'Active States',
//       value: BUDGET_DATA.statewise.length,
//       icon: Users,
//       trend: '+2',
//       trendUp: true,
//     },
//   ]

//   const features = [
//     {
//       title: 'Key Management',
//       description: 'Generate and manage invitation links for state and ministry officials with secure access control',
//       icon: Shield,
//       link: '/admin/key-management',
//       gradient: 'from-blue-500 to-blue-600',
//     },
//     {
//       title: 'Budget Analytics',
//       description: 'Track budget allocation and spending patterns across all departments and states in real-time',
//       icon: BarChart3,
//       link: '/admin/budget-analytics',
//       gradient: 'from-emerald-500 to-emerald-600',
//     },
//     {
//       title: 'Risk Detection',
//       description: 'Identify anomalies, detect potential leakages, and flag suspicious financial behaviors instantly',
//       icon: AlertTriangle,
//       link: '/admin/risk-anomalies',
//       gradient: 'from-orange-500 to-orange-600',
//     },
//     {
//       title: 'AI Forecasting',
//       description: 'Advanced predictive modeling using historical data to optimize future budget allocations',
//       icon: Brain,
//       link: '/admin/predictive-modeling',
//       gradient: 'from-purple-500 to-purple-600',
//     },
//   ]

//   const insights = [
//     {
//       number: '₹2.4T',
//       label: 'Budget Managed',
//       description: 'Across 28 states and 50+ ministries',
//     },
//     {
//       number: '99.2%',
//       label: 'Transparency',
//       description: 'Real-time tracking and reporting',
//     },
//     {
//       number: '847',
//       label: 'Anomalies Detected',
//       description: 'Potential leakages identified',
//     },
//   ]

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-white">
//       <Navigation role="admin" />

//       <main className="md:ml-64 pt-20 md:pt-0">
//         {/* Hero Section with Image */}
//         <section className="relative overflow-hidden">
//           <div className="absolute inset-0 opacity-5">
//             <img 
//               src="/images/hero-budget.jpg" 
//               alt="Budget Intelligence" 
//               className="w-full h-full object-cover"
//             />
//           </div>
//           <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-3xl -z-10"></div>
//           <div className="relative p-6 md:p-12 lg:p-16">
//             <div className="max-w-5xl mx-auto">
//               <div className="mb-2 inline-block">
//                 <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-xs font-mono font-semibold text-blue-600 tracking-wide">
//                   <Zap size={14} className="animate-pulse-glow" />
//                   INTELLIGENCE DASHBOARD
//                 </span>
//               </div>
              
//               <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-normal leading-tight mb-6 text-slate-900">
//                 <span className="gradient-text">Budget Flow Intelligence</span> & Leakage Detection
//               </h1>
              
//               <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-8 leading-relaxed">
//                 Monitor national budget allocation across states and ministries with AI-powered anomaly detection, 
//                 predictive forecasting, and real-time leakage identification for proactive financial governance.
//               </p>

//               <div className="flex flex-col sm:flex-row gap-4">
//                 <Link to="/admin/key-management">
//                   <Button variant="primary" className="w-full sm:w-auto text-lg py-3 px-8">
//                     Get Started <ArrowRight size={20} className="ml-2" />
//                   </Button>
//                 </Link>
//                 <Link to="/admin/budget-analytics">
//                   <Button variant="outline" className="w-full sm:w-auto text-lg py-3 px-8">
//                     View Analytics
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Key Metrics Section */}
//         <section className="px-6 md:px-8 py-12 md:py-16">
//           <div className="max-w-6xl mx-auto">
//             <h2 className="text-3xl md:text-4xl font-display font-normal mb-12 text-slate-900">Platform Overview</h2>
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//               {stats.map((stat, idx) => {
//                 const Icon = stat.icon
//                 return (
//                   <div key={idx} className="group animate-fade-up" style={{animationDelay: `${idx * 0.1}s`}}>
//                     <Card hover className="h-full bg-white border border-slate-100 hover:border-blue-200 transition-all">
//                       <div className="flex flex-col h-full">
//                         <div className="flex items-start justify-between mb-4">
//                           <div className="flex-1">
//                             <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">{stat.title}</p>
//                             <p className="text-3xl font-display font-normal text-slate-900">
//                               {stat.title === 'Active States'
//                                 ? stat.value
//                                 : formatCurrency(stat.value).split('.')[0]}
//                             </p>
//                           </div>
//                           <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg ml-2">
//                             <Icon size={24} className="text-blue-600" />
//                           </div>
//                         </div>
//                         <div className={`text-sm font-semibold ${stat.trendUp ? 'text-emerald-600' : 'text-slate-600'}`}>
//                           {stat.trend}
//                         </div>
//                       </div>
//                     </Card>
//                   </div>
//                 )
//               })}
//             </div>
//           </div>
//         </section>

//         {/* Core Capabilities */}
//         <section className="px-6 md:px-8 py-12 md:py-16 bg-gradient-to-r from-slate-900 to-slate-800 text-white relative overflow-hidden">
//           <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
//           <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          
//           <div className="relative max-w-6xl mx-auto">
//             <h2 className="text-3xl md:text-4xl font-display font-normal mb-4 text-white">Core Capabilities</h2>
//             <p className="text-lg text-slate-300 mb-12 max-w-2xl">
//               Comprehensive suite of tools designed for intelligent budget governance
//             </p>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               {features.map((feature, idx) => {
//                 const Icon = feature.icon
//                 return (
//                   <Link key={idx} to={feature.link} className="group">
//                     <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 h-full hover:bg-white/15 hover:border-white/40 transition-all duration-300 transform hover:-translate-y-2">
//                       <div className={`p-3 bg-gradient-to-br ${feature.gradient} rounded-lg w-fit mb-4 text-white`}>
//                         <Icon size={24} />
//                       </div>
//                       <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
//                       <p className="text-sm text-slate-300 mb-4 leading-relaxed">{feature.description}</p>
//                       <div className="flex items-center text-white font-medium text-sm gap-1 group-hover:gap-2 transition-all">
//                         Explore <ArrowRight size={16} />
//                       </div>
//                     </div>
//                   </Link>
//                 )
//               })}
//             </div>
//           </div>
//         </section>

//         {/* Impact Metrics */}
//         <section className="px-6 md:px-8 py-12 md:py-16">
//           <div className="max-w-6xl mx-auto">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//               {insights.map((insight, idx) => (
//                 <div key={idx} className="text-center animate-fade-up" style={{animationDelay: `${idx * 0.1}s`}}>
//                   <div className="mb-4">
//                     <p className="text-5xl md:text-6xl font-display font-normal text-transparent bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text">
//                       {insight.number}
//                     </p>
//                   </div>
//                   <h3 className="text-xl font-semibold text-slate-900 mb-2">{insight.label}</h3>
//                   <p className="text-slate-600">{insight.description}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* CTA Section */}
//         <section className="px-6 md:px-8 py-12 md:py-16">
//           <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-blue-100 rounded-3xl p-8 md:p-12 border border-blue-200">
//             <div className="text-center">
//               <h2 className="text-3xl md:text-4xl font-display font-normal text-slate-900 mb-4">
//                 Ready to Transform Budget Governance?
//               </h2>
//               <p className="text-lg text-slate-700 mb-8">
//                 Start managing public funds with intelligence, transparency, and precision
//               </p>
//               <Link to="/admin/key-management">
//                 <Button variant="primary" className="text-lg py-3 px-8">
//                   Invite Officials <ArrowRight size={20} className="ml-2" />
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </section>

//         {/* Footer */}
//         <footer className="border-t border-slate-200 bg-white p-6 md:p-8">
//           <div className="max-w-6xl mx-auto">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
//               <div>
//                 <h4 className="font-semibold text-slate-900 mb-4">Platform</h4>
//                 <p className="text-sm text-slate-600">Next-generation budget intelligence system for democratic governance</p>
//               </div>
//               <div>
//                 <h4 className="font-semibold text-slate-900 mb-4">Key Features</h4>
//                 <ul className="text-sm text-slate-600 space-y-2">
//                   <li>Real-time budget tracking</li>
//                   <li>AI-powered anomaly detection</li>
//                   <li>Predictive forecasting</li>
//                 </ul>
//               </div>
//               <div>
//                 <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
//                 <p className="text-sm text-slate-600">Ministry of Finance | India</p>
//               </div>
//             </div>
//             <div className="border-t border-slate-200 pt-6 text-center text-slate-600 text-sm">
//               <p>Budget Intelligence Platform © 2024 | Empowering Transparent Public Finance</p>
//             </div>
//           </div>
//         </footer>
//       </main>
//     </div>
//   )
// }

// export default AdminHome


// import React from 'react'
// import { BarChart3, TrendingUp, AlertTriangle, Users, ArrowRight, Zap, Shield, Brain, Globe, CheckCircle, Building2 } from 'lucide-react'
// import { Link } from 'react-router-dom'
// import Card from '../../components/Card'
// import Button from '../../components/Button'
// import Navigation from '../../components/Navigation'
// import { formatCurrency } from '../../utils/utils'
// import { BUDGET_DATA } from '../../utils/mockData'

// const AdminHome = () => {
//   const stats = [
//     { title: 'Total Allocation', value: BUDGET_DATA.totalAllocation, icon: BarChart3, trend: '+12.5%', trendUp: true },
//     { title: 'Successfully Spent', value: BUDGET_DATA.totalSpent, icon: TrendingUp, trend: '+8.2%', trendUp: true },
//     { title: 'Underutilized Funds', value: BUDGET_DATA.totalUnderUtilized, icon: AlertTriangle, trend: '-5.1%', trendUp: false },
//     { title: 'Active States', value: BUDGET_DATA.statewise.length, icon: Users, trend: '+2', trendUp: true },
//   ]

//   const features = [
//     { title: 'Key Management', description: 'Securely generate and distribute cryptographic keys for state officials.', icon: Shield, link: '/admin/key-management', gradient: 'from-blue-500 to-blue-700' },
//     { title: 'Budget Analytics', description: 'Interactive dashboards mapping financial flows across all 28 states.', icon: BarChart3, link: '/admin/budget-analytics', gradient: 'from-emerald-500 to-emerald-700' },
//     { title: 'Risk Detection', description: 'Real-time flagging of anomalous spending patterns and leakages.', icon: AlertTriangle, link: '/admin/risk-anomalies', gradient: 'from-orange-500 to-orange-700' },
//     { title: 'AI Forecasting', description: 'Machine learning models predicting future financial requirements.', icon: Brain, link: '/admin/predictive-modeling', gradient: 'from-indigo-500 to-indigo-700' },
//   ]

//   const insights = [
//     { number: '₹2.4T', label: 'Budget Managed', description: 'Across 28 states and 50+ ministries' },
//     { number: '99.2%', label: 'Transparency Score', description: 'Real-time tracking and immutable logs' },
//     { number: '847', label: 'Anomalies Prevented', description: 'Potential leakages identified instantly' },
//   ]

//   return (
//     <div className="min-h-screen flex bg-slate-50">
//       <Navigation role="admin" />

//       <main className="flex-1 pt-20 md:pt-0 overflow-x-hidden">
//         {/* Split Hero Section */}
//         <section className="relative bg-white border-b border-slate-200 overflow-hidden">
//           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-50 to-transparent rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>
          
//           <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//             <div className="z-10">
//               <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full">
//                 <Zap size={16} className="text-blue-600 animate-pulse" />
//                 <span className="text-sm font-semibold text-blue-700 tracking-wide uppercase">Central Admin Console</span>
//               </div>
              
//               <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
//                 Mastering <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Financial Governance</span>
//               </h1>
              
//               <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
//                 The ultimate command center for national budget allocation. Monitor multi-state spending, detect fraudulent anomalies in real-time, and leverage predictive AI to ensure zero financial leakage.
//               </p>

//               <div className="flex flex-col sm:flex-row gap-4">
//                 <Link to="/admin/budget-analytics">
//                   <Button variant="primary" className="w-full sm:w-auto text-lg py-4 px-8 shadow-xl shadow-blue-500/20">
//                     Open Analytics Dashboard <ArrowRight size={20} className="ml-2" />
//                   </Button>
//                 </Link>
//                 <Link to="/admin/key-management">
//                   <Button variant="outline" className="w-full sm:w-auto text-lg py-4 px-8">
//                     Manage Access Keys
//                   </Button>
//                 </Link>
//               </div>
//             </div>

//             <div className="relative z-10 hidden lg:block">
//               <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl transform rotate-3 scale-105 opacity-20 blur-xl"></div>
//               <img 
//                 src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
//                 alt="Data Analytics Dashboard" 
//                 className="rounded-2xl shadow-2xl border border-slate-200 object-cover h-[500px] w-full"
//               />
//               {/* Floating Badge */}
//               <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 animate-bounce" style={{ animationDuration: '3s' }}>
//                 <div className="flex items-center gap-4">
//                   <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
//                     <Shield className="text-emerald-600" size={24} />
//                   </div>
//                   <div>
//                     <p className="text-sm text-slate-500 font-medium">System Status</p>
//                     <p className="text-lg font-bold text-slate-900">Secure & Active</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Live Metrics Grid */}
//         <section className="px-6 md:px-12 py-16 bg-slate-50">
//           <div className="max-w-7xl mx-auto">
//             <div className="flex justify-between items-end mb-10">
//               <div>
//                 <h2 className="text-3xl font-bold text-slate-900">National Overview</h2>
//                 <p className="text-slate-500 mt-2">Real-time aggregate data across all registered departments.</p>
//               </div>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               {stats.map((stat, idx) => {
//                 const Icon = stat.icon
//                 return (
//                   <Card key={idx} hover className="bg-white border-slate-200/60 shadow-sm">
//                     <div className="flex justify-between items-start mb-4">
//                       <div className="p-3 bg-slate-50 rounded-xl">
//                         <Icon size={24} className="text-blue-600" />
//                       </div>
//                       <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${stat.trendUp ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
//                         {stat.trend}
//                       </span>
//                     </div>
//                     <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
//                     <p className="text-3xl font-bold text-slate-900">
//                       {stat.title === 'Active States' ? stat.value : formatCurrency(stat.value).split('.')[0]}
//                     </p>
//                   </Card>
//                 )
//               })}
//             </div>
//           </div>
//         </section>

//         {/* Descriptive Feature Section with Image */}
//         <section className="px-6 md:px-12 py-20 bg-white border-y border-slate-200">
//           <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
//             <div className="order-2 lg:order-1 relative">
//               <img 
//                 src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" 
//                 alt="Global Network" 
//                 className="rounded-3xl shadow-lg object-cover h-[600px] w-full"
//               />
//               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent rounded-3xl"></div>
//               <div className="absolute bottom-8 left-8 right-8 text-white">
//                 <Globe size={32} className="mb-4 text-blue-400" />
//                 <h3 className="text-2xl font-bold mb-2">Nationwide Integration</h3>
//                 <p className="text-slate-200 text-sm">Seamlessly connecting central treasury with state-level execution.</p>
//               </div>
//             </div>

//             <div className="order-1 lg:order-2">
//               <h2 className="text-4xl font-bold text-slate-900 mb-6">Why Choose the BIP Ecosystem?</h2>
//               <p className="text-lg text-slate-600 mb-8">
//                 Traditional budget management relies on fragmented spreadsheets and delayed reporting. Our platform introduces cryptographic security, AI-driven insights, and absolute transparency into the fiscal lifecycle.
//               </p>

//               <div className="space-y-6">
//                 {[
//                   { title: 'Cryptographic Security', desc: 'RSA-based key generation ensures only authorized officials can access state-level financial nodes.' },
//                   { title: 'Anomaly Detection AI', desc: 'Machine learning algorithms continuously scan spending logs to identify and flag unnatural patterns instantly.' },
//                   { title: 'Predictive Resource Modeling', desc: 'Forecast future departmental needs based on historical expenditure and macro-economic factors.' }
//                 ].map((item, idx) => (
//                   <div key={idx} className="flex gap-4">
//                     <div className="flex-shrink-0 mt-1">
//                       <CheckCircle className="text-blue-600" size={24} />
//                     </div>
//                     <div>
//                       <h4 className="text-xl font-semibold text-slate-900">{item.title}</h4>
//                       <p className="text-slate-600 mt-1">{item.desc}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Admin Tools Grid */}
//         <section className="px-6 md:px-12 py-20 bg-slate-950 text-white relative overflow-hidden">
//           {/* Background effects */}
//           <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
//           <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]"></div>
          
//           <div className="relative max-w-7xl mx-auto z-10">
//             <div className="text-center mb-16">
//               <h2 className="text-4xl font-bold mb-4">Core Admin Capabilities</h2>
//               <p className="text-xl text-slate-400 max-w-2xl mx-auto">
//                 Powerful modules designed to maintain the integrity of national finances.
//               </p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               {features.map((feature, idx) => {
//                 const Icon = feature.icon
//                 return (
//                   <Link key={idx} to={feature.link} className="group block">
//                     <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 h-full hover:bg-slate-800 transition-all duration-300 transform hover:-translate-y-2 hover:border-blue-500/50">
//                       <div className={`p-4 bg-gradient-to-br ${feature.gradient} rounded-xl w-fit mb-6 shadow-lg`}>
//                         <Icon size={28} className="text-white" />
//                       </div>
//                       <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
//                       <p className="text-slate-400 mb-6 leading-relaxed">{feature.description}</p>
//                       <div className="flex items-center text-blue-400 font-semibold text-sm gap-2 group-hover:gap-3 transition-all">
//                         Launch Module <ArrowRight size={16} />
//                       </div>
//                     </div>
//                   </Link>
//                 )
//               })}
//             </div>
//           </div>
//         </section>

//         {/* Footer */}
//         <footer className="bg-white border-t border-slate-200 px-6 md:px-12 py-12">
//           <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div>
//               <div className="flex items-center gap-2 mb-4">
//                 <Building2 className="text-blue-600" />
//                 <span className="font-bold text-xl text-slate-900">BIP System</span>
//               </div>
//               <p className="text-slate-500">Empowering transparent public finance through technology and intelligent data modeling.</p>
//             </div>
//             <div>
//               <h4 className="font-bold text-slate-900 mb-4">Quick Links</h4>
//               <ul className="space-y-2 text-slate-500">
//                 <li><Link to="/admin/budget-analytics" className="hover:text-blue-600">Analytics Dashboard</Link></li>
//                 <li><Link to="/admin/risk-anomalies" className="hover:text-blue-600">Anomaly Reports</Link></li>
//                 <li><Link to="/admin/key-management" className="hover:text-blue-600">Access Control</Link></li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-bold text-slate-900 mb-4">System Status</h4>
//               <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg w-fit">
//                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
//                 <span className="font-medium text-sm">All Systems Operational</span>
//               </div>
//             </div>
//           </div>
//         </footer>
//       </main>
//     </div>
//   )
// }

// export default AdminHome


import React from 'react'
import { BarChart3, TrendingUp, AlertTriangle, Users, ArrowRight, Zap, Shield, Brain, Globe, CheckCircle, Building2, Activity, Cpu } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Navigation from '../../components/Navigation'
import { formatCurrency } from '../../utils/utils'
import { BUDGET_DATA } from '../../utils/mockData'

const AdminHome = () => {
  const stats = [
    { title: 'Total National Allocation', value: BUDGET_DATA.totalAllocation, icon: BarChart3, trend: '+12.5%', trendUp: true, desc: 'Compared to Q3 2023' },
    { title: 'Successfully Disbursed', value: BUDGET_DATA.totalSpent, icon: TrendingUp, trend: '+8.2%', trendUp: true, desc: 'Verified on Ledger' },
    { title: 'Flagged Anomalies', value: 847, icon: AlertTriangle, trend: '-5.1%', trendUp: false, desc: 'Needs Immediate Review' },
    { title: 'Active State Nodes', value: BUDGET_DATA.statewise.length, icon: Users, trend: '100%', trendUp: true, desc: 'All Systems Online' },
  ]

  const modules = [
    { title: 'Cryptographic Access', desc: 'Manage RSA-2048 keys for top-tier security across all state officials.', icon: Shield, link: '/admin/key-management', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    { title: 'Macro Analytics', desc: 'God-eye view of all fiscal movements, filtered by sector and geography.', icon: BarChart3, link: '/admin/budget-analytics', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
    { title: 'Threat Intelligence', desc: 'AI-driven flagging of suspicious vendor payments and fund routing.', icon: AlertTriangle, link: '/admin/risk-anomalies', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    { title: 'Neural Forecasting', desc: 'Predict budget shortfalls before they happen using deep learning.', icon: Brain, link: '/admin/predictive-modeling', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  ]

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      <Navigation role="admin" />

      <main className="flex-1 pt-20 md:pt-0 overflow-x-hidden">
        {/* Futuristic Hero Section */}
        <section className="relative bg-white border-b border-slate-200 overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-white to-white -z-10"></div>
          
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="z-10 relative">
              <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-full shadow-sm">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                <span className="text-sm font-bold text-blue-800 tracking-wide uppercase">Central Command Active</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                Zero-Leakage <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                  Fiscal Governance.
                </span>
              </h1>
              
              <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-xl font-medium">
                You are viewing the national master node. Monitor multi-state financial flows in real-time, detect structural anomalies with AI, and enforce cryptographic accountability.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/admin/budget-analytics">
                  <Button variant="primary" className="w-full sm:w-auto text-lg py-4 px-8 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-1">
                    Launch Master Dashboard <ArrowRight size={20} className="ml-2" />
                  </Button>
                </Link>
                <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <Cpu size={24} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">AI Status</p>
                    <p className="text-sm text-slate-700 font-semibold">Monitoring 12M+ Data Points</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 hidden lg:block perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-500 rounded-3xl transform rotate-3 scale-105 opacity-10 blur-2xl"></div>
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
                alt="Data Analytics Dashboard" 
                className="rounded-3xl shadow-2xl border border-white object-cover h-[550px] w-full transform -rotate-2 hover:rotate-0 transition-all duration-700"
              />
              {/* Floating Insight Cards */}
              <div className="absolute top-10 -left-12 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-slate-100 animate-bounce" style={{ animationDuration: '4s' }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Anomaly Prevented</p>
                    <p className="text-sm font-bold text-slate-900">₹4.2M Flagged in Sector 7</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-12 -right-8 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-slate-100 animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Shield className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Network Security</p>
                    <p className="text-sm font-bold text-slate-900">RSA-2048 Keys Verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Metrics Grid */}
        <section className="px-6 md:px-12 py-20 bg-slate-50 relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Real-Time Aggregate Telemetry</h2>
                <p className="text-slate-500 mt-2 font-medium">Data compiled across all 28 states and 50+ central ministries.</p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
                <Activity size={16} className="animate-pulse" /> Live Feed Active
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => {
                const Icon = stat.icon
                return (
                  <Card key={idx} hover className="bg-white border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <Icon size={24} className="text-blue-600" />
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${stat.trendUp ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        {stat.trend}
                      </span>
                    </div>
                    <p className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
                      {stat.title === 'Active State Nodes' || stat.title === 'Flagged Anomalies' ? stat.value : formatCurrency(stat.value).split('.')[0]}
                    </p>
                    <p className="text-sm font-bold text-slate-800 mb-1">{stat.title}</p>
                    <p className="text-xs text-slate-500 font-medium">{stat.desc}</p>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Deep Descriptive Modules Grid */}
        <section className="px-6 md:px-12 py-24 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Platform Core Infrastructure</h2>
              <p className="text-xl text-slate-500 max-w-3xl mx-auto">
                Select a module to interact with the underlying intelligence systems governing the national treasury.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {modules.map((mod, idx) => {
                const Icon = mod.icon
                return (
                  <Link key={idx} to={mod.link} className="group block h-full">
                    <div className={`h-full p-8 rounded-3xl border border-slate-100 bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden`}>
                      <div className={`absolute top-0 right-0 w-32 h-32 ${mod.bg} rounded-bl-[100px] -z-10 transition-transform group-hover:scale-150 duration-500 opacity-50`}></div>
                      
                      <div className={`w-16 h-16 ${mod.bg} ${mod.text} ${mod.border} border rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                        <Icon size={32} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{mod.title}</h3>
                      <p className="text-slate-600 leading-relaxed mb-8 text-lg">{mod.desc}</p>
                      
                      <div className="flex items-center text-slate-900 font-bold group-hover:text-blue-600 transition-colors">
                        Access Module <ArrowRight size={20} className="ml-2 transform group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* AI Insight Highlight */}
        <section className="px-6 md:px-12 py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" 
              alt="Global Network" 
              className="w-full h-full object-cover opacity-10 mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full mb-6">
                <Brain size={16} className="text-indigo-400" />
                <span className="text-sm font-bold text-indigo-300 tracking-wide uppercase">Deep Learning Engine</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight tracking-tight">
                Predictive Intelligence <br/><span className="text-indigo-400">At National Scale.</span>
              </h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Our proprietary models don't just record what happened—they predict what will happen. By analyzing historical spending velocities and macroeconomic factors, BIP identifies potential budget shortfalls 6 months before they impact the public.
              </p>
              <ul className="space-y-4 text-slate-300 font-medium">
                <li className="flex items-center gap-3"><CheckCircle className="text-emerald-400" size={20} /> 94% Accuracy in Q4 Forecasts</li>
                <li className="flex items-center gap-3"><CheckCircle className="text-emerald-400" size={20} /> Automated Risk Scoring for Vendors</li>
                <li className="flex items-center gap-3"><CheckCircle className="text-emerald-400" size={20} /> Dynamic Resource Re-allocation Suggestions</li>
              </ul>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl relative">
              <div className="absolute -top-4 -right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">Live Alert generated</div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Activity className="text-blue-400"/> AI System Recommendations</h3>
              
              <div className="space-y-4">
                {[
                  { state: 'Maharashtra', issue: 'Predicted 15% shortfall in Infrastructure dev.', action: 'Reallocate from reserves' },
                  { state: 'Karnataka', issue: 'Unusual vendor payment frequency detected.', action: 'Halt payments & audit' },
                  { state: 'Gujarat', issue: 'Optimal spending velocity achieved.', action: 'Increase Q3 ceiling' }
                ].map((alert, i) => (
                  <div key={i} className="bg-slate-900/80 border border-slate-700 p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-blue-300">{alert.state}</span>
                      <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 border border-slate-700">Auto-generated</span>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">{alert.issue}</p>
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Suggested: {alert.action}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white px-6 md:px-12 py-12 border-t border-slate-200">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg"><Building2 className="text-white" size={20} /></div>
              <div>
                <span className="font-bold text-xl text-slate-900 block">BIP System</span>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">National Command</span>
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">Empowering transparent public finance through cryptography and AI.</p>
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="font-bold text-xs uppercase tracking-wider">All Systems Operational</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default AdminHome