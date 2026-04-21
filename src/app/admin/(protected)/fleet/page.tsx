import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { EmptyState } from "@/components/admin/EmptyState"
import { MetricCard } from "@/components/admin/MetricCard"
import { AdminStatGrid } from "@/components/admin/AdminStatGrid"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminFleet, getAdminFleetMaintenanceWindows } from "@/lib/admin/fleet"

export default async function AdminFleetPage() {
  const [fleet, maintenanceWindows] = await Promise.all([
    getAdminFleet(),
    getAdminFleetMaintenanceWindows(),
  ])

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Fleet"
        title="Fleet management"
        description="Inspect boats, pricing, and availability controls."
      />

      <AdminStatGrid>
        <MetricCard title="Boats" value={String(fleet.length)} tone="info" />
        <MetricCard title="Maintenance windows" value={String(maintenanceWindows.length)} tone="warning" />
      </AdminStatGrid>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Boats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {fleet.length === 0 ? (
              <EmptyState
                title="No boats yet"
                description="Fleet rows will appear here once boats are synced or seeded."
              />
            ) : (
              fleet.map((boat) => (
                <div key={boat.id} className="rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium text-white">{boat.name}</div>
                      <div className="text-sm text-white/55">{boat.category} | capacity {boat.capacity}</div>
                    </div>
                    <StatusBadge tone={boat.isActive ? "success" : "danger"}>
                      {boat.isActive ? "active" : "inactive"}
                    </StatusBadge>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-white/65 sm:grid-cols-2">
                    <div>Half day: {boat.priceHalfDay ?? "—"}</div>
                    <div>Full day: {boat.priceFullDay ?? "—"}</div>
                    <div>Booked days: {boat.bookedDays}</div>
                    <div>Maintenance days: {boat.maintenanceDays}</div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Maintenance windows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {maintenanceWindows.length === 0 ? (
              <EmptyState
                title="No maintenance windows"
                description="Create boat-day blocks when a captain or vessel goes offline."
              />
            ) : (
              maintenanceWindows.map((window, index) => (
                <div key={`${window.boatName}-${index}`} className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-white">{window.boatName}</div>
                    <StatusBadge tone="warning">{window.date}</StatusBadge>
                  </div>
                  <div className="mt-2 text-sm text-white/60">{window.reason ?? "maintenance"}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
