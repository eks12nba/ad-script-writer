'use client'

import { ReactNode } from 'react'

type BadgeVariant = 'purple' | 'green' | 'red' | 'gold' | 'blue' | 'gray'

interface BadgeProps {
  variant?: BadgeVariant
  glow?: boolean
  children: ReactNode
}

const colors: Record<BadgeVariant, string> = {
  purple: '#8B5CF6',
  green: '#22C55E',
  red: '#EF4444',
  gold: '#F59E0B',
  blue: '#3B82F6',
  gray: '#6B7280',
}

export default function Badge({ variant = 'purple', glow = false, children }: BadgeProps) {
  const color = colors[variant]

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `${color}15`,
        color,
        border: `1px solid ${color}30`,
      }}
    >
      {glow && (
        <span
          className="inline-block rounded-full"
          style={{
            width: '6px',
            height: '6px',
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}`,
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}
        />
      )}
      {children}
    </span>
  )
}
