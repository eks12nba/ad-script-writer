'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const statusMessages = [
  'Initializing script engine...',
  'Loading proven frameworks...',
  'Calibrating AI models...',
  'Analyzing 500+ winning scripts...',
  'Preparing your workspace...',
]

interface Particle {
  id: number
  emoji: string
  angle: number
  distance: number
  rotation: number
  delay: number
}

function generateParticles(): Particle[] {
  const emojis = ['\uD83D\uDCB5', '\uD83D\uDCB8', '\uD83D\uDCB5', '\uD83D\uDCB8', '$', '\uD83D\uDCB5', '\uD83D\uDCB8', '$', '\uD83D\uDCB5', '\uD83D\uDCB8', '$', '\uD83D\uDCB5', '\uD83D\uDCB8', '$', '\uD83D\uDCB5', '\uD83D\uDCB8', '$', '\uD83D\uDCB5', '\uD83D\uDCB8', '$']
  return emojis.map((emoji, i) => ({
    id: i,
    emoji,
    angle: (360 / emojis.length) * i + (Math.random() * 30 - 15),
    distance: 80 + Math.random() * 120,
    rotation: Math.random() * 360,
    delay: Math.random() * 0.3,
  }))
}

export default function LoadingScreen({ onDismiss }: { onDismiss: () => void }) {
  const [progress, setProgress] = useState(0)
  const [statusIndex, setStatusIndex] = useState(0)
  const [showText, setShowText] = useState(false)
  const [showMoney, setShowMoney] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [particles] = useState(generateParticles)
  const [showParticles, setShowParticles] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hasPlayedSound = useRef(false)

  const hasVisited = typeof document !== 'undefined' && document.cookie.includes('hasVisited=true')

  const dismiss = useCallback(() => {
    setFadeOut(true)
    setTimeout(() => onDismiss(), 400)
  }, [onDismiss])

  useEffect(() => {
    const t1 = setTimeout(() => setShowText(true), 200)
    const t2 = setTimeout(() => setShowMoney(true), 600)
    const t3 = setTimeout(() => setShowParticles(true), 900)
    const t4 = setTimeout(() => setShowProgress(true), 1800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

  useEffect(() => {
    if (!showProgress) return
    const start = Date.now()
    const duration = 2000
    const frame = () => {
      const elapsed = Date.now() - start
      const p = Math.min(elapsed / duration, 1)
      setProgress(p * 100)
      if (p < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }, [showProgress])

  useEffect(() => {
    if (!showProgress) return
    const interval = setInterval(() => {
      setStatusIndex((i) => (i + 1) % statusMessages.length)
    }, 700)
    return () => clearInterval(interval)
  }, [showProgress])

  useEffect(() => {
    if (progress < 100 || hasPlayedSound.current) return
    hasPlayedSound.current = true
    try {
      const audio = new Audio('/f1_team_radio.mp3')
      audioRef.current = audio
      audio.volume = 0.5
      audio.play().catch(() => {})
    } catch {}

    if (hasVisited) {
      setTimeout(dismiss, 1000)
    } else {
      setTimeout(() => setShowButton(true), 400)
    }
  }, [progress, hasVisited, dismiss])

  const handleEnter = () => {
    document.cookie = 'hasVisited=true; path=/; max-age=31536000'
    dismiss()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        backgroundColor: '#0C0C10',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 400ms ease-out',
      }}
    >
      <div className="absolute top-6 left-6">
        <img
          src="/logo.png"
          alt="Logo"
          style={{
            height: '50px',
            width: 'auto',
            filter: 'drop-shadow(0 0 12px rgba(139,92,246,0.3))',
          }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          className="text-center"
          style={{
            opacity: showText ? 1 : 0,
            transform: showText ? 'scale(1)' : 'scale(0.9)',
            transition: 'all 600ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <h1
            className="text-[32px] font-bold"
            style={{
              color: '#FFFFFF',
              textShadow: '0 0 40px rgba(139,92,246,0.3), 0 0 80px rgba(139,92,246,0.1)',
            }}
          >
            Let&apos;s Make Some Ads
          </h1>
        </div>

        <div
          className="relative mt-8"
          style={{ width: '200px', height: '200px' }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: showMoney ? 1 : 0,
              transform: showMoney ? 'scale(1)' : 'scale(0)',
              transition: 'all 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <span style={{ fontSize: '70px' }}>{'\uD83D\uDCB0'}</span>
          </div>

          {showParticles && particles.map((p) => {
            const rad = (p.angle * Math.PI) / 180
            const x = Math.cos(rad) * p.distance
            const y = Math.sin(rad) * p.distance
            return (
              <span
                key={p.id}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  fontSize: p.emoji === '$' ? '20px' : '28px',
                  color: p.emoji === '$' ? '#22C55E' : undefined,
                  fontWeight: p.emoji === '$' ? 700 : undefined,
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${p.rotation}deg)`,
                  opacity: 0,
                  animation: `particle-fly 1.2s ${p.delay}s ease-out forwards`,
                }}
              >
                {p.emoji}
              </span>
            )
          })}
        </div>

        {showProgress && (
          <div className="mt-4 flex flex-col items-center gap-4" style={{ animation: 'fade-in 400ms ease-out' }}>
            <div
              style={{
                width: '350px',
                height: '4px',
                backgroundColor: '#2A2A3A',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)',
                  borderRadius: '2px',
                  transition: 'width 50ms linear',
                }}
              />
            </div>

            <p
              className="text-[13px]"
              style={{
                color: '#A1A1B5',
                animation: 'fade-in 300ms ease-out',
              }}
              key={statusIndex}
            >
              {statusMessages[statusIndex]}
            </p>
          </div>
        )}

        {showButton && !hasVisited && (
          <button
            onClick={handleEnter}
            className="mt-8 px-8 py-3 rounded-lg font-medium text-white transition-all duration-200"
            style={{
              backgroundColor: '#8B5CF6',
              boxShadow: '0 0 30px rgba(139,92,246,0.4)',
              animation: 'fade-in 500ms ease-out',
              fontSize: '15px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.filter = '')}
          >
            Enter the Pit Wall &rarr;
          </button>
        )}
      </div>

      <style>{`
        @keyframes particle-fly {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(0px, 0px) rotate(0deg) scale(0.5);
          }
          60% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(1);
          }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
