import React from 'react'

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-primary-100 text-primary-900',
    success: 'bg-emerald-100 text-emerald-900',
    danger: 'bg-red-100 text-red-900',
    warning: 'bg-orange-100 text-orange-900',
    info: 'bg-cyan-100 text-cyan-900',
    gray: 'bg-neutral-100 text-neutral-700',
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
