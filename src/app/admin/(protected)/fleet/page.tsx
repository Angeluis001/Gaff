import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { MetricCard } from "@/components/admin/MetricCard"
import { AdminStatGrid } from "@/components/admin/AdminStatGrid"
import { FleetManager } from "@/components/admin/fleet/FleetManager"
import { db } from "@/lib/db"
import { boats, boatAvailability } from "@/lib/db/schema"

export default async function AdminFleetPage() {
  const [boatRows, availabilityRows] = await Promise.all([
    db.select().from(boats).orderBy(boats.name),
    db.select().from(boatAvailability),
  ])

  const maintenanceWindows = availabilityRows.filter(
    (entry) => entry.reason === "maintenance"
  )

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Fleet"
        title="Fleet management"
        description="Add boats, set pricing, upload photos, and block maintenance dates."
      />

      <AdminStatGrid>
        <MetricCard title="Boats" value={String(boatRows.length)} tone="info" />
        <MetricCard
          title="Maintenance windows"
          value={String(maintenanceWindows.length)}
          tone="warning"
        />
      </AdminStatGrid>

      <FleetManager
        initialBoats={boatRows.map((b) => ({
          id: b.id,
          name: b.name,
          slug: b.slug,
          category: b.category as "standard" | "midsize" | "large" | "luxury",
          capacity: b.capacity,
          length: b.length ?? null,
          description: b.description ?? null,
          features: (b.features as string[] | null) ?? null,
          images: (b.images as string[] | null) ?? null,
          priceHalfDay: b.priceHalfDay ?? null,
          priceFullDay: b.priceFullDay ?? null,
          captainName: b.captainName ?? null,
          isActive: b.isActive ?? true,
        }))}
        initialMaintenance={maintenanceWindows.map((m) => ({
          id: m.id,
          boatId: m.boatId,
          date: m.date.toISOString(),
          reason: m.reason ?? null,
        }))}
      />
    </div>
  )
}
