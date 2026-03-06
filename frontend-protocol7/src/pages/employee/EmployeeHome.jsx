// import React from 'react'
// import { Key, BarChart3, AlertTriangle, TrendingUp, Lock, CheckCircle, Zap, Shield, ArrowRight } from 'lucide-react'
// import { Link } from 'react-router-dom'
// import Card from '../../components/Card'
// import Button from '../../components/Button'
// import Navigation from '../../components/Navigation'
// import Badge from '../../components/Badge'
// import { useAuth } from '../../context/AuthContext'

// const EmployeeHome = () => {
//   const { user } = useAuth()

//   const status = [
//     {
//       label: 'Account Status',
//       value: 'Active',
//       color: 'success',
//       icon: CheckCircle,
//     },
//     {
//       label: 'Public Key',
//       value: user?.publicKey ? 'Uploaded' : 'Pending',
//       color: user?.publicKey ? 'success' : 'warning',
//       icon: Key,
//     },
//     {
//       label: 'Access Level',
//       value: 'Full Access',
//       color: 'info',
//       icon: Lock,
//     },
//   ]

//   const features = [
//     {
//       title: 'Key Generation',
//       description: 'Generate your RSA key pair for secure authentication and data encryption',
//       icon: Key,
//       link: '/employee/key-generation',
//       status: user?.publicKey ? '✓ Completed' : '⚠ Required',
//       gradient: 'from-blue-500 to-blue-600',
//     },
//     {
//       title: 'Budget Analytics',
//       description: 'Real-time insights into budget allocation and spending for your state/ministry',
//       icon: BarChart3,
//       link: '/employee/budget-analytics',
//       gradient: 'from-emerald-500 to-emerald-600',
//     },
//     {
//       title: 'Risk Monitoring',
//       description: 'Identify and report anomalies and suspicious transactions instantly',
//       icon: AlertTriangle,
//       link: '/employee/risk-anomalies',
//       gradient: 'from-orange-500 to-orange-600',
//     },
//     {
//       title: 'Predictive Models',
//       description: 'Access AI forecasting tools and advanced risk assessments',
//       icon: TrendingUp,
//       link: '/employee/predictive-modeling',
//       gradient: 'from-purple-500 to-purple-600',
//     },
//   ]

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-white">
//       <Navigation role="employee" />

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
//                   STATE/MINISTRY PORTAL
//                 </span>
//               </div>
              
//               <h1 className="text-5xl md:text-6xl lg:text-6xl font-display font-normal leading-tight mb-4 text-slate-900">
//                 Welcome, <span className="gradient-text">{user?.email?.split('@')[0] || 'Official'}</span>
//               </h1>
              
//               <p className="text-lg md:text-xl text-slate-600 max-w-3xl mb-8 leading-relaxed">
//                 Manage your department's budget allocation, monitor spending patterns, and collaborate with the central government 
//                 for transparent, data-driven financial governance.
//               </p>

