// import React, { useState } from 'react'
// import { Link, useLocation, useNavigate } from 'react-router-dom'
// import {
//   Menu,
//   X,
//   Home,
//   Key,
//   BarChart3,
//   AlertTriangle,
//   TrendingUp,
//   LogOut,
//   Building2,
//   User,
//   Settings,
// } from 'lucide-react'
// import { useAuth } from '../context/AuthContext'
// import Button from './Button'
// import { showSuccess } from '../utils/utils'

// const Navigation = ({ role = 'admin' }) => {
//   const [mobileOpen, setMobileOpen] = useState(false)
//   const location = useLocation()
//   const navigate = useNavigate()
//   const { user, logout } = useAuth()

//   const adminLinks = [
//     { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
//     { path: '/admin/key-management', label: 'Key Management', icon: Key },
//     { path: '/admin/budget-analytics', label: 'Budget Analytics', icon: BarChart3 },
//     { path: '/admin/risk-anomalies', label: 'Risk & Anomalies', icon: AlertTriangle },
//     { path: '/admin/predictive-modeling', label: 'Predictive Modeling', icon: TrendingUp },
//   ]

//   const employeeLinks = [
//     { path: '/employee/dashboard', label: 'Dashboard', icon: Home },
//     { path: '/employee/key-generation', label: 'Key Generation', icon: Key },
//     { path: '/employee/budget-analytics', label: 'Budget Analytics', icon: BarChart3 },
//     { path: '/employee/risk-anomalies', label: 'Risk & Anomalies', icon: AlertTriangle },
//     { path: '/employee/predictive-modeling', label: 'Predictive Modeling', icon: TrendingUp },
//   ]

//   const links = role === 'admin' ? adminLinks : employeeLinks

//   const handleLogout = () => {
//     logout()
//     showSuccess('Logged out successfully')
//     navigate('/login')
//   }

//   const isActive = (path) => location.pathname === path

//   return (
//     <>
//       {/* Desktop Navigation */}
//       <nav className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-neutral-900 text-white flex-col border-r border-neutral-800">
//         {/* Logo */}
//         <div className="p-6 border-b border-neutral-800">
//           <Link to="/" className="flex items-center gap-3">
//             <div className="p-2 bg-primary-900 rounded-lg">
//               <Building2 size={24} />
//             </div>
//             <div>
//               <h1 className="font-bold text-lg">BIP</h1>
//               <p className="text-xs text-neutral-400">Budget Intelligence</p>
//             </div>
//           </Link>
//         </div>

//         {/* User Info */}
//         {user && (
//           <div className="p-4 m-4 bg-neutral-800 rounded-lg border border-neutral-700">
//             <p className="text-xs text-neutral-400">Logged in as</p>
//             <p className="font-medium text-sm truncate">{user.email}</p>
//             <p className="text-xs text-primary-400 capitalize mt-1">{user.role} Account</p>
//           </div>
//         )}

//         {/* Navigation Links */}
//         <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
//           {links.map((link) => {
//             const Icon = link.icon
//             const active = isActive(link.path)
//             return (
//               <Link
//                 key={link.path}
//                 to={link.path}
//                 className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
//                   active
//                     ? 'bg-primary-900 text-white'
//                     : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
//                 }`}
//               >
//                 <Icon size={20} />
//                 <span className="font-medium">{link.label}</span>
//               </Link>
//             )
//           })}
//         </div>

//         {/* Footer */}
//         <div className="p-4 border-t border-neutral-800 space-y-2">
//           <button className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:bg-neutral-800 rounded-lg transition-colors duration-200">
//             <Settings size={20} />
//             <span>Settings</span>
//           </button>
//           <button
//             onClick={handleLogout}
//             className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors duration-200"
//           >
//             <LogOut size={20} />
//             <span>Logout</span>
//           </button>
//         </div>
//       </nav>

//       {/* Mobile Navigation */}
//       <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-neutral-200">
//         <div className="flex items-center justify-between p-4">
//           <Link to="/" className="flex items-center gap-2">
//             <div className="p-2 bg-primary-900 rounded-lg">
//               <Building2 size={20} className="text-white" />
//             </div>
//             <span className="font-bold text-primary-900">BIP</span>
//           </Link>
//           <button
//             onClick={() => setMobileOpen(!mobileOpen)}
//             className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
//           >
//             {mobileOpen ? <X size={24} /> : <Menu size={24} />}
//           </button>
//         </div>

