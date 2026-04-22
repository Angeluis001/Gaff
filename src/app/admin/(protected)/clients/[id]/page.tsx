import Link from "next/link"
import { notFound } from "next/navigation"

import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { EmptyState } from "@/components/admin/EmptyState"
import { MetricCard } from "@/components/admin/MetricCard"
import { AdminStatGrid } from "@/components/admin/AdminStatGrid"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminClientDetail } from "@/lib/admin/clients"

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const detail = await getAdminClientDetail(id)

  if (!detail) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Client detail"
        title={detail.client.name}
        description="Trip history, spend, and communication preferences."
        actions={
          <Link className="rounded-xl border border-white/10 px-4 py-2 hover:bg-white/5" href="/admin/clients">
            Back to clients
          </Link>
        }
      />

      <AdminStatGrid>
        <MetricCard title="Trips" value={String(detail.client.totalTrips)} tone="info" />
        <MetricCard title="Spend" value={detail.client.totalSpend} tone="success" />
        <MetricCard title="Preference" value={detail.client.preferredBoatCategory ?? "Unknown"} tone="warning" />
        <MetricCard title="Contact" value={detail.client.communicationPreference ?? "email"} tone="neutral" />
      </AdminStatGrid>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/70">
            <div>Email: {detail.client.email}</div>
            <div>Phone: {detail.client.phone ?? "—"}</div>
            <div>WhatsApp: {detail.client.whatsappNumber ?? "—"}</div>
            <div>Location: {[detail.client.city, detail.client.state, detail.client.country].filter(Boolean).join(", ") || "—"}</div>
            <div>Preferred species: {detail.client.preferredSpecies?.join(", ") ?? "—"}</div>
            <div>Tags: {detail.client.tags?.join(", ") ?? "—"}</div>
            <div>Notes: {detail.client.notes ?? "—"}</div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Trip history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.trips.length === 0 ? (
              <EmptyState
                title="No trips yet"
                description="Completed and in-progress bookings will appear here once a client record is linked."
              />
            ) : (
              detail.trips.map((trip) => (
                <div key={trip.id} className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <StatusBadge tone="info">{trip.status}</StatusBadge>
                    <span className="text-xs text-white/45">{trip.date}</span>
                  </div>
                  <div className="mt-2 text-sm text-white/75">
                    {trip.tripType} | {trip.guests} guests | {trip.totalPrice}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