//               <div className="flex flex-col sm:flex-row gap-4">
//                 {!user?.publicKey && (
//                   <Link to="/employee/key-generation">
//                     <Button variant="primary" className="w-full sm:w-auto text-lg py-3 px-8">
//                       Complete Key Setup <ArrowRight size={20} className="ml-2" />
//                     </Button>
//                   </Link>
//                 )}
//                 <Link to="/employee/budget-analytics">
//                   <Button variant="outline" className="w-full sm:w-auto text-lg py-3 px-8">
//                     View My Budget
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Quick Status Section */}
//         <section className="px-6 md:px-8 py-12 md:py-16">
//           <div className="max-w-6xl mx-auto">
//             <h2 className="text-3xl md:text-4xl font-display font-normal mb-12 text-slate-900">Account Status</h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {status.map((item, idx) => {
//                 const Icon = item.icon
//                 return (
//                   <div key={idx} className="group animate-fade-up" style={{animationDelay: `${idx * 0.1}s`}}>
//                     <Card hover className="h-full bg-white border border-slate-100 hover:border-blue-200 transition-all">
//                       <div className="flex items-start justify-between">
//                         <div className="flex-1">
//                           <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">{item.label}</p>
//                           <p className="text-3xl font-display font-normal text-slate-900 mb-3">{item.value}</p>
//                           <p className={`text-xs font-semibold uppercase tracking-wide ${
//                             item.color === 'success' ? 'text-emerald-600' :
//                             item.color === 'warning' ? 'text-orange-600' :
//                             'text-blue-600'
//                           }`}>
//                             {item.color === 'success' ? '✓ All set' :
//                              item.color === 'warning' ? '⚠ Attention needed' :
//                              'Ready'}
//                           </p>
//                         </div>
//                         <div className={`p-4 rounded-lg ml-2 ${
//                           item.color === 'success'
//                             ? 'bg-emerald-50'
//                             : item.color === 'warning'
//                             ? 'bg-orange-50'
//                             : 'bg-blue-50'
//                         }`}>
//                           <Icon size={28} className={
//                             item.color === 'success'
//                               ? 'text-emerald-600'
//                               : item.color === 'warning'
//                               ? 'text-orange-600'
//                               : 'text-blue-600'
//                           } />
//                         </div>
//                       </div>
//                     </Card>
//                   </div>
//                 )
//               })}
//             </div>
//           </div>
//         </section>

//         {/* Alert Banner if Key Not Generated */}
//         {!user?.publicKey && (
//           <section className="px-6 md:px-8 py-4">
//             <div className="max-w-6xl mx-auto">
//               <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6 md:p-8 relative overflow-hidden">
//                 <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl"></div>
//                 <div className="relative flex items-start gap-4">
//                   <div className="p-3 bg-orange-100 rounded-lg flex-shrink-0">
//                     <AlertTriangle size={24} className="text-orange-700" />
//                   </div>
//                   <div className="flex-1">
//                     <h3 className="text-lg font-semibold text-orange-900 mb-2">Complete Your Security Setup</h3>
//                     <p className="text-orange-800 mb-4">
//                       Your public key is required to access full platform functionality and ensure secure data transmission. 
//                       Please complete your key generation now.
//                     </p>
//                     <Link to="/employee/key-generation">
//                       <Button variant="primary" size="sm">
//                         Generate Keys Now <ArrowRight size={16} className="ml-2" />
//                       </Button>
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>
//         )}

//         {/* Core Features */}
//         <section className="px-6 md:px-8 py-12 md:py-16">
//           <div className="max-w-6xl mx-auto">
//             <h2 className="text-3xl md:text-4xl font-display font-normal mb-4 text-slate-900">Your Tools</h2>
//             <p className="text-lg text-slate-600 mb-12">Access powerful features to manage your budget and report on finances</p>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               {features.map((feature, idx) => {
//                 const Icon = feature.icon
//                 return (
//                   <Link key={idx} to={feature.link} className="group">
//                     <Card hover className="h-full bg-white border border-slate-100 hover:border-blue-200 transition-all">
//                       <div className="flex flex-col h-full">
//                         <div className="flex items-start justify-between mb-4">
//                           <div className={`p-4 bg-gradient-to-br ${feature.gradient} rounded-lg text-white`}>
//                             <Icon size={24} />
//                           </div>
//                           {feature.status && (
//                             <Badge variant={feature.status.includes('Completed') ? 'success' : 'warning'}>
//                               {feature.status}
//                             </Badge>
//                           )}
//                         </div>
//                         <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
//                         <p className="text-sm text-slate-600 flex-1 leading-relaxed mb-4">{feature.description}</p>
//                         <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all gap-1">
//                           Access <ArrowRight size={16} />
//                         </div>
//                       </div>
//                     </Card>
//                   </Link>
//                 )
//               })}
//             </div>
//           </div>
//         </section>

