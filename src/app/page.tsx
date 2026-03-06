'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import LoadingScreen from '@/components/LoadingScreen'
import OnboardingWizard from '@/components/onboarding/OnboardingWizard'
import AppShell from '@/components/AppShell'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import StatusDot from '@/components/ui/StatusDot'

function HomeContent() {
  const searchParams = useSearchParams()
  const forceWelcome = searchParams.get('welcome') === 'true'

  const [showLoading, setShowLoading] = useState(true)
  const [checkingProfile, setCheckingProfile] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (showLoading) return

    const checkProfile = async () => {
      try {
        const res = await fetch('/api/profile')
        if (res.ok) {
          const data = await res.json()
          if (forceWelcome || !data.user?.hasOnboarded) {
            setShowOnboarding(true)
          } else {
            setReady(true)
          }
        } else {
          setReady(true)
        }
      } catch {
        setReady(true)
      } finally {
        setCheckingProfile(false)
      }
    }

    checkProfile()
  }, [showLoading, forceWelcome])

  if (showLoading) {
    return <LoadingScreen onDismiss={() => setShowLoading(false)} />
  }

  if (checkingProfile) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ backgroundColor: '#0C0C10' }}
      >
        <svg
          className="animate-spin"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#8B5CF6"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
        </svg>
      </div>
    )
  }

  if (showOnboarding) {
    return (
      <OnboardingWizard
        onComplete={() => {
          setShowOnboarding(false)
          setReady(true)
        }}
      />
    )
  }

  if (ready) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold" style={{ color: '#F1F1F5' }}>
              Dashboard
            </h1>
            <StatusDot color="green" size="sm" />
            <Badge variant="green" glow>
              ONLINE
            </Badge>
          </div>
          <Card>
            <p style={{ color: '#A1A1B5' }}>
              Dashboard coming soon. Your pit wall telemetry awaits.
            </p>
          </Card>
        </div>
      </AppShell>
    )
  }

  return null
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0" style={{ backgroundColor: '#0C0C10' }} />
      }
    >
      <HomeContent />
    </Suspense>
  )
}
