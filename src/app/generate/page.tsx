'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Badge from '@/components/ui/Badge'
import StatusDot from '@/components/ui/StatusDot'
import { Copy, Check, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react'

interface Framework {
  id: string
  name: string
  slug: string
  description: string
}

interface ProfileData {
  serviceName: string
  tangibleService: string
  directOutcome: string
  benefitsOfOutcome: string
  differentiators: string
  caseStudies: string
  impliedAuthority: string
  coreOutcome: string
  avatars: string
  deliverablesList: string
  clientProcess: string
}

interface Script {
  id: string
  title: string
  hook: string
  body: string
  cta: string
  fullScript: string
  frameworkName: string
}

const emptyProfile: ProfileData = {
  serviceName: '',
  tangibleService: '',
  directOutcome: '',
  benefitsOfOutcome: '',
  differentiators: '',
  caseStudies: '',
  impliedAuthority: '',
  coreOutcome: '',
  avatars: '[]',
  deliverablesList: '',
  clientProcess: '',
}

const loadingMessages = [
  'Studying your offer...',
  'Crafting hooks that stop the scroll...',
  'Writing body copy that sells...',
  'Polishing your CTAs...',
  'Making sure nothing sounds like AI...',
  'Almost there...',
]

export default function GeneratePage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [frameworks, setFrameworks] = useState<Framework[]>([])
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null)
  const [profile, setProfile] = useState<ProfileData>(emptyProfile)
  const [selectedAvatar, setSelectedAvatar] = useState('')
  const [avatarMode, setAvatarMode] = useState<'saved' | 'custom'>('saved')
  const [numberOfScripts, setNumberOfScripts] = useState(3)
  const [generatedScripts, setGeneratedScripts] = useState<Script[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedScript, setExpandedScript] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0)
  const [genError, setGenError] = useState<string | null>(null)

  const parsedAvatars: string[] = (() => {
    try {
      const arr = JSON.parse(profile.avatars || '[]')
      return Array.isArray(arr) ? arr.filter((a: string) => a && a.trim()) : []
    } catch {
      return []
    }
  })()

  useEffect(() => {
    const load = async () => {
      try {
        const [fwRes, profRes] = await Promise.all([
          fetch('/api/frameworks'),
          fetch('/api/profile'),
        ])
        if (fwRes.ok) {
          const fwData = await fwRes.json()
          setFrameworks(fwData.frameworks || [])
        }
        if (profRes.ok) {
          const profData = await profRes.json()
          if (profData.profile) {
            setProfile({
              serviceName: profData.profile.serviceName || '',
              tangibleService: profData.profile.tangibleService || '',
              directOutcome: profData.profile.directOutcome || '',
              benefitsOfOutcome: profData.profile.benefitsOfOutcome || '',
              differentiators: profData.profile.differentiators || '',
              caseStudies: profData.profile.caseStudies || '',
              impliedAuthority: profData.profile.impliedAuthority || '',
              coreOutcome: profData.profile.coreOutcome || '',
              avatars: profData.profile.avatars || '[]',
              deliverablesList: profData.profile.deliverablesList || '',
              clientProcess: profData.profile.clientProcess || '',
            })
            const avatars = (() => {
              try {
                const arr = JSON.parse(profData.profile.avatars || '[]')
                return Array.isArray(arr) ? arr.filter((a: string) => a && a.trim()) : []
              } catch {
                return []
              }
            })()
            if (avatars.length > 0) {
              setSelectedAvatar(avatars[0])
              setAvatarMode('saved')
            }
          }
        }
      } catch {
        // continue with empty data
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!isGenerating) return
    const interval = setInterval(() => {
      setLoadingMsgIndex((i) => (i + 1) % loadingMessages.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [isGenerating])

  const handleGenerate = async () => {
    if (!selectedFramework) return
    setIsGenerating(true)
    setGenError(null)
    setStep(3)
    setLoadingMsgIndex(0)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frameworkId: selectedFramework.id,
          numberOfScripts,
          selectedAvatar,
          overrides: {
            serviceName: profile.serviceName || null,
            tangibleService: profile.tangibleService || null,
            directOutcome: profile.directOutcome || null,
            benefitsOfOutcome: profile.benefitsOfOutcome || null,
            differentiators: profile.differentiators || null,
            caseStudies: profile.caseStudies || null,
            impliedAuthority: profile.impliedAuthority || null,
            coreOutcome: profile.coreOutcome || null,
            deliverablesList: profile.deliverablesList || null,
            clientProcess: profile.clientProcess || null,
          },
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Generation failed')
      }

      const data = await res.json()
      setGeneratedScripts(data.scripts || [])
      if (data.scripts?.length > 0) {
        setExpandedScript(data.scripts[0].id)
      }
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async (script: Script) => {
    await navigator.clipboard.writeText(script.fullScript)
    setCopiedId(script.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const updateProfile = (field: keyof ProfileData, value: string) => {
    setProfile((p) => ({ ...p, [field]: value }))
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-32">
          <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
            <circle cx="12" cy="12" r="10" opacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
          </svg>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      {/* STEP 1 — Choose Framework */}
      {step === 1 && (
        <div className="space-y-6 max-w-4xl">
          <div>
            <h1 className="text-[24px] font-bold" style={{ color: '#F1F1F5' }}>
              Choose Your Approach
            </h1>
            <p className="text-[15px] mt-1" style={{ color: '#A1A1B5' }}>
              Pick a creative direction, or go Freestyle for maximum variety
            </p>
          </div>

          {/* Freestyle card — featured */}
          {frameworks.filter((f) => f.slug === 'freestyle').map((fw) => (
            <div
              key={fw.id}
              onClick={() => setSelectedFramework(fw)}
              className="rounded-xl p-6 cursor-pointer transition-all duration-200"
              style={{
                background: selectedFramework?.id === fw.id
                  ? 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.1))'
                  : '#1E1E28',
                border: selectedFramework?.id === fw.id
                  ? '2px solid #8B5CF6'
                  : '2px solid transparent',
                backgroundClip: 'padding-box',
                boxShadow: selectedFramework?.id === fw.id
                  ? '0 0 30px rgba(139,92,246,0.2)'
                  : 'none',
                position: 'relative',
              }}
            >
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: selectedFramework?.id !== fw.id
                    ? 'linear-gradient(135deg, #8B5CF6, #3B82F6) border-box'
                    : 'none',
                  mask: selectedFramework?.id !== fw.id
                    ? 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)'
                    : 'none',
                  WebkitMask: selectedFramework?.id !== fw.id
                    ? 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)'
                    : 'none',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  padding: '2px',
                  pointerEvents: 'none',
                }}
              />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-[16px] font-bold" style={{ color: '#F1F1F5' }}>{fw.name}</h3>
                  <Badge variant="purple" glow>Recommended</Badge>
                </div>
                <p className="text-[14px]" style={{ color: '#A1A1B5' }}>{fw.description}</p>
              </div>
            </div>
          ))}

          {/* Other frameworks grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {frameworks.filter((f) => f.slug !== 'freestyle').map((fw) => (
              <div
                key={fw.id}
                onClick={() => setSelectedFramework(fw)}
                className="rounded-xl p-5 cursor-pointer transition-all duration-200"
                style={{
                  backgroundColor: '#1E1E28',
                  border: selectedFramework?.id === fw.id
                    ? '2px solid #8B5CF6'
                    : '2px solid #2A2A3A',
                  boxShadow: selectedFramework?.id === fw.id
                    ? '0 0 20px rgba(139,92,246,0.15)'
                    : 'none',
                }}
              >
                <h3 className="text-[15px] font-bold mb-1" style={{ color: '#F1F1F5' }}>{fw.name}</h3>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{
                    color: '#A1A1B5',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {fw.description}
                </p>
              </div>
            ))}
          </div>

          <Button
            onClick={() => setStep(2)}
            disabled={!selectedFramework}
            size="lg"
          >
            Next: Customize Inputs &rarr;
          </Button>
        </div>
      )}

      {/* STEP 2 — Customize Inputs */}
      {step === 2 && (
        <div className="space-y-6 max-w-3xl">
          <div>
            <h1 className="text-[24px] font-bold" style={{ color: '#F1F1F5' }}>
              Customize Your Inputs
            </h1>
            <p className="text-[15px] mt-1" style={{ color: '#A1A1B5' }}>
              Pre-filled from your profile. Tweak anything for this batch.
            </p>
          </div>

          <Card>
            <div className="space-y-5">
              {/* Avatar selection */}
              <div>
                <label
                  className="uppercase tracking-wider block mb-2"
                  style={{ fontSize: '11px', letterSpacing: '0.5px', color: '#6B6B80', fontWeight: 500 }}
                >
                  Target Avatar
                </label>
                {parsedAvatars.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAvatarMode('saved')}
                        className="px-3 py-1.5 rounded-lg text-sm transition-all"
                        style={{
                          backgroundColor: avatarMode === 'saved' ? '#8B5CF6' : '#1A1A22',
                          color: avatarMode === 'saved' ? '#FFF' : '#A1A1B5',
                          border: '1px solid',
                          borderColor: avatarMode === 'saved' ? '#8B5CF6' : '#2A2A3A',
                        }}
                      >
                        Saved Avatars
                      </button>
                      <button
                        onClick={() => { setAvatarMode('custom'); setSelectedAvatar('') }}
                        className="px-3 py-1.5 rounded-lg text-sm transition-all"
                        style={{
                          backgroundColor: avatarMode === 'custom' ? '#8B5CF6' : '#1A1A22',
                          color: avatarMode === 'custom' ? '#FFF' : '#A1A1B5',
                          border: '1px solid',
                          borderColor: avatarMode === 'custom' ? '#8B5CF6' : '#2A2A3A',
                        }}
                      >
                        Custom
                      </button>
                    </div>
                    {avatarMode === 'saved' ? (
                      <select
                        value={selectedAvatar}
                        onChange={(e) => setSelectedAvatar(e.target.value)}
                        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                        style={{
                          backgroundColor: '#1A1A22',
                          border: '1px solid #2A2A3A',
                          color: '#F1F1F5',
                        }}
                      >
                        {parsedAvatars.map((a, i) => (
                          <option key={i} value={a}>
                            Avatar {i + 1}: {a.slice(0, 80)}{a.length > 80 ? '...' : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Textarea
                        placeholder="Describe your target audience for these scripts"
                        value={selectedAvatar}
                        onChange={(e) => setSelectedAvatar(e.target.value)}
                        rows={2}
                        style={{ minHeight: '60px' }}
                      />
                    )}
                  </div>
                ) : (
                  <Textarea
                    placeholder="Describe your target audience for these scripts"
                    value={selectedAvatar}
                    onChange={(e) => setSelectedAvatar(e.target.value)}
                    rows={2}
                    style={{ minHeight: '60px' }}
                  />
                )}
              </div>

              <Input
                label="Offer Name"
                value={profile.serviceName}
                onChange={(e) => updateProfile('serviceName', e.target.value)}
              />
              <Textarea
                label="Service / Deliverables"
                value={profile.tangibleService}
                onChange={(e) => updateProfile('tangibleService', e.target.value)}
                rows={2}
                style={{ minHeight: '60px' }}
              />
              <Textarea
                label="Direct Outcome"
                value={profile.directOutcome}
                onChange={(e) => updateProfile('directOutcome', e.target.value)}
                rows={2}
                style={{ minHeight: '60px' }}
              />
              <Textarea
                label="Benefits of That Outcome"
                value={profile.benefitsOfOutcome}
                onChange={(e) => updateProfile('benefitsOfOutcome', e.target.value)}
                rows={2}
                style={{ minHeight: '60px' }}
              />
              <Textarea
                label="Differentiators"
                value={profile.differentiators}
                onChange={(e) => updateProfile('differentiators', e.target.value)}
                rows={2}
                style={{ minHeight: '60px' }}
              />
              <Textarea
                label="Case Studies"
                value={profile.caseStudies}
                onChange={(e) => updateProfile('caseStudies', e.target.value)}
                rows={3}
                style={{ minHeight: '76px' }}
              />
              <Textarea
                label="Authority / Credibility"
                value={profile.impliedAuthority}
                onChange={(e) => updateProfile('impliedAuthority', e.target.value)}
                rows={2}
                style={{ minHeight: '60px' }}
              />
              <Input
                label="Core Outcome (one sentence)"
                value={profile.coreOutcome}
                onChange={(e) => updateProfile('coreOutcome', e.target.value)}
              />
              <Textarea
                label="Full Deliverables List"
                value={profile.deliverablesList}
                onChange={(e) => updateProfile('deliverablesList', e.target.value)}
                rows={2}
                style={{ minHeight: '60px' }}
              />
              <Textarea
                label="Client Process"
                value={profile.clientProcess}
                onChange={(e) => updateProfile('clientProcess', e.target.value)}
                rows={2}
                style={{ minHeight: '60px' }}
              />
            </div>
          </Card>

          {/* Number of scripts */}
          <div>
            <label
              className="uppercase tracking-wider block mb-2"
              style={{ fontSize: '11px', letterSpacing: '0.5px', color: '#6B6B80', fontWeight: 500 }}
            >
              Number of Scripts
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setNumberOfScripts(n)}
                  className="w-12 h-10 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: numberOfScripts === n ? '#8B5CF6' : '#1A1A22',
                    color: numberOfScripts === n ? '#FFF' : '#A1A1B5',
                    border: '1px solid',
                    borderColor: numberOfScripts === n ? '#8B5CF6' : '#2A2A3A',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ArrowLeft size={16} /> Back
            </Button>
            <Button onClick={handleGenerate} size="lg">
              Generate {numberOfScripts} Script{numberOfScripts > 1 ? 's' : ''} &rarr;
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3 — Results */}
      {step === 3 && (
        <div className="space-y-6 max-w-3xl">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6">
              <h2 className="text-[20px] font-semibold" style={{ color: '#F1F1F5' }}>
                Writing your scripts...
              </h2>
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: '10px',
                      height: '10px',
                      backgroundColor: '#8B5CF6',
                      animation: `pulse-glow 1.4s ${i * 0.2}s ease-in-out infinite`,
                    }}
                  />
                ))}
              </div>
              <p
                className="text-[14px]"
                style={{ color: '#A1A1B5' }}
                key={loadingMsgIndex}
              >
                {loadingMessages[loadingMsgIndex]}
              </p>
            </div>
          ) : genError ? (
            <div className="space-y-4">
              <Card>
                <div className="text-center py-8">
                  <StatusDot color="red" size="lg" />
                  <h2 className="text-[18px] font-semibold mt-4" style={{ color: '#F1F1F5' }}>
                    Generation Failed
                  </h2>
                  <p className="text-[14px] mt-2" style={{ color: '#A1A1B5' }}>{genError}</p>
                </div>
              </Card>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => { setStep(1); setGenError(null) }}>
                  Try Different Framework
                </Button>
                <Button onClick={handleGenerate}>
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <h1 className="text-[24px] font-bold" style={{ color: '#F1F1F5' }}>
                  Your Scripts Are Ready
                </h1>
                <StatusDot color="green" size="md" />
              </div>
              <p className="text-[14px]" style={{ color: '#A1A1B5' }}>
                {generatedScripts.length} script{generatedScripts.length !== 1 ? 's' : ''} generated using {selectedFramework?.name}
              </p>

              <div className="space-y-3">
                {generatedScripts.map((script) => {
                  const isExpanded = expandedScript === script.id
                  return (
                    <div
                      key={script.id}
                      className="rounded-xl overflow-hidden transition-all duration-200"
                      style={{
                        backgroundColor: '#1E1E28',
                        border: '1px solid #2A2A3A',
                      }}
                    >
                      <button
                        onClick={() => setExpandedScript(isExpanded ? null : script.id)}
                        className="w-full flex items-center justify-between p-5 text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[15px] font-semibold" style={{ color: '#F1F1F5' }}>
                            {script.title}
                          </h3>
                          <p className="text-[13px] mt-0.5 truncate" style={{ color: '#6B6B80' }}>
                            {script.frameworkName}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp size={18} style={{ color: '#6B6B80', flexShrink: 0 }} />
                        ) : (
                          <ChevronDown size={18} style={{ color: '#6B6B80', flexShrink: 0 }} />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5 space-y-4" style={{ animation: 'fade-in 200ms ease-out' }}>
                          <div>
                            <label className="uppercase tracking-wider text-[11px] font-medium block mb-1" style={{ color: '#8B5CF6', letterSpacing: '0.5px' }}>
                              Hook
                            </label>
                            <p className="text-[14px] leading-relaxed" style={{ color: '#F1F1F5' }}>
                              {script.hook}
                            </p>
                          </div>

                          <div>
                            <label className="uppercase tracking-wider text-[11px] font-medium block mb-1" style={{ color: '#8B5CF6', letterSpacing: '0.5px' }}>
                              Body
                            </label>
                            <p className="text-[14px] leading-relaxed whitespace-pre-wrap" style={{ color: '#F1F1F5' }}>
                              {script.body}
                            </p>
                          </div>

                          <div>
                            <label className="uppercase tracking-wider text-[11px] font-medium block mb-1" style={{ color: '#8B5CF6', letterSpacing: '0.5px' }}>
                              CTA
                            </label>
                            <p className="text-[14px] leading-relaxed" style={{ color: '#F1F1F5' }}>
                              {script.cta}
                            </p>
                          </div>

                          <div style={{ borderTop: '1px solid #2A2A3A', paddingTop: '16px' }}>
                            <label className="uppercase tracking-wider text-[11px] font-medium block mb-2" style={{ color: '#8B5CF6', letterSpacing: '0.5px' }}>
                              Full Script
                            </label>
                            <div
                              className="rounded-lg p-6 text-[14px] whitespace-pre-wrap"
                              style={{
                                backgroundColor: '#1A1A22',
                                color: '#F1F1F5',
                                lineHeight: 1.7,
                              }}
                            >
                              {script.fullScript}
                            </div>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <Button
                              size="sm"
                              onClick={() => handleCopy(script)}
                            >
                              {copiedId === script.id ? (
                                <><Check size={14} /> Copied!</>
                              ) : (
                                <><Copy size={14} /> Copy Full Script</>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled
                              title="Coming soon"
                            >
                              Save to Library
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="ghost" onClick={() => { setStep(1); setGeneratedScripts([]); setSelectedFramework(null) }}>
                  Generate More
                </Button>
                <Button variant="ghost" onClick={() => { setStep(1); setGeneratedScripts([]) }}>
                  Try Different Framework
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </AppShell>
  )
}