//         {/* Getting Started */}
//         <section className="px-6 md:px-8 py-12 md:py-16 bg-gradient-to-r from-slate-900 to-slate-800 text-white relative overflow-hidden">
//           <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
//           <div className="relative max-w-6xl mx-auto">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
//               <div>
//                 <h2 className="text-3xl md:text-4xl font-display font-normal mb-6 text-white">Quick Start Guide</h2>
//                 <ol className="space-y-4">
//                   {[
//                     'Generate your RSA key pair on the Key Generation page',
//                     'Keep your private key secure and confidential',
//                     'Upload your public key to complete verification',
//                     'Access all budget analytics and monitoring tools',
//                     'Start collaborating with central government',
//                   ].map((step, idx) => (
//                     <li key={idx} className="flex gap-4 items-start">
//                       <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
//                         {idx + 1}
//                       </span>
//                       <span className="text-slate-100 leading-relaxed mt-0.5">{step}</span>
//                     </li>
//                   ))}
//                 </ol>
//               </div>

//               <div className="relative">
//                 <img 
//                   src="/images/security-trust.jpg" 
//                   alt="Security" 
//                   className="rounded-2xl w-full h-80 object-cover"
//                 />
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Your Responsibilities */}
//         <section className="px-6 md:px-8 py-12 md:py-16">
//           <div className="max-w-6xl mx-auto">
//             <h2 className="text-3xl md:text-4xl font-display font-normal mb-12 text-slate-900">Your Responsibilities</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
//                 <div className="flex items-start gap-4 mb-6">
//                   <div className="p-3 bg-emerald-200 rounded-lg">
//                     <Shield size={28} className="text-emerald-700" />
//                   </div>
//                   <div>
//                     <h3 className="text-xl font-semibold text-emerald-900">Security & Compliance</h3>
//                     <p className="text-sm text-emerald-700 mt-1">Protect sensitive financial data</p>
//                   </div>
//                 </div>
//                 <ul className="space-y-3 text-emerald-800">
//                   <li className="flex gap-3 items-start">
//                     <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
//                     <span>Keep your private key secure and confidential at all times</span>
//                   </li>
//                   <li className="flex gap-3 items-start">
//                     <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
//                     <span>Use strong, unique passwords for your account</span>
//                   </li>
//                   <li className="flex gap-3 items-start">
//                     <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
//                     <span>Report any security concerns immediately</span>
//                   </li>
//                 </ul>
//               </Card>

//               <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
//                 <div className="flex items-start gap-4 mb-6">
//                   <div className="p-3 bg-blue-200 rounded-lg">
//                     <BarChart3 size={28} className="text-blue-700" />
//                   </div>
//                   <div>
//                     <h3 className="text-xl font-semibold text-blue-900">Monitoring & Reporting</h3>
//                     <p className="text-sm text-blue-700 mt-1">Ensure transparency and accuracy</p>
//                   </div>
//                 </div>
//                 <ul className="space-y-3 text-blue-800">
//                   <li className="flex gap-3 items-start">
//                     <CheckCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
//                     <span>Monitor budget allocation and spending for your department</span>
//                   </li>
//                   <li className="flex gap-3 items-start">
//                     <CheckCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
//                     <span>Report anomalies and unusual transactions promptly</span>
//                   </li>
//                   <li className="flex gap-3 items-start">
//                     <CheckCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
//                     <span>Collaborate with central government on policy decisions</span>
//                   </li>
//                 </ul>
//               </Card>
//             </div>
//           </div>
//         </section>

