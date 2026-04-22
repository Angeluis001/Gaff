import Link from "next/link"
import { notFound } from "next/navigation"

import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { EmptyState } from "@/components/admin/EmptyState"
import { MetricCard } from "@/components/admin/MetricCard"
import { AdminStatGrid } from "@/components/admin/AdminStatGrid"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminLeadDetail } from "@/lib/admin/leads"

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const detail = await getAdminLeadDetail(id)

  if (!detail) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Lead detail"
        title={detail.lead.name}
        description="Timeline, contact context, and the current lead state."
        actions={
          <Link className="rounded-xl border border-white/10 px-4 py-2 hover:bg-white/5" href="/admin/leads">
            Back to leads
          </Link>
        }
      />

      <AdminStatGrid>
        <MetricCard title="Status" value={detail.lead.status} tone="info" />
        <MetricCard title="Source" value={detail.lead.source} tone="neutral" />
        <MetricCard title="Activities" value={String(detail.lead.activityCount)} tone="warning" />
        <MetricCard title="Classification" value={detail.lead.classification ?? "Unclassified"} tone="success" />
      </AdminStatGrid>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Contact details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/70">
            <div>Email: {detail.lead.email ?? "—"}</div>
            <div>Phone: {detail.lead.phone ?? "—"}</div>
            <div>WhatsApp: {detail.lead.whatsappNumber ?? "—"}</div>
            <div>Preferred date: {detail.lead.preferredDate ?? "—"}</div>
            <div>Group size: {detail.lead.groupSize ?? "—"}</div>
            <div>Notes: {detail.lead.notes ?? "—"}</div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Activity timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.timeline.length === 0 ? (
              <EmptyState
                title="No activity yet"
                description="Lead activity will appear here once messages, notes, or stage changes are logged."
              />
            ) : (
              detail.timeline.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <StatusBadge tone="info">{entry.type}</StatusBadge>
                    <span className="text-xs text-white/45">{entry.createdAt}</span>
                  </div>
                  <p className="mt-2 text-sm text-white/70">{entry.description}</p>
                  {entry.agentId ? <p className="mt-1 text-xs text-white/45">Agent: {entry.agentId}</p> : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
