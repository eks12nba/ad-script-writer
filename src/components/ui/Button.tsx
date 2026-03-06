'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const sizeStyles = {
  sm: { padding: '6px 12px', fontSize: '13px' },
  md: { padding: '8px 16px', fontSize: '14px' },
  lg: { padding: '12px 24px', fontSize: '15px' },
}

const variantStyles = {
  primary: {
    backgroundColor: '#8B5CF6',
    color: '#FFFFFF',
    boxShadow: '0 0 20px rgba(139,92,246,0.25)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#A1A1B5',
    boxShadow: 'none',
  },
  danger: {
    backgroundColor: 'transparent',
    color: '#EF4444',
    boxShadow: 'none',
  },
}

const hoverStyles = {
  primary: { filter: 'brightness(1.15)' },
  ghost: { backgroundColor: '#1A1A22' },
  danger: { backgroundColor: 'rgba(239,68,68,0.1)' },
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150"
      style={{
        ...sizeStyles[size],
        ...variantStyles[variant],
        opacity: disabled || loading ? 0.5 : 1,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        fontWeight: 500,
        border: 'none',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, hoverStyles[variant])
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.filter = ''
          e.currentTarget.style.backgroundColor = variantStyles[variant].backgroundColor
        }
      }}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
        </svg>
      )}
      {children}
    </button>
  )
}