//         {/* Footer */}
//         <footer className="border-t border-slate-200 bg-white p-6 md:p-8">
//           <div className="max-w-6xl mx-auto">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
//               <div>
//                 <h4 className="font-semibold text-slate-900 mb-4">Your Portal</h4>
//                 <p className="text-sm text-slate-600">State and ministry officials workspace for budget management and financial reporting</p>
//               </div>
//               <div>
//                 <h4 className="font-semibold text-slate-900 mb-4">Quick Links</h4>
//                 <ul className="text-sm text-slate-600 space-y-2">
//                   <li><Link to="/employee/key-generation" className="hover:text-blue-600">Key Generation</Link></li>
//                   <li><Link to="/employee/budget-analytics" className="hover:text-blue-600">Budget Analytics</Link></li>
//                   <li><Link to="/employee/risk-anomalies" className="hover:text-blue-600">Risk Monitoring</Link></li>
//                 </ul>
//               </div>
//               <div>
//                 <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
//                 <p className="text-sm text-slate-600">Technical support available from your administrator</p>
//               </div>
//             </div>
//             <div className="border-t border-slate-200 pt-6 text-center text-slate-600 text-sm">
//               <p>Budget Intelligence Platform © 2024 | Empowering Transparent Governance</p>
//             </div>
//           </div>
//         </footer>
//       </main>
//     </div>
//   )
// }

// export default EmployeeHome



// import React from 'react'
// import { Key, BarChart3, AlertTriangle, TrendingUp, Lock, CheckCircle, Zap, Shield, ArrowRight, FileText, Activity, Building2 } from 'lucide-react'
// import { Link } from 'react-router-dom'
// import Card from '../../components/Card'
// import Button from '../../components/Button'
// import Navigation from '../../components/Navigation'
// import Badge from '../../components/Badge'
// import { useAuth } from '../../context/AuthContext'

// const EmployeeHome = () => {
//   const { user } = useAuth()

//   const status = [
//     { label: 'Portal Status', value: 'Active', color: 'success', icon: Activity },
//     { label: 'RSA Public Key', value: user?.publicKey ? 'Verified' : 'Required', color: user?.publicKey ? 'success' : 'warning', icon: Key },
//     { label: 'Clearance Level', value: 'State Official', color: 'info', icon: Shield },
//   ]

//   const features = [
//     { title: 'Key Generation', description: 'Establish secure connection via RSA cryptographic key pair creation.', icon: Key, link: '/employee/key-generation', status: user?.publicKey ? '✓ Active' : '⚠ Action Needed', gradient: 'from-slate-700 to-slate-900' },
//     { title: 'State Budget', description: 'Monitor your specific allocations, spent funds, and remaining balances.', icon: BarChart3, link: '/employee/budget-analytics', gradient: 'from-blue-500 to-blue-700' },
//     { title: 'Submit Reports', description: 'Log financial transactions and instantly run anomaly pre-checks.', icon: FileText, link: '/employee/risk-anomalies', gradient: 'from-emerald-500 to-emerald-700' },
//     { title: 'Growth Models', description: 'Use AI to project required funding for upcoming fiscal quarters.', icon: TrendingUp, link: '/employee/predictive-modeling', gradient: 'from-indigo-500 to-indigo-700' },
//   ]

//   return (
//     <div className="min-h-screen flex bg-slate-50">
//       <Navigation role="employee" />

//       <main className="flex-1 pt-20 md:pt-0 overflow-x-hidden">
//         {/* State Official Hero Section */}
//         <section className="relative bg-slate-950 text-white overflow-hidden">
//           {/* High quality background image with overlay */}
//           <div className="absolute inset-0 z-0">
//             <img 
//               src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop" 
//               alt="Finance Background" 
//               className="w-full h-full object-cover opacity-20 mix-blend-overlay"
//             />
//             <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-900/50"></div>
//           </div>

//           <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//             <div>
//               <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full backdrop-blur-sm">
//                 <Lock size={16} className="text-blue-400" />
//                 <span className="text-sm font-semibold text-blue-300 tracking-wide uppercase">Secure Department Portal</span>
//               </div>
              
//               <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
//                 Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{user?.email?.split('@')[0] || 'Official'}</span>
//               </h1>
              
//               <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-xl">
//                 Access your state's encrypted financial ledger. Review allocated budgets, report expenditures, and collaborate securely with the central finance ministry.
//               </p>

