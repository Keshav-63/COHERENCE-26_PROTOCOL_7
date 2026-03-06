import React from 'react'

const Card = ({
  children,
  className = '',
  hover = false,
  border = true,
  shadow = 'glass',
  onClick = null,
}) => {
  const baseStyles = 'rounded-xl p-6 bg-white transition-all duration-300'

  const shadows = {
    glass: 'shadow-glass',
    light: 'shadow-sm',
    lift: 'shadow-lift',
    none: '',
  }

  const borderStyle = border ? 'border border-neutral-200' : ''
  const hoverStyle = hover ? 'cursor-pointer hover:shadow-lift hover:-translate-y-1' : ''

  return (
    <div
      className={`${baseStyles} ${shadows[shadow]} ${borderStyle} ${hoverStyle} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default Card
