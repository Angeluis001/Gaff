import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { IntegrationHealthCard } from "@/components/admin/IntegrationHealthCard"
import { SectionStatusCard } from "@/components/admin/SectionStatusCard"
import { AdminStatGrid } from "@/components/admin/AdminStatGrid"
import { MetricCard } from "@/components/admin/MetricCard"
import { Card, CardContent } from "@/components/ui/card"
import { getAdminSettingsOverview } from "@/lib/admin/settings"

export default async function AdminSettingsPage() {
  const overview = await getAdminSettingsOverview()

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Settings"
        title="Settings"
        description="See admin users and integration health without exposing secrets."
      />

      <AdminStatGrid>
        <MetricCard title="Admin users" value={String(overview.admins.length)} tone="info" />
        <MetricCard title="Configured integrations" value={String(overview.integrations.filter((item) => item.status === "configured").length)} tone="success" />
      </AdminStatGrid>

      <SectionStatusCard
        title="Bootstrap and access"
        status="live"
        description="Admin user access is centralized in the authenticated admin console."
        nextStep="Rotate or seed users with the bootstrap helper when needed."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {overview.integrations.map((integration) => (
          <IntegrationHealthCard
            key={integration.name}
            name={integration.name}
            status={integration.status as "configured" | "missing"}
            nextAction={
              integration.status === "configured"
                ? "Integration is configured."
                : "Provide the environment variable required for this service."
            }
          />
        ))}
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardContent className="pt-6 space-y-3">
          {overview.admins.map((admin) => (
            <div key={admin.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
              <div>
                <div className="font-medium text-white">{admin.name}</div>
                <div className="text-sm text-white/55">{admin.email}</div>
              </div>
              <div className="text-right text-sm text-white/65">
                <div>{admin.role}</div>
                <div>{admin.isActive ? "active" : "inactive"}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