//               <div className="flex flex-col sm:flex-row gap-4">
//                 {!user?.publicKey ? (
//                   <Link to="/employee/key-generation">
//                     <Button variant="primary" className="w-full sm:w-auto text-lg py-4 px-8 bg-blue-600 hover:bg-blue-500 border-none">
//                       Initialize Security Keys <ArrowRight size={20} className="ml-2" />
//                     </Button>
//                   </Link>
//                 ) : (
//                   <Link to="/employee/budget-analytics">
//                     <Button variant="primary" className="w-full sm:w-auto text-lg py-4 px-8 bg-blue-600 hover:bg-blue-500 border-none">
//                       Open State Dashboard <ArrowRight size={20} className="ml-2" />
//                     </Button>
//                   </Link>
//                 )}
//               </div>
//             </div>

//             {/* Quick Status Cards overlaid on hero */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:pl-12">
//               {status.map((item, idx) => {
//                 const Icon = item.icon
//                 return (
//                   <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-2xl">
//                     <div className="flex items-start justify-between mb-4">
//                       <div className={`p-3 rounded-xl ${
//                         item.color === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 
//                         item.color === 'warning' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
//                       }`}>
//                         <Icon size={24} />
//                       </div>
//                       <div className={`w-3 h-3 rounded-full ${item.color === 'success' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : item.color === 'warning' ? 'bg-orange-500 animate-pulse' : 'bg-blue-500'}`} />
//                     </div>
//                     <p className="text-slate-400 text-sm font-medium mb-1">{item.label}</p>
//                     <p className="text-2xl font-bold text-white">{item.value}</p>
//                   </div>
//                 )
//               })}
//             </div>
//           </div>
//         </section>

//         {/* Action Required Banner */}
//         {!user?.publicKey && (
//           <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg">
//             <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
//               <div className="flex items-center gap-3">
//                 <AlertTriangle size={24} className="text-orange-100" />
//                 <span className="font-semibold text-lg">Action Required: Generate your RSA cryptographic keys to unlock platform features.</span>
//               </div>
//               <Link to="/employee/key-generation" className="whitespace-nowrap px-6 py-2 bg-white text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition-colors">
//                 Setup Now
//               </Link>
//             </div>
//           </div>
//         )}

//         {/* Feature Grid */}
//         <section className="px-6 md:px-12 py-16 bg-slate-50">
//           <div className="max-w-7xl mx-auto">
//             <h2 className="text-3xl font-bold text-slate-900 mb-2">Workspace Applications</h2>
//             <p className="text-slate-500 mb-10">Select an application below to manage your department's fiscal responsibilities.</p>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               {features.map((feature, idx) => {
//                 const Icon = feature.icon
//                 const isLocked = !user?.publicKey && feature.title !== 'Key Generation'
                
//                 return (
//                   <Link key={idx} to={isLocked ? '#' : feature.link} className={`group ${isLocked ? 'opacity-70 cursor-not-allowed' : ''}`}>
//                     <Card hover={!isLocked} className="h-full bg-white border-slate-200 shadow-sm relative overflow-hidden">
//                       {isLocked && (
//                         <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
//                           <div className="bg-white/90 p-2 rounded-lg shadow-sm flex items-center gap-2">
//                             <Lock size={14} className="text-slate-500" />
//                             <span className="text-xs font-bold text-slate-700">Locked</span>
//                           </div>
//                         </div>
//                       )}
//                       <div className="flex flex-col h-full">
//                         <div className="flex items-start justify-between mb-6">
//                           <div className={`p-4 bg-gradient-to-br ${feature.gradient} rounded-xl text-white shadow-md`}>
//                             <Icon size={24} />
//                           </div>
//                           {feature.status && (
//                             <Badge variant={feature.status.includes('Active') ? 'success' : 'warning'}>
//                               {feature.status}
//                             </Badge>
//                           )}
//                         </div>
//                         <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
//                         <p className="text-sm text-slate-600 flex-1 leading-relaxed mb-6">{feature.description}</p>
//                         <div className={`flex items-center font-bold text-sm transition-all gap-1 ${isLocked ? 'text-slate-400' : 'text-blue-600 group-hover:gap-2'}`}>
//                           {isLocked ? 'Requires Access Key' : 'Launch Application'} {!isLocked && <ArrowRight size={16} />}
//                         </div>
//                       </div>
//                     </Card>
//                   </Link>
//                 )
//               })}
//             </div>
//           </div>
//         </section>

