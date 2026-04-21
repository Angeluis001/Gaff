import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { AdminStatGrid } from "@/components/admin/AdminStatGrid"
import { MetricCard } from "@/components/admin/MetricCard"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { getAdminDashboardData } from "@/lib/admin/dashboard"
import { formatDateTime, formatPercent } from "@/lib/admin/formatters"

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData()

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Live operations"
        title="Dashboard"
        description="Track bookings, revenue, lead flow, and fleet utilization from one secure admin home."
      />

      <AdminStatGrid>
        <MetricCard
          title="Bookings"
          value={String(data.metrics.totalBookings)}
          description="All booking records in Neon"
          tone="info"
          footnote={`${data.metrics.depositPaidBookings} deposit-paid bookings`}
        />
        <MetricCard
          title="Revenue"
          value={data.metrics.revenue}
          description="Recognized from active booking statuses"
          tone="success"
        />
        <MetricCard
          title="Leads"
          value={String(data.metrics.leads)}
          description="New and existing inquiries"
          tone="warning"
        />
        <MetricCard
          title="Occupancy"
          value={formatPercent(data.metrics.occupancyRate)}
          description="Availability blocked across the next 30 days"
          tone="neutral"
        />
      </AdminStatGrid>

      <Card className="border-amber-400/20 bg-amber-500/10">
        <CardHeader>
          <CardTitle className="text-white">Lead Agent alert</CardTitle>
          <CardDescription className="text-white/65">
            Hot leads that have not been contacted yet are surfaced here for immediate action.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/70">
              {data.leadAlerts.staleHotLeadCount} stale hot lead
              {data.leadAlerts.staleHotLeadCount === 1 ? "" : "s"}
            </div>
            <Badge variant="outline" className="border-amber-300/40 text-amber-100">
              {data.leadAlerts.hotLeadCount} hot total
            </Badge>
          </div>

          {data.leadAlerts.staleHotLeads.length > 0 ? (
            <div className="space-y-3">
              {data.leadAlerts.staleHotLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-white">{lead.name}</div>
                      <div className="text-xs text-white/55">
                        {lead.source} lead created {formatDateTime(lead.createdAt)}
                      </div>
                    </div>
                    <StatusBadge tone="warning">{lead.minutesWaiting} min waiting</StatusBadge>
                  </div>
                  <div className="mt-2 text-xs text-white/55">
                    No contact activity recorded yet.
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white/70">
              No hot leads are currently overdue for contact.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Booking status mix</CardTitle>
            <CardDescription className="text-white/55">
              The admin read model rolls up booking states that matter for operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(data.statusBreakdown).map(([status, count]) => (
              <div
                key={status}
                className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2"
              >
                <div className="text-xs uppercase tracking-[0.24em] text-white/45">{status}</div>
                <div className="mt-1 flex items-center gap-2">
                  <strong className="text-xl text-white">{count}</strong>
                  <Badge variant="outline" className="border-white/10 text-white/60">
                    live
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Operations posture</CardTitle>
            <CardDescription className="text-white/55">
              A quick read on the current system state.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
              <span className="text-sm text-white/65">Active boats</span>
              <StatusBadge tone="success">{data.metrics.activeBoats}</StatusBadge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
              <span className="text-sm text-white/65">Deposit-paid bookings</span>
              <StatusBadge tone="info">{data.metrics.depositPaidBookings}</StatusBadge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
              <span className="text-sm text-white/65">Occupancy rate</span>
              <StatusBadge tone="warning">{formatPercent(data.metrics.occupancyRate)}</StatusBadge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Analytics Agent</CardTitle>
            <CardDescription className="text-white/55">
              Daily and weekly reports plus intelligent alert coverage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
              <span className="text-sm text-white/65">Daily bookings</span>
              <StatusBadge tone="info">{data.analytics.dailyBookings}</StatusBadge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
              <span className="text-sm text-white/65">Daily revenue</span>
              <StatusBadge tone="success">{data.analytics.dailyRevenue}</StatusBadge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
              <span className="text-sm text-white/65">Open alerts</span>
              <StatusBadge tone={data.analytics.alertCount > 0 ? "warning" : "success"}>{data.analytics.alertCount}</StatusBadge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Analytics posture</CardTitle>
            <CardDescription className="text-white/55">
              Weekly lead conversion and content coverage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
              <span className="text-sm text-white/65">Weekly leads</span>
              <StatusBadge tone="info">{data.analytics.weeklyLeadCount}</StatusBadge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
              <span className="text-sm text-white/65">Lead conversion</span>
              <StatusBadge tone="warning">{formatPercent(data.analytics.leadConversionRate)}</StatusBadge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
              <span className="text-sm text-white/65">SEO posts</span>
              <StatusBadge tone="success">{data.analytics.seoPosts}</StatusBadge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
