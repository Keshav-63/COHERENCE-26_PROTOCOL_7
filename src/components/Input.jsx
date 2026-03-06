import React, { forwardRef } from 'react'

const Input = forwardRef(
  (
    {
      label,
      placeholder,
      type = 'text',
      error,
      disabled = false,
      className = '',
      icon: Icon,
      onKeyPress = null,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
              <Icon size={20} />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            onKeyPress={onKeyPress}
            className={`
              w-full px-4 py-2.5 rounded-lg border-2 border-neutral-200 
              text-neutral-900 placeholder-neutral-400
              focus:border-primary-900 focus:outline-none
              focus:ring-2 focus:ring-primary-900/10
              disabled:bg-neutral-100 disabled:cursor-not-allowed
              transition-all duration-200
              ${Icon ? 'pl-10' : ''}
              ${error ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