//         {/* Two Column Info Section */}
//         <section className="px-6 md:px-12 py-16 bg-white border-t border-slate-200">
//           <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
//             <div>
//               <h2 className="text-4xl font-bold text-slate-900 mb-6">Secure Collaboration Protocol</h2>
//               <p className="text-lg text-slate-600 mb-8">
//                 To ensure absolute transparency and prevent tampering, all data transmitted from your portal is signed using your private key and verified by the central authority.
//               </p>
              
//               <ul className="space-y-6">
//                 {[
//                   { title: 'End-to-End Encryption', desc: 'Your financial reports are encrypted before leaving your browser.', icon: Lock },
//                   { title: 'Immutable Ledger', desc: 'Once a transaction is verified and submitted, it cannot be altered.', icon: FileText },
//                   { title: 'Automated Compliance', desc: 'Our AI checks your submissions against national budget rules in real-time.', icon: Zap }
//                 ].map((item, idx) => {
//                   const Icon = item.icon
//                   return (
//                     <li key={idx} className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
//                       <div className="p-3 bg-blue-50 text-blue-600 rounded-lg h-fit">
//                         <Icon size={24} />
//                       </div>
//                       <div>
//                         <h4 className="font-bold text-slate-900">{item.title}</h4>
//                         <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
//                       </div>
//                     </li>
//                   )
//                 })}
//               </ul>
//             </div>

//             <div className="relative">
//               <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-3xl transform -rotate-3 scale-105 opacity-10 blur-xl"></div>
//               <img 
//                 src="https://images.unsplash.com/photo-1563986768494-4dee2763ff0f?q=80&w=2070&auto=format&fit=crop" 
//                 alt="Secure Technology" 
//                 className="rounded-3xl shadow-xl object-cover h-[500px] w-full relative z-10 border border-slate-200"
//               />
//             </div>
            
//           </div>
//         </section>

//         {/* Footer */}
//         <footer className="bg-slate-950 text-slate-400 px-6 md:px-12 py-8 border-t border-slate-900">
//           <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
//             <div className="flex items-center gap-2">
//               <Building2 className="text-blue-500" size={20} />
//               <span className="font-bold text-white">BIP State Portal</span>
//             </div>
//             <p className="text-sm">Confidential System. Unauthorized access is strictly prohibited.</p>
//             <div className="flex gap-6 text-sm">
//               <Link to="#" className="hover:text-white transition-colors">Help Center</Link>
//               <Link to="#" className="hover:text-white transition-colors">Contact Admin</Link>
//             </div>
//           </div>
//         </footer>
//       </main>
//     </div>
//   )
// }

// export default EmployeeHome






