'use client'

import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export default function Input({ label, style, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          className="uppercase tracking-wider"
          style={{
            fontSize: '11px',
            letterSpacing: '0.5px',
            color: '#6B6B80',
            fontWeight: 500,
          }}
        >
          {label}
        </label>
      )}
      <input
        placeholder={props.placeholder}
        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-150 placeholder:text-text-dim"
        style={{
          backgroundColor: '#1A1A22',
          border: '1px solid #2A2A3A',
          color: '#F1F1F5',
          borderLeftWidth: '3px',
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderLeftColor = '#8B5CF6'
          e.currentTarget.style.boxShadow = '0 0 10px rgba(139,92,246,0.15)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderLeftColor = '#2A2A3A'
          e.currentTarget.style.boxShadow = 'none'
        }}
        {...props}
      />
    </div>
  )
}
