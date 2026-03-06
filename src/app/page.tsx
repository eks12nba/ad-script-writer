import AppShell from '@/components/AppShell'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import StatusDot from '@/components/ui/StatusDot'

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold" style={{ color: '#F1F1F5' }}>
            Dashboard
          </h1>
          <StatusDot color="green" size="sm" />
          <Badge variant="green" glow>ONLINE</Badge>
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
