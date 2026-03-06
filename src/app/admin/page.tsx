'use client'

import { useState, useEffect, useRef } from 'react'
import AppShell from '@/components/AppShell'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import StatusDot from '@/components/ui/StatusDot'
import { Upload, Trash2, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'

interface AdSetInfo {
  name: string
  count: number
}

interface SampleScript {
  id: string
  title: string | null
  content: string
  adSetName: string | null
}

export default function AdminPage() {
  const [total, setTotal] = useState(0)
  const [adSets, setAdSets] = useState<AdSetInfo[]>([])
  const [samples, setSamples] = useState<SampleScript[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ count: number; adSets: string[] } | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isClearing, setIsClearing] = useState(false)
  const [expandedSample, setExpandedSample] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/script-library')
      if (res.ok) {
        const data = await res.json()
        setTotal(data.total)
        setAdSets(data.adSets || [])
        setSamples(data.samples || [])
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadStats() }, [])

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    setUploadResult(null)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload-scripts', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setUploadResult({ count: data.count, adSets: data.adSets })
        loadStats()
      } else {
        setUploadError(data.error || 'Upload failed')
      }
    } catch {
      setUploadError('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.pdf')) handleUpload(file)
  }

  const handleClear = async () => {
    if (!confirm('Delete all scripts from the library? This cannot be undone.')) return
    setIsClearing(true)
    try {
      const res = await fetch('/api/admin/script-library', { method: 'DELETE' })
      if (res.ok) {
        setTotal(0)
        setAdSets([])
        setSamples([])
        setUploadResult(null)
      }
    } catch {
      // silently fail
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-[24px] font-bold" style={{ color: '#F1F1F5' }}>Admin Panel</h1>

        {/* Section 1: Script Library */}
        <Card>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold" style={{ color: '#F1F1F5' }}>Script Library</h2>
              {total > 0 && <StatusDot color="green" size="md" />}
            </div>

            {isLoading ? (
              <p className="text-[14px]" style={{ color: '#6B6B80' }}>Loading...</p>
            ) : total > 0 ? (
              <div className="space-y-4">
                <p className="text-[15px]" style={{ color: '#A1A1B5' }}>
                  <span className="font-semibold" style={{ color: '#F1F1F5' }}>{total}</span> scripts loaded from{' '}
                  <span className="font-semibold" style={{ color: '#F1F1F5' }}>{adSets.length}</span> ad sets
                </p>

                {/* Ad set breakdown */}
                <div className="space-y-1">
                  {adSets.slice(0, 10).map((a) => (
                    <div key={a.name} className="flex justify-between text-[13px]">
                      <span style={{ color: '#A1A1B5' }}>{a.name}</span>
                      <span style={{ color: '#6B6B80' }}>{a.count} scripts</span>
                    </div>
                  ))}
                  {adSets.length > 10 && (
                    <p className="text-[12px]" style={{ color: '#6B6B80' }}>
                      ...and {adSets.length - 10} more ad sets
                    </p>
                  )}
                </div>

                {/* Sample preview */}
                {samples.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[12px] uppercase tracking-wider" style={{ color: '#6B6B80', letterSpacing: '0.5px', fontWeight: 500 }}>
                      Sample Scripts
                    </p>
                    {samples.map((s) => (
                      <div key={s.id} className="rounded-lg overflow-hidden" style={{ backgroundColor: '#141419', border: '1px solid #2A2A3A' }}>
                        <button
                          onClick={() => setExpandedSample(expandedSample === s.id ? null : s.id)}
                          className="w-full flex items-center justify-between p-3 text-left"
                        >
                          <span className="text-[13px] truncate" style={{ color: '#A1A1B5' }}>
                            {s.title || 'Untitled'} <span style={{ color: '#6B6B80' }}>({s.adSetName})</span>
                          </span>
                          {expandedSample === s.id ? <ChevronUp size={14} style={{ color: '#6B6B80' }} /> : <ChevronDown size={14} style={{ color: '#6B6B80' }} />}
                        </button>
                        {expandedSample === s.id && (
                          <div className="px-3 pb-3">
                            <p className="text-[13px] whitespace-pre-wrap" style={{ color: '#A1A1B5', lineHeight: 1.6, maxHeight: '200px', overflow: 'auto' }}>
                              {s.content.slice(0, 1000)}{s.content.length > 1000 ? '...' : ''}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <Button variant="danger" size="sm" onClick={handleClear} loading={isClearing}>
                  <Trash2 size={14} /> Clear Library &amp; Re-upload
                </Button>
              </div>
            ) : (
              <p className="text-[14px]" style={{ color: '#6B6B80' }}>
                No scripts uploaded yet. Upload your PDF to get started.
              </p>
            )}

            {/* Upload result */}
            {uploadResult && (
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <CheckCircle size={18} style={{ color: '#22C55E' }} />
                <p className="text-[14px]" style={{ color: '#22C55E' }}>
                  Successfully extracted {uploadResult.count} scripts from {uploadResult.adSets.length} ad sets!
                </p>
              </div>
            )}

            {uploadError && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="text-[14px]" style={{ color: '#EF4444' }}>{uploadError}</p>
              </div>
            )}

            {/* Upload zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl cursor-pointer transition-all duration-200"
              style={{
                border: '2px dashed #2A2A3A',
                backgroundColor: '#141419',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#8B5CF6'; e.currentTarget.style.backgroundColor = '#1A1A22' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2A3A'; e.currentTarget.style.backgroundColor = '#141419' }}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" opacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
                  </svg>
                  <p className="text-[14px]" style={{ color: '#A1A1B5' }}>Parsing PDF and extracting scripts...</p>
                </>
              ) : (
                <>
                  <Upload size={28} style={{ color: '#6B6B80' }} />
                  <p className="text-[14px]" style={{ color: '#A1A1B5' }}>Drop your PDF here, or click to browse</p>
                  <p className="text-[12px]" style={{ color: '#6B6B80' }}>Accepts .pdf files</p>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Users placeholder */}
        <Card>
          <h2 className="text-[18px] font-semibold mb-2" style={{ color: '#F1F1F5' }}>Users</h2>
          <p className="text-[14px]" style={{ color: '#6B6B80' }}>User management coming soon</p>
        </Card>
      </div>
    </AppShell>
  )
}