//         {/* Mobile Menu */}
//         {mobileOpen && (
//           <div className="absolute top-full left-0 right-0 bg-white border-b border-neutral-200 shadow-lg">
//             <div className="p-4 space-y-2">
//               {links.map((link) => {
//                 const Icon = link.icon
//                 const active = isActive(link.path)
//                 return (
//                   <Link
//                     key={link.path}
//                     to={link.path}
//                     onClick={() => setMobileOpen(false)}
//                     className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
//                       active
//                         ? 'bg-primary-900 text-white'
//                         : 'text-neutral-700 hover:bg-neutral-100'
//                     }`}
//                   >
//                     <Icon size={20} />
//                     <span className="font-medium">{link.label}</span>
//                   </Link>
//                 )
//               })}
//               <div className="border-t border-neutral-200 pt-2 mt-2 space-y-2">
//                 <button
//                   onClick={handleLogout}
//                   className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
//                 >
//                   <LogOut size={20} />
//                   <span>Logout</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Spacer for desktop */}
//       <div className="hidden md:block w-64" />
//     </>
//   )
// }

// export default Navigation




// import React, { useState } from 'react'
// import { Link, useLocation, useNavigate } from 'react-router-dom'
// import {
//   Menu, X, Home, Key, BarChart3, AlertTriangle, TrendingUp, 
//   LogOut, Building2, Settings, ShieldCheck, Zap
// } from 'lucide-react'
// import { useAuth } from '../context/AuthContext'
// import { showSuccess } from '../utils/utils'

// const Navigation = ({ role = 'admin' }) => {
//   const [mobileOpen, setMobileOpen] = useState(false)
//   const location = useLocation()
//   const navigate = useNavigate()
//   const { user, logout } = useAuth()

//   const adminLinks = [
//     { path: '/admin/dashboard', label: 'Command Center', icon: Home },
//     { path: '/admin/key-management', label: 'Access Control', icon: Key },
//     { path: '/admin/budget-analytics', label: 'Fiscal Analytics', icon: BarChart3 },
//     { path: '/admin/risk-anomalies', label: 'Threat Detection', icon: AlertTriangle },
//     { path: '/admin/predictive-modeling', label: 'AI Forecasting', icon: TrendingUp },
//   ]

//   const employeeLinks = [
//     { path: '/employee/dashboard', label: 'State Dashboard', icon: Home },
//     { path: '/employee/key-generation', label: 'Security Setup', icon: Key },
//     { path: '/employee/budget-analytics', label: 'My Allocations', icon: BarChart3 },
//     { path: '/employee/risk-anomalies', label: 'Report Logs', icon: AlertTriangle },
//     { path: '/employee/predictive-modeling', label: 'Growth Models', icon: TrendingUp },
//   ]

//   const links = role === 'admin' ? adminLinks : employeeLinks

//   const handleLogout = () => {
//     logout()
//     showSuccess('Secure session terminated')
//     navigate('/login')
//   }

//   const isActive = (path) => location.pathname === path

//   return (
//     <>
//       {/* Desktop Navigation */}
//       <nav className="hidden md:flex fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-blue-950 via-indigo-950 to-blue-950 text-blue-100 flex-col border-r border-blue-900/50 shadow-2xl z-50">
//         {/* Logo Section */}
//         <div className="p-6 border-b border-blue-800/40 bg-blue-900/20 backdrop-blur-xl relative overflow-hidden">
//           <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
//           <Link to="/" className="flex items-center gap-3 group relative z-10">
//             <div className="p-2.5 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all duration-300">
//               <Building2 size={24} className="text-white" />
//             </div>
//             <div>
//               <h1 className="font-bold text-xl text-white tracking-tight">BIP Nexus</h1>
//               <p className="text-xs text-blue-300 font-medium uppercase tracking-wider">Intelligence</p>
//             </div>
//           </Link>
//         </div>

