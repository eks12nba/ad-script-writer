'use client'

type DotColor = 'green' | 'red' | 'gold' | 'blue' | 'purple'
type DotSize = 'sm' | 'md' | 'lg'

interface StatusDotProps {
  color?: DotColor
  size?: DotSize
}

const colors: Record<DotColor, string> = {
  green: '#22C55E',
  red: '#EF4444',
  gold: '#F59E0B',
  blue: '#3B82F6',
  purple: '#8B5CF6',
}

const sizes: Record<DotSize, number> = {
  sm: 6,
  md: 8,
  lg: 10,
}

export default function StatusDot({ color = 'green', size = 'md' }: StatusDotProps) {
  const c = colors[color]
  const s = sizes[size]

  return (
    <span
      className="inline-block rounded-full"
      style={{
        width: `${s}px`,
        height: `${s}px`,
        backgroundColor: c,
        boxShadow: `0 0 ${s}px ${c}`,
        animation: 'pulse-glow 2s ease-in-out infinite',
      }}
    />
  )
}
