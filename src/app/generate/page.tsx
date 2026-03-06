import AppShell from '@/components/AppShell'
import Card from '@/components/ui/Card'

export default function GeneratePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold" style={{ color: '#F1F1F5' }}>
          Generate Scripts
        </h1>
        <Card>
          <p style={{ color: '#A1A1B5' }}>
            Script generation wizard — coming soon.
          </p>
        </Card>
      </div>
    </AppShell>
  )
}
