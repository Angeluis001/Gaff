import Link from "next/link"
import { CalendarDays, Users } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { DataTableShell } from "@/components/admin/DataTableShell"
import { EmptyState } from "@/components/admin/EmptyState"
import { MetricCard } from "@/components/admin/MetricCard"
import { AdminStatGrid } from "@/components/admin/AdminStatGrid"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { Card, CardContent } from "@/components/ui/card"
import { getAdminBookingList } from "@/lib/admin/bookings"
import { getSearchParamNumber, getSearchParamValue, type SearchParams } from "@/lib/admin/params"

const STATUSES = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "deposit_paid", label: "Deposit paid" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
  { value: "no_show", label: "No show" },
]

const TRIP_TYPES = [
  { value: "", label: "All trip types" },
  { value: "half_day", label: "Half day (5–6 hrs)" },
  { value: "full_day", label: "Full day (8 hrs)" },
]

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  pending: "warning",
  deposit_paid: "info",
  confirmed: "success",
  in_progress: "info",
  completed: "success",
  cancelled: "danger",
  refunded: "warning",
  no_show: "danger",
}

const TRIP_LABEL: Record<string, string> = {
  half_day: "Half day (5–6 hrs)",
  full_day: "Full day (8 hrs)",
  overnight: "Overnight (legacy)",
}

const CATEGORY_COLOR: Record<string, string> = {
  standard: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  midsize: "bg-teal-500/10 text-teal-300 border-teal-500/20",
  large: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  luxury: "bg-amber-500/10 text-amber-300 border-amber-500/20",
}

const selectClass =
  "rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-primary/50 w-full"

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  const resolvedParams = await searchParams
  const page = getSearchParamNumber(resolvedParams, "page", 1)
  const query = getSearchParamValue(resolvedParams, "query") ?? ""
  const status = getSearchParamValue(resolvedParams, "status") ?? ""
  const tripType = getSearchParamValue(resolvedParams, "tripType") ?? ""
  const dateFrom = getSearchParamValue(resolvedParams, "dateFrom") ?? ""
  const dateTo = getSearchParamValue(resolvedParams, "dateTo") ?? ""

  const result = await getAdminBookingList({ query, status, tripType, dateFrom, dateTo, page, pageSize: 12 })

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize))

  const buildHref = (nextPage: number, overrides: Record<string, string> = {}) => {
    const params = new URLSearchParams()
    if (query) params.set("query", query)
    if (status) params.set("status", status)
    if (tripType) params.set("tripType", tripType)
    if (dateFrom) params.set("dateFrom", dateFrom)
    if (dateTo) params.set("dateTo", dateTo)
    params.set("page", String(nextPage))
    Object.entries(overrides).forEach(([k, v]) => v ? params.set(k, v) : params.delete(k))
    return `/admin/bookings?${params.toString()}`
  }

  const hasFilters = query || status || tripType || dateFrom || dateTo

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Operations"
        title="Bookings"
        description="View and filter reservations by date, trip type, and status."
      />

      <AdminStatGrid>
        <MetricCard title="Matching bookings" value={String(result.summary.total)} tone="info" />
        <MetricCard title="Confirmed / paid" value={String(result.summary.confirmed)} tone="success" />
        <MetricCard title="Pending" value={String(result.summary.pending)} tone="warning" />
        <MetricCard title="Completed revenue" value={result.summary.revenue} tone="neutral" />
      </AdminStatGrid>

      {/* Filters */}
      <Card className="border-white/10 bg-white/5">
        <CardContent className="pt-6">
          <form method="get" className="space-y-3">
            {/* Row 1: search */}
            <input
              name="query"
              defaultValue={query}
              placeholder="Search by boat, lead name, or status…"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-primary/50"
            />
            {/* Row 2: dropdowns + dates */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <select name="status" defaultValue={status} className={selectClass}>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value} className="bg-[#0a1628]">
                    {s.label}
                  </option>
                ))}
              </select>
              <select name="tripType" defaultValue={tripType} className={selectClass}>
                {TRIP_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-[#0a1628]">
                    {t.label}
                  </option>
                ))}
              </select>
              <input
                type="date"
                name="dateFrom"
                defaultValue={dateFrom}
                className={selectClass}
              />
              <input
                type="date"
                name="dateTo"
                defaultValue={dateTo}
                className={selectClass}
              />
            </div>
            {/* Row 3: actions */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Apply filters
              </button>
              {hasFilters && (
                <Link
                  href="/admin/bookings"
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-white/60 hover:bg-white/5"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Booking list */}
      <DataTableShell
        title={`Reservations${hasFilters ? " (filtered)" : ""}`}
        description={`Showing ${result.items.length} of ${result.summary.total} bookings — page ${result.page} of ${totalPages}`}
      >
        {result.items.length === 0 ? (
          <EmptyState
            title="No bookings found"
            description="Try adjusting your filters or clearing the search."
          />
        ) : (
          <div className="space-y-3">
            {result.items.map((booking) => (
              <Link
                key={booking.id}
                href={`/admin/bookings/${booking.id}`}
                className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/10 p-4 transition hover:border-primary/40 hover:bg-black/20 lg:flex-row lg:items-center"
              >
                {/* Boat + lead */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white group-hover:text-primary">
                      {booking.boatName}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${CATEGORY_COLOR[booking.boatCategory] ?? ""}`}
                    >
                      {booking.boatCategory}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-white/50">
                    {booking.leadName ?? "No linked lead"}
                  </div>
                </div>

                {/* Date + trip type */}
                <div className="flex items-center gap-4 text-sm lg:w-48">
                  <div>
                    <div className="flex items-center gap-1.5 text-white/70">
                      <CalendarDays className="size-3.5 text-white/30" />
                      {booking.date}
                    </div>
                    <div className="mt-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-center text-[11px] font-semibold text-white/60">
                      {TRIP_LABEL[booking.tripType] ?? booking.tripType}
                    </div>
                  </div>
                </div>

                {/* Guests */}
                <div className="flex items-center gap-1.5 text-sm text-white/50 lg:w-20">
                  <Users className="size-3.5 text-white/30" />
                  {booking.guests} guest{booking.guests !== 1 ? "s" : ""}
                </div>

                {/* Pricing */}
                <div className="lg:w-36">
                  <div className="text-sm font-semibold text-white">{booking.totalPrice}</div>
                  {booking.depositAmount && (
                    <div className="mt-0.5 text-xs text-white/45">
                      Deposit: {booking.depositAmount}
                      {booking.depositPaidAt ? (
                        <span className="ml-1 text-emerald-400">✓ paid</span>
                      ) : (
                        <span className="ml-1 text-amber-400">pending</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="lg:w-32">
                  <StatusBadge tone={STATUS_TONE[booking.status] ?? "neutral"}>
                    {booking.status.replace("_", " ")}
                  </StatusBadge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </DataTableShell>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-white/60">
        <span>
          Page {result.page} of {totalPages} — {result.summary.total} total
        </span>
        <div className="flex gap-2">
          {result.page > 1 && (
            <Link
              href={buildHref(result.page - 1)}
              className="rounded-xl border border-white/10 px-4 py-2 hover:bg-white/5"
            >
              ← Previous
            </Link>
          )}
          {result.page < totalPages && (
            <Link
              href={buildHref(result.page + 1)}
              className="rounded-xl border border-white/10 px-4 py-2 hover:bg-white/5"
            >
              Next →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