//         {/* User Profile Card */}
//         {user && (
//           <div className="p-4 mx-4 mt-6 bg-blue-900/30 rounded-2xl border border-blue-800/50 flex items-center gap-3 hover:bg-blue-900/50 transition-colors cursor-default shadow-inner">
//             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center border-2 border-blue-400/30 flex-shrink-0 shadow-lg">
//               <span className="text-white font-bold text-sm">
//                 {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
//               </span>
//             </div>
//             <div className="overflow-hidden">
//               <p className="text-[11px] text-blue-300 font-medium mb-0.5 uppercase tracking-wider">Active Session</p>
//               <p className="font-semibold text-sm text-white truncate">{user.email || 'Official User'}</p>
//               <div className="flex items-center gap-1.5 mt-1">
//                 <ShieldCheck size={12} className="text-emerald-400" />
//                 <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{role}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Navigation Links */}
//         <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 scrollbar-hide">
//           <p className="px-3 text-[11px] font-bold text-blue-400/70 uppercase tracking-widest mb-4">Core Modules</p>
//           {links.map((link) => {
//             const Icon = link.icon
//             const active = isActive(link.path)
//             return (
//               <Link
//                 key={link.path}
//                 to={link.path}
//                 className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
//                   active
//                     ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/50 border border-blue-500/30'
//                     : 'text-blue-200 hover:bg-blue-800/40 hover:text-white border border-transparent'
//                 }`}
//               >
//                 {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white]"></div>}
//                 <Icon size={20} className={`${active ? 'text-white' : 'text-blue-400 group-hover:text-blue-300'} transition-colors`} />
//                 <span className="font-medium text-sm tracking-wide">{link.label}</span>
//               </Link>
//             )
//           })}
//         </div>

//         {/* Footer Actions */}
//         <div className="p-4 border-t border-blue-800/40 bg-blue-950/50 space-y-2 backdrop-blur-md">
//           <button className="w-full flex items-center gap-3 px-4 py-3 text-blue-300 hover:bg-blue-800/50 hover:text-white rounded-xl transition-all duration-200 text-sm font-medium">
//             <Settings size={20} className="text-blue-400" />
//             <span>System Settings</span>
//           </button>
//           <button
//             onClick={handleLogout}
//             className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-500/20 hover:text-red-200 rounded-xl transition-all duration-200 text-sm font-medium"
//           >
//             <LogOut size={20} />
//             <span>Secure Logout</span>
//           </button>
//         </div>
//       </nav>

//       {/* Mobile Navigation */}
//       <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-blue-950 border-b border-blue-800 shadow-xl">
//         <div className="flex items-center justify-between p-4">
//           <Link to="/" className="flex items-center gap-2">
//             <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
//               <Building2 size={20} className="text-white" />
//             </div>
//             <span className="font-bold text-white tracking-wide">BIP Nexus</span>
//           </Link>
//           <button
//             onClick={() => setMobileOpen(!mobileOpen)}
//             className="p-2 text-blue-200 hover:bg-blue-800 rounded-lg transition-colors"
//           >
//             {mobileOpen ? <X size={24} /> : <Menu size={24} />}
//           </button>
//         </div>

//         {/* Mobile Menu Dropdown */}
//         {mobileOpen && (
//           <div className="absolute top-full left-0 right-0 bg-gradient-to-b from-blue-950 to-indigo-950 border-b border-blue-800 shadow-2xl max-h-[calc(100vh-70px)] overflow-y-auto">
//             <div className="p-4 space-y-1">
//               {links.map((link) => {
//                 const Icon = link.icon
//                 const active = isActive(link.path)
//                 return (
//                   <Link
//                     key={link.path}
//                     to={link.path}
//                     onClick={() => setMobileOpen(false)}
//                     className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
//                       active
//                         ? 'bg-blue-600 text-white'
//                         : 'text-blue-200 hover:bg-blue-800 hover:text-white'
//                     }`}
//                   >
//                     <Icon size={20} />
//                     <span className="font-medium">{link.label}</span>
//                   </Link>
//                 )
//               })}
//               <div className="border-t border-blue-800/50 pt-2 mt-2">
//                 <button
//                   onClick={handleLogout}
//                   className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-500/20 rounded-xl transition-colors"
//                 >
//                   <LogOut size={20} />
//                   <span className="font-medium">Secure Logout</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="hidden md:block w-72 flex-shrink-0" />
//     </>
//   )
// }

// export default Navigation













import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Menu, X, Home, Key, BarChart3, AlertTriangle, TrendingUp, 
  LogOut, Building2, Settings, ShieldCheck, Zap
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { showSuccess } from '../utils/utils'

