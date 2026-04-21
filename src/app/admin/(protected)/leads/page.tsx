import Link from "next/link"

import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { DataTableShell } from "@/components/admin/DataTableShell"
import { EmptyState } from "@/components/admin/EmptyState"
import { MetricCard } from "@/components/admin/MetricCard"
import { AdminStatGrid } from "@/components/admin/AdminStatGrid"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { Card, CardContent } from "@/components/ui/card"
import { getAdminLeadList } from "@/lib/admin/leads"
import { getSearchParamNumber, getSearchParamValue, type SearchParams } from "@/lib/admin/params"
import { formatStatusLabel } from "@/lib/admin/formatters"

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const page = getSearchParamNumber(searchParams, "page", 1)
  const query = getSearchParamValue(searchParams, "query") ?? ""
  const status = getSearchParamValue(searchParams, "status") ?? ""
  const source = getSearchParamValue(searchParams, "source") ?? ""
  const result = await getAdminLeadList({ query, status, source, page, pageSize: 10 })

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize))
  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams()
    if (query) params.set("query", query)
    if (status) params.set("status", status)
    if (source) params.set("source", source)
    params.set("page", String(nextPage))
    return `/admin/leads?${params.toString()}`
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="CRM"
        title="Leads"
        description="Search and inspect the inquiry pipeline, timeline activity, and contact readiness."
      />

      <AdminStatGrid>
        <MetricCard title="Visible leads" value={String(result.total)} tone="info" />
        <MetricCard title="Page" value={`${result.page}/${totalPages}`} tone="neutral" />
      </AdminStatGrid>

      <Card className="border-white/10 bg-white/5">
        <CardContent className="pt-6">
          <form className="grid gap-3 lg:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))_auto]" method="get">
            <input
              name="query"
              defaultValue={query}
              placeholder="Search name, email, phone, notes"
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-primary/50"
            />
            <input
              name="status"
              defaultValue={status}
              placeholder="status"
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-primary/50"
            />
            <input
              name="source"
              defaultValue={source}
              placeholder="source"
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-primary/50"
            />
            <button className="rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
              Filter
            </button>
          </form>
        </CardContent>
      </Card>

      <DataTableShell
        title="Lead queue"
        description="Most recent inquiry records, their source, and the number of logged activities."
      >
        {result.items.length === 0 ? (
          <EmptyState
            title="No leads yet"
            description="Once web inquiries, chats, or WhatsApp leads arrive, they will appear here with activity timelines."
          />
        ) : (
          <div className="space-y-3">
            {result.items.map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="grid gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-4 transition hover:border-primary/40 hover:bg-black/20 lg:grid-cols-[1.4fr_1fr_0.8fr_0.8fr]"
              >
                <div>
                  <div className="font-medium text-white">{lead.name}</div>
                  <div className="text-sm text-white/55">{lead.email ?? lead.phone ?? "No contact info"}</div>
                </div>
                <div className="text-sm text-white/60">
                  <div>{formatStatusLabel(lead.source)}</div>
                  <div>{formatStatusLabel(lead.status)}</div>
                </div>
                <div className="text-sm text-white/60">{lead.preferredDate ?? "No trip date"}</div>
                <div className="text-sm text-white/60">
                  <StatusBadge tone="info">{lead.activityCount} activities</StatusBadge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </DataTableShell>

      <div className="flex items-center justify-between text-sm text-white/65">
        <span>
          Showing {result.items.length} of {result.total}
        </span>
        <div className="flex gap-2">
          <Link
            href={buildHref(Math.max(1, result.page - 1))}
            className="rounded-xl border border-white/10 px-3 py-2 hover:bg-white/5"
          >
            Previous
          </Link>
          <Link
            href={buildHref(Math.min(totalPages, result.page + 1))}
            className="rounded-xl border border-white/10 px-3 py-2 hover:bg-white/5"
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  )
}
