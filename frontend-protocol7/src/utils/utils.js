import { toast } from 'sonner'

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(value)
}

export const formatNumber = (value) => {
  return new Intl.NumberFormat('en-IN').format(value)
}

export const formatPercentage = (value, decimals = 1) => {
  return `${parseFloat(value).toFixed(decimals)}%`
}

export const showSuccess = (message) => {
  toast.success(message, {
    duration: 3000,
    style: { background: '#10b981', color: 'white' },
  })
}

export const showError = (message) => {
  toast.error(message, {
    duration: 3000,
    style: { background: '#ef4444', color: 'white' },
  })
}

export const showInfo = (message) => {
  toast(message, {
    duration: 3000,
    style: { background: '#0052FF', color: 'white' },
  })
}

export const showWarning = (message) => {
  toast(message, {
    duration: 3000,
    style: { background: '#f97316', color: 'white' },
  })
}

export const generateTemporaryPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export const generateInvitationToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const generatePaginationItems = (currentPage, totalPages) => {
  const items = []
  const maxVisible = 5

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      items.push(i)
    }
  } else {
    items.push(1)
    if (currentPage > 3) items.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (items[items.length - 1] !== '...') items.push(i)
    }
    if (currentPage < totalPages - 2) items.push('...')
    items.push(totalPages)
  }

  return items
}

export const getAnomalySeverityColor = (severity) => {
  const colors = {
    critical: 'text-red-600 bg-red-50',
    high: 'text-orange-600 bg-orange-50',
    medium: 'text-yellow-600 bg-yellow-50',
    low: 'text-blue-600 bg-blue-50',
  }
  return colors[severity] || colors.low
}

export const getAnomalySeverityBadgeColor = (severity) => {
  const colors = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-blue-100 text-blue-700',
  }
  return colors[severity] || colors.low
}

export const getStatusColor = (status) => {
  const colors = {
    active: 'text-green-600 bg-green-50',
    pending: 'text-yellow-600 bg-yellow-50',
    inactive: 'text-gray-600 bg-gray-50',
    flagged: 'text-red-600 bg-red-50',
    investigating: 'text-orange-600 bg-orange-50',
    resolved: 'text-green-600 bg-green-50',
  }
  return colors[status] || colors.inactive
}

export const calculateBudgetUtilization = (spent, allocated) => {
  if (allocated === 0) return 0
  return Math.round((spent / allocated) * 100)
}

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
}
