import AppShell from '@/components/AppShell'
import Card from '@/components/ui/Card'

export default function AdminPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold" style={{ color: '#F1F1F5' }}>
          Admin Panel
        </h1>
        <Card>
          <p style={{ color: '#A1A1B5' }}>
            Admin Panel — Coming Soon
          </p>
        </Card>
      </div>
    </AppShell>
  )
}
