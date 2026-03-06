'use client'

import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-xl p-6 transition-all duration-200 ${className}`}
      style={{
        backgroundColor: '#1E1E28',
        border: '1px solid #2A2A3A',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#8B5CF6'
        e.currentTarget.style.boxShadow = '0 0 20px rgba(139,92,246,0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#2A2A3A'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {children}
    </div>
  )
}
