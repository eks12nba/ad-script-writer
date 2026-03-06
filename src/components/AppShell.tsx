'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import {
  LayoutGrid,
  Sparkles,
  FileText,
  Layers,
  User,
  Shield,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutGrid },
  { label: 'Generate', href: '/generate', icon: Sparkles },
  { label: 'My Scripts', href: '/scripts', icon: FileText },
  { label: 'Frameworks', href: '/frameworks', icon: Layers },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Admin', href: '/admin', icon: Shield },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarContent = (
    <>
      <div className="p-4 pb-2">
        <div
          className="flex items-center gap-2"
          style={{ fontFamily: 'var(--font-press-start)' }}
        >
          {!collapsed && (
            <span
              className="text-[10px] tracking-wider"
              style={{
                color: '#8B5CF6',
                textShadow: '0 0 10px rgba(139,92,246,0.5)',
              }}
            >
              SCRIPT ENGINE
            </span>
          )}
          {collapsed && (
            <span
              className="text-[10px]"
              style={{
                color: '#8B5CF6',
                textShadow: '0 0 10px rgba(139,92,246,0.5)',
              }}
            >
              SE
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150"
              style={{
                backgroundColor: isActive ? 'rgba(139,92,246,0.1)' : 'transparent',
                borderLeft: isActive ? '3px solid #8B5CF6' : '3px solid transparent',
              }}
            >
              <Icon
                size={18}
                style={{ color: isActive ? '#8B5CF6' : '#6B6B80', flexShrink: 0 }}
              />
              {!collapsed && (
                <span
                  className="text-[9px] tracking-wider uppercase"
                  style={{
                    fontFamily: 'var(--font-press-start)',
                    color: isActive ? '#F1F1F5' : '#A1A1B5',
                  }}
                >
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 space-y-3 border-t" style={{ borderColor: '#2A2A3A' }}>
        <div className="flex items-center gap-3">
          <UserButton
            appearance={{
              elements: { avatarBox: 'w-8 h-8' },
            }}
          />
          {!collapsed && (
            <span className="text-sm" style={{ color: '#A1A1B5' }}>Account</span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg transition-colors w-full"
          style={{ color: '#6B6B80' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1A1A22')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Menu size={18} />
          {!collapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#0C0C10' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-50 flex flex-col md:hidden transition-transform duration-200"
        style={{
          width: 260,
          backgroundColor: '#141419',
          borderRight: '1px solid #2A2A3A',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <div className="flex items-center justify-end p-2">
          <button onClick={() => setMobileOpen(false)} style={{ color: '#6B6B80' }}>
            <X size={20} />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0 transition-all duration-200"
        style={{
          width: collapsed ? 64 : 220,
          backgroundColor: '#141419',
          borderRight: '1px solid #2A2A3A',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="md:hidden p-4">
          <button onClick={() => setMobileOpen(true)} style={{ color: '#A1A1B5' }}>
            <Menu size={24} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
