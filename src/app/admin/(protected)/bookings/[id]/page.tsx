import Link from "next/link"
import { notFound } from "next/navigation"

import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { EmptyState } from "@/components/admin/EmptyState"
import { MetricCard } from "@/components/admin/MetricCard"
import { AdminStatGrid } from "@/components/admin/AdminStatGrid"
import { CompleteBookingButton } from "@/components/admin/CompleteBookingButton"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminBookingDetail } from "@/lib/admin/bookings"

export default async function AdminBookingDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const detail = await getAdminBookingDetail(params.id)

  if (!detail) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Booking detail"
        title={detail.booking.boatName}
        description="Trip metadata, deposits, notes, and availability audit trail."
        actions={
          <div className="flex flex-wrap gap-3">
            {detail.booking.status !== "completed" ? (
              <CompleteBookingButton bookingId={detail.booking.id} />
            ) : null}
            <Link className="rounded-xl border border-white/10 px-4 py-2 hover:bg-white/5" href="/admin/bookings">
              Back to bookings
            </Link>
          </div>
        }
      />

      <AdminStatGrid>
        <MetricCard title="Status" value={detail.booking.status} tone="info" />
        <MetricCard title="Trip type" value={detail.booking.tripType} tone="neutral" />
        <MetricCard title="Total" value={detail.booking.totalPrice} tone="success" />
        <MetricCard title="Deposit" value={detail.booking.depositAmount ?? "—"} tone="warning" />
      </AdminStatGrid>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Booking details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/70">
            <div>Lead: {detail.booking.leadName ?? "—"}</div>
            <div>Trip date: {detail.booking.date}</div>
            <div>Guests: {detail.booking.guests}</div>
            <div>Special requests: {detail.booking.specialRequests ?? "—"}</div>
            <div>Internal notes: {detail.booking.internalNotes ?? "—"}</div>
            <div>Stripe session: {detail.booking.stripeSessionId ?? "—"}</div>
            <div>Payment intent: {detail.booking.stripePaymentIntentId ?? "—"}</div>
            <div>Deposit paid at: {detail.booking.depositPaidAt ?? "—"}</div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Availability audit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.availability.length === 0 ? (
              <EmptyState
                title="No availability records"
                description="The booking calendar will populate this area once boat-day records exist."
              />
            ) : (
              detail.availability.map((entry, index) => (
                <div key={`${entry.date}-${index}`} className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <StatusBadge tone={entry.isAvailable ? "success" : "danger"}>
                      {entry.isAvailable ? "available" : entry.reason ?? "blocked"}
                    </StatusBadge>
                    <span className="text-xs text-white/45">{entry.date}</span>
                  </div>
                  {entry.reason ? <p className="mt-2 text-sm text-white/65">{entry.reason}</p> : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