import React from 'react'
import { Key, BarChart3, AlertTriangle, TrendingUp, Lock, CheckCircle, Zap, Shield, ArrowRight, FileText, Activity, ShieldAlert, Building2, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Navigation from '../../components/Navigation'
import Badge from '../../components/Badge'
import { useAuth } from '../../context/AuthContext'

const EmployeeHome = () => {
  const { user } = useAuth()

  const status = [
    { label: 'Network Link', value: 'Encrypted', color: 'success', icon: Activity },
    { label: 'RSA-2048 Key', value: user?.publicKey ? 'Verified Active' : 'Generation Pending', color: user?.publicKey ? 'success' : 'warning', icon: Key },
    { label: 'Clearance Level', value: 'State Official', color: 'info', icon: Shield },
  ]

  const features = [
    { title: 'Security Initialization', description: 'Generate your device-specific RSA key pair to authenticate with the central ledger.', icon: Key, link: '/employee/key-generation', status: user?.publicKey ? '✓ Completed' : '⚠ Required', bg: 'bg-slate-50' },
    { title: 'Fiscal Dashboard', description: 'Live tracking of your department\'s allocated budget vs actual expenditure.', icon: BarChart3, link: '/employee/budget-analytics', bg: 'bg-blue-50' },
    { title: 'Audit & Reporting', description: 'Submit transaction logs and instantly verify them against national compliance rules.', icon: FileText, link: '/employee/risk-anomalies', bg: 'bg-emerald-50' },
    { title: 'Growth Projections', description: 'Access predictive AI models to draft accurate funding requests for next quarter.', icon: TrendingUp, link: '/employee/predictive-modeling', bg: 'bg-indigo-50' },
  ]

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      <Navigation role="employee" />

      <main className="flex-1 pt-20 md:pt-0 overflow-x-hidden">
        {/* Department Hero Section */}
        <section className="relative bg-[#0B1120] text-white overflow-hidden border-b border-blue-900/50">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120] via-[#0B1120]/95 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full backdrop-blur-md">
                <Lock size={16} className="text-blue-400" />
                <span className="text-sm font-bold text-blue-300 tracking-wide uppercase">Departmental Secure Gateway</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                Welcome back, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  {user?.email?.split('@')[0] || 'State Official'}
                </span>
              </h1>
              
              <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-2xl font-medium">
                Your portal provides direct, cryptographically-secured access to your state's fiscal ledger. Submit reports, analyze burn rates, and ensure 100% compliance with central government standards.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {!user?.publicKey ? (
                  <Link to="/employee/key-generation">
                    <Button variant="primary" className="w-full sm:w-auto text-lg py-4 px-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-none shadow-xl shadow-orange-500/20 animate-pulse">
                      Initialize Security Protocol <ArrowRight size={20} className="ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/employee/budget-analytics">
                    <Button variant="primary" className="w-full sm:w-auto text-lg py-4 px-8 bg-blue-600 hover:bg-blue-500 border-none shadow-xl shadow-blue-500/20">
                      Open Active Ledger <ArrowRight size={20} className="ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Status indicators */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Connection Status</h3>
              {status.map((item, idx) => {
                const Icon = item.icon
                return (
                  <div key={idx} className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        item.color === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 
                        item.color === 'warning' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-0.5">{item.label}</p>
                        <p className="text-lg font-bold text-white">{item.value}</p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${item.color === 'success' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : item.color === 'warning' ? 'bg-orange-500 animate-pulse' : 'bg-blue-500'}`} />
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Security Warning Banner (If no key) */}
        {!user?.publicKey && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200 shadow-inner">
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 rounded-full flex-shrink-0 mt-1">
                  <ShieldAlert size={28} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-1">Action Required: RSA Keys Not Found</h3>
                  <p className="text-slate-700 font-medium">Your node is currently restricted. You must generate a cryptographic key pair to securely encrypt your department's financial data before accessing the ledger.</p>
                </div>
              </div>
              <Link to="/employee/key-generation" className="whitespace-nowrap px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2">
                Generate Keys Now <ArrowRight size={18}/>
              </Link>
            </div>
          </div>
        )}

        {/* Tools Grid */}
        <section className="px-6 md:px-12 py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Assigned Applications</h2>
            <p className="text-slate-500 font-medium mb-12">Tools allocated to your specific clearance level.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, idx) => {
                const Icon = feature.icon
                const isLocked = !user?.publicKey && feature.title !== 'Security Initialization'
                
                return (
                  <Link key={idx} to={isLocked ? '#' : feature.link} className={`group ${isLocked ? 'cursor-not-allowed' : ''}`}>
                    <div className={`h-full bg-white rounded-3xl p-8 border ${isLocked ? 'border-slate-200 opacity-60' : 'border-slate-200 shadow-lg hover:shadow-2xl hover:-translate-y-1'} transition-all duration-300 relative overflow-hidden flex flex-col`}>
                      
                      {isLocked && (
                        <div className="absolute inset-0 bg-slate-50/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mb-3">
                            <Lock size={28} className="text-slate-400" />
                          </div>
                          <span className="text-sm font-bold text-slate-700 uppercase tracking-widest bg-white px-4 py-1.5 rounded-full shadow-sm">Locked</span>
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-8">
                        <div className={`p-4 ${feature.bg} rounded-2xl`}>
                          <Icon size={32} className="text-slate-800" />
                        </div>
                        {feature.status && (
                          <Badge variant={feature.status.includes('Completed') ? 'success' : 'warning'} className="font-bold px-3 py-1 text-xs uppercase tracking-wider">
                            {feature.status}
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                      <p className="text-slate-600 flex-1 leading-relaxed text-lg mb-8">{feature.description}</p>
                      
                      <div className={`flex items-center font-bold transition-all ${isLocked ? 'text-slate-400' : 'text-blue-600 group-hover:text-blue-700'}`}>
                        {isLocked ? 'Requires RSA Verification' : 'Launch Application'} {!isLocked && <ArrowRight size={20} className="ml-2 transform group-hover:translate-x-1 transition-transform" />}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Security Info Section */}
        <section className="px-6 md:px-12 py-24 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="order-2 lg:order-1 relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100 group">
              <div className="absolute inset-0 bg-blue-600/20 group-hover:bg-transparent transition-colors duration-500 z-10 mix-blend-multiply"></div>
              <img 
                src="https://images.unsplash.com/photo-1563986768494-4dee2763ff0f?q=80&w=2070&auto=format&fit=crop" 
                alt="Secure Technology" 
                className="w-full h-[600px] object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl z-20 border border-white">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="text-emerald-600" size={24}/>
                  <h4 className="font-bold text-slate-900 text-lg">Zero-Trust Architecture</h4>
                </div>
                <p className="text-slate-600 text-sm font-medium">BIP assumes all network traffic is hostile. Your private keys never leave your browser, ensuring absolute data sovereignty.</p>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-md mb-6">
                <FileText size={14} className="text-slate-600" />
                <span className="text-xs font-bold text-slate-600 tracking-wide uppercase">Official Protocol</span>
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-6 leading-tight">Your Responsibilities in the Network</h2>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed font-medium">
                As a verified node operator for your department, you are bound by the central cryptographic protocol. All interactions are permanently logged on the immutable ledger.
              </p>
              
              <ul className="space-y-6">
                {[
                  { title: 'Safeguard Private Keys', desc: 'If your private key is lost, access to your department\'s historical data is permanently unrecoverable.', icon: Key, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { title: 'Verify Before Signing', desc: 'You are personally accountable for the accuracy of expenditure reports signed with your digital identity.', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { title: 'Immediate Incident Reporting', desc: 'If you suspect anomalous vendor behavior, use the Risk Module to freeze transactions instantly.', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' }
                ].map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <li key={idx} className="flex gap-5 p-5 rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all bg-slate-50 group">
                      <div className={`p-4 ${item.bg} ${item.color} rounded-xl h-fit group-hover:scale-110 transition-transform`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg mb-1">{item.title}</h4>
                        <p className="text-slate-600 font-medium">{item.desc}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
            
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white px-6 md:px-12 py-8 border-t border-slate-200">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Building2 className="text-slate-400" size={20} />
              <span className="font-bold text-slate-700">State Official Portal</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Confidential System. Unauthorized access is strictly prohibited.</p>
            <div className="flex gap-6 text-sm font-bold text-slate-500">
              <Link to="#" className="hover:text-blue-600 transition-colors">Support Desk</Link>
              <Link to="#" className="hover:text-blue-600 transition-colors">Protocol Docs</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default EmployeeHome