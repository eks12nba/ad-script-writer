'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { X, Plus } from 'lucide-react'

interface FormData {
  serviceName: string
  tangibleService: string
  directOutcome: string
  benefitsOfOutcome: string
  differentiators: string
  caseStudies: string
  impliedAuthority: string
  coreOutcome: string
  avatars: string[]
  bigOpportunities: string
  deliverablesList: string
  clientProcess: string
}

const defaultForm: FormData = {
  serviceName: '',
  tangibleService: '',
  directOutcome: '',
  benefitsOfOutcome: '',
  differentiators: '',
  caseStudies: '',
  impliedAuthority: '',
  coreOutcome: '',
  avatars: ['', '', ''],
  bigOpportunities: '',
  deliverablesList: '',
  clientProcess: '',
}

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  const totalSteps = 5

  const updateField = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const updateAvatar = (index: number, value: string) => {
    setForm((f) => {
      const avatars = [...f.avatars]
      avatars[index] = value
      return { ...f, avatars }
    })
  }

  const addAvatar = () => {
    if (form.avatars.length < 15) {
      setForm((f) => ({ ...f, avatars: [...f.avatars, ''] }))
    }
  }

  const removeAvatar = (index: number) => {
    if (form.avatars.length > 1) {
      setForm((f) => ({ ...f, avatars: f.avatars.filter((_, i) => i !== index) }))
    }
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        avatars: JSON.stringify(form.avatars.filter((a) => a.trim())),
      }
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setFadeOut(true)
        setTimeout(() => onComplete(), 400)
      }
    } catch {
      // handle error silently
    } finally {
      setSaving(false)
    }
  }

  const dots = Array.from({ length: totalSteps }, (_, i) => i + 1)

  return (
    <div
      className="fixed inset-0 z-40 overflow-y-auto"
      style={{
        backgroundColor: '#0C0C10',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 400ms ease-out',
      }}
    >
      <div className="absolute top-6 left-6">
        <img src="/logo.png" alt="Logo" style={{ height: '40px', width: 'auto' }} />
      </div>

      <div className="min-h-screen flex items-start justify-center py-20 px-4">
        <div
          className="w-full rounded-2xl p-8 md:p-10"
          style={{
            maxWidth: '700px',
            backgroundColor: '#1E1E28',
            border: '1px solid #2A2A3A',
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {dots.map((d) => (
              <div
                key={d}
                className="rounded-full transition-all duration-200"
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: d === step ? '#8B5CF6' : 'transparent',
                  border: d === step ? '2px solid #8B5CF6' : '2px solid #2A2A3A',
                }}
              />
            ))}
          </div>
          <p className="text-center text-[13px] mb-8" style={{ color: '#6B6B80' }}>
            Step {step} of {totalSteps}
          </p>

          {step === 1 && (
            <div className="space-y-6" style={{ animation: 'wizard-fade 300ms ease-out' }}>
              <h2 className="text-[24px] font-bold" style={{ color: '#FFFFFF' }}>
                Welcome to Script Engine
              </h2>
              <p className="text-[15px] leading-relaxed" style={{ color: '#A1A1B5' }}>
                We&apos;re going to set up your account so our AI can write Meta ad scripts tailored to your offer,
                your audience, and your voice. This takes about 5 minutes and makes everything we generate dramatically
                better.
              </p>
              <Button onClick={() => setStep(2)} size="lg">
                Let&apos;s Get Started &rarr;
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5" style={{ animation: 'wizard-fade 300ms ease-out' }}>
              <h2 className="text-[20px] font-bold" style={{ color: '#FFFFFF' }}>
                Tell us about your offer
              </h2>
              <Input
                label="What is your service or offer called?"
                placeholder='e.g., 7 Figure MSP Program'
                value={form.serviceName}
                onChange={(e) => updateField('serviceName', e.target.value)}
              />
              <Textarea
                label="What is the literal, tangible service or deliverables?"
                placeholder='e.g., A 6-month coaching program with weekly calls, done-for-you sales scripts, and a CRM setup'
                rows={3}
                style={{ minHeight: '76px' }}
                value={form.tangibleService}
                onChange={(e) => updateField('tangibleService', e.target.value)}
              />
              <Textarea
                label="What direct outcome do you provide?"
                placeholder='e.g., MSPs learn to charge $300+/seat and close premium contracts consistently'
                rows={3}
                style={{ minHeight: '76px' }}
                value={form.directOutcome}
                onChange={(e) => updateField('directOutcome', e.target.value)}
              />
              <Textarea
                label="What are the benefits of that outcome?"
                placeholder='e.g., More revenue, less stress, predictable growth, ability to hire and scale'
                rows={3}
                style={{ minHeight: '76px' }}
                value={form.benefitsOfOutcome}
                onChange={(e) => updateField('benefitsOfOutcome', e.target.value)}
              />
              <Textarea
                label="What makes you different from competitors?"
                placeholder='e.g., Built and sold my own MSP for 7 figures, worked with 2000+ clients, proven system not theory'
                rows={3}
                style={{ minHeight: '76px' }}
                value={form.differentiators}
                onChange={(e) => updateField('differentiators', e.target.value)}
              />
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  &larr; Back
                </Button>
                <Button onClick={() => setStep(3)}>
                  Next &rarr;
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5" style={{ animation: 'wizard-fade 300ms ease-out' }}>
              <h2 className="text-[20px] font-bold" style={{ color: '#FFFFFF' }}>
                Your proof and credibility
              </h2>
              <Textarea
                label="List 3-5 case studies you can reference in ads"
                placeholder={'e.g., Helped John go from $75/seat to $285/seat in 6 months\nTook Sarah from $0 to $500k/month in a town of 15,000 people'}
                rows={5}
                style={{ minHeight: '120px' }}
                value={form.caseStudies}
                onChange={(e) => updateField('caseStudies', e.target.value)}
              />
              <Textarea
                label="What authority statements can you make?"
                placeholder="e.g., We've helped over 2,000 MSPs close $267 million in tracked sales"
                rows={3}
                style={{ minHeight: '76px' }}
                value={form.impliedAuthority}
                onChange={(e) => updateField('impliedAuthority', e.target.value)}
              />
              <Input
                label="What is your core outcome in one simple sentence?"
                placeholder='e.g., We help MSPs charge $300+/seat and scale to $100k+/month MRR'
                value={form.coreOutcome}
                onChange={(e) => updateField('coreOutcome', e.target.value)}
              />
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  &larr; Back
                </Button>
                <Button onClick={() => setStep(4)}>
                  Next &rarr;
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5" style={{ animation: 'wizard-fade 300ms ease-out' }}>
              <div>
                <h2 className="text-[20px] font-bold" style={{ color: '#FFFFFF' }}>
                  Who are your ideal customers?
                </h2>
                <p className="text-[14px] mt-1" style={{ color: '#A1A1B5' }}>
                  Write specific descriptions of the people your ads should target. The more specific, the better the scripts.
                </p>
              </div>
              {form.avatars.map((avatar, i) => (
                <div key={i} className="relative">
                  <Textarea
                    label={`Avatar ${i + 1}`}
                    placeholder={i === 0 ? 'e.g., An MSP owner doing $10-30k/month who relies on referrals, hates sales, and wants to charge more but doesn\'t know how' : ''}
                    rows={2}
                    style={{ minHeight: '60px' }}
                    value={avatar}
                    onChange={(e) => updateAvatar(i, e.target.value)}
                  />
                  {form.avatars.length > 1 && (
                    <button
                      onClick={() => removeAvatar(i)}
                      className="absolute top-0 right-0 p-1 rounded transition-colors"
                      style={{ color: '#6B6B80' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#6B6B80')}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              {form.avatars.length < 15 && (
                <Button variant="ghost" onClick={addAvatar} size="sm">
                  <Plus size={14} /> Add Another Avatar +
                </Button>
              )}
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" onClick={() => setStep(3)}>
                  &larr; Back
                </Button>
                <Button onClick={() => setStep(5)}>
                  Next &rarr;
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5" style={{ animation: 'wizard-fade 300ms ease-out' }}>
              <div>
                <h2 className="text-[20px] font-bold" style={{ color: '#FFFFFF' }}>
                  Almost done &mdash; a few more details
                </h2>
                <p className="text-[14px] mt-1" style={{ color: '#A1A1B5' }}>
                  These are optional but help us write even better scripts
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <label
                    className="uppercase tracking-wider"
                    style={{ fontSize: '11px', letterSpacing: '0.5px', color: '#6B6B80', fontWeight: 500 }}
                  >
                    Any big opportunities behind your offer?
                  </label>
                  <Badge variant="gold">Optional</Badge>
                </div>
                <textarea
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-150 resize-y placeholder:text-text-dim"
                  rows={3}
                  style={{
                    backgroundColor: '#1A1A22',
                    border: '1px solid #2A2A3A',
                    color: '#F1F1F5',
                    borderLeftWidth: '3px',
                    minHeight: '76px',
                  }}
                  value={form.bigOpportunities}
                  onChange={(e) => updateField('bigOpportunities', e.target.value)}
                  onFocus={(e) => {
                    e.currentTarget.style.borderLeftColor = '#8B5CF6'
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(139,92,246,0.15)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderLeftColor = '#2A2A3A'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>
              <Textarea
                label="List all deliverables of your offer"
                placeholder='e.g., Weekly group coaching calls, 1-on-1 onboarding, sales script library, CRM setup, funnel templates'
                rows={3}
                style={{ minHeight: '76px' }}
                value={form.deliverablesList}
                onChange={(e) => updateField('deliverablesList', e.target.value)}
              />
              <Textarea
                label="What process do you take clients through?"
                placeholder='e.g., Month 1: Offer & positioning setup. Month 2: Sales system installation. Month 3-6: Scaling & optimization'
                rows={3}
                style={{ minHeight: '76px' }}
                value={form.clientProcess}
                onChange={(e) => updateField('clientProcess', e.target.value)}
              />
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" onClick={() => setStep(4)}>
                  &larr; Back
                </Button>
                <Button onClick={handleSubmit} loading={saving} size="lg">
                  Complete Setup &rarr;
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes wizard-fade {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