const Navigation = ({ role = 'admin' }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Command Center', icon: Home },
    { path: '/admin/key-management', label: 'Access Control', icon: Key },
    { path: '/admin/budget-analytics', label: 'Fiscal Analytics', icon: BarChart3 },
    { path: '/admin/risk-anomalies', label: 'Threat Detection', icon: AlertTriangle },
    { path: '/admin/predictive-modeling', label: 'AI Forecasting', icon: TrendingUp },
  ]

  const employeeLinks = [
    { path: '/employee/dashboard', label: 'State Dashboard', icon: Home },
    { path: '/employee/key-generation', label: 'Security Setup', icon: Key },
    { path: '/employee/budget-analytics', label: 'My Allocations', icon: BarChart3 },
    { path: '/employee/risk-anomalies', label: 'Report Logs', icon: AlertTriangle },
    { path: '/employee/predictive-modeling', label: 'Growth Models', icon: TrendingUp },
  ]

  const links = role === 'admin' ? adminLinks : employeeLinks

  const handleLogout = () => {
    logout()
    showSuccess('Secure session terminated')
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-blue-950 via-indigo-950 to-blue-950 text-blue-100 flex-col border-r border-blue-900/50 shadow-2xl z-50">
        {/* Logo Section */}
        <div className="p-6 border-b border-blue-800/40 bg-blue-900/20 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
          <Link to="/" className="flex items-center gap-3 group relative z-10">
            <div className="p-2.5 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all duration-300">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-white tracking-tight">BIP Nexus</h1>
              <p className="text-xs text-blue-300 font-medium uppercase tracking-wider">Intelligence</p>
            </div>
          </Link>
        </div>

        {/* User Profile Card */}
        {user && (
          <div className="p-4 mx-4 mt-6 bg-blue-900/30 rounded-2xl border border-blue-800/50 flex items-center gap-3 hover:bg-blue-900/50 transition-colors cursor-default shadow-inner">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center border-2 border-blue-400/30 flex-shrink-0 shadow-lg">
              <span className="text-white font-bold text-sm">
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] text-blue-300 font-medium mb-0.5 uppercase tracking-wider">Active Session</p>
              <p className="font-semibold text-sm text-white truncate">{user.email || 'Official User'}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <ShieldCheck size={12} className="text-emerald-400" />
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 scrollbar-hide">
          <p className="px-3 text-[11px] font-bold text-blue-400/70 uppercase tracking-widest mb-4">Core Modules</p>
          {links.map((link) => {
            const Icon = link.icon
            const active = isActive(link.path)
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/50 border border-blue-500/30'
                    : 'text-blue-200 hover:bg-blue-800/40 hover:text-white border border-transparent'
                }`}
              >
                {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white]"></div>}
                <Icon size={20} className={`${active ? 'text-white' : 'text-blue-400 group-hover:text-blue-300'} transition-colors`} />
                <span className="font-medium text-sm tracking-wide">{link.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-blue-800/40 bg-blue-950/50 space-y-2 backdrop-blur-md">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-blue-300 hover:bg-blue-800/50 hover:text-white rounded-xl transition-all duration-200 text-sm font-medium">
            <Settings size={20} className="text-blue-400" />
            <span>System Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-500/20 hover:text-red-200 rounded-xl transition-all duration-200 text-sm font-medium"
          >
            <LogOut size={20} />
            <span>Secure Logout</span>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-blue-950 border-b border-blue-800 shadow-xl">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Building2 size={20} className="text-white" />
            </div>
            <span className="font-bold text-white tracking-wide">BIP Nexus</span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-blue-200 hover:bg-blue-800 rounded-lg transition-colors"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileOpen && (
          <div className="absolute top-full left-0 right-0 bg-gradient-to-b from-blue-950 to-indigo-950 border-b border-blue-800 shadow-2xl max-h-[calc(100vh-70px)] overflow-y-auto">
            <div className="p-4 space-y-1">
              {links.map((link) => {
                const Icon = link.icon
                const active = isActive(link.path)
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                )
              })}
              <div className="border-t border-blue-800/50 pt-2 mt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-500/20 rounded-xl transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Secure Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="hidden md:block w-72 flex-shrink-0" />
    </>
  )
}

export default Navigation