import Link from "next/link"

import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { DataTableShell } from "@/components/admin/DataTableShell"
import { EmptyState } from "@/components/admin/EmptyState"
import { MetricCard } from "@/components/admin/MetricCard"
import { AdminStatGrid } from "@/components/admin/AdminStatGrid"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { Card, CardContent } from "@/components/ui/card"
import { getAdminClientList } from "@/lib/admin/clients"
import { getSearchParamNumber, getSearchParamValue, type SearchParams } from "@/lib/admin/params"

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  const resolvedParams = await searchParams
  const page = getSearchParamNumber(resolvedParams, "page", 1)
  const query = getSearchParamValue(resolvedParams, "query") ?? ""
  const result = await getAdminClientList({ query, page, pageSize: 10 })

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize))
  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams()
    if (query) params.set("query", query)
    params.set("page", String(nextPage))
    return `/admin/clients?${params.toString()}`
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="CRM"
        title="Clients"
        description="Track repeat guests, spending, and trip history."
      />

      <AdminStatGrid>
        <MetricCard title="Visible clients" value={String(result.total)} tone="info" />
        <MetricCard title="Page" value={`${result.page}/${totalPages}`} tone="neutral" />
      </AdminStatGrid>

      <Card className="border-white/10 bg-white/5">
        <CardContent className="pt-6">
          <form className="grid gap-3 lg:grid-cols-[1.5fr_auto]" method="get">
            <input
              name="query"
              defaultValue={query}
              placeholder="Search name, email, phone, country"
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-primary/50"
            />
            <button className="rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
              Filter
            </button>
          </form>
        </CardContent>
      </Card>

      <DataTableShell
        title="Client roster"
        description="Operators can inspect repeat guest history and spend from here."
      >
        {result.items.length === 0 ? (
          <EmptyState
            title="No clients yet"
            description="Client records will appear as bookings are completed and contact data is enriched."
          />
        ) : (
          <div className="space-y-3">
            {result.items.map((client) => (
              <Link
                key={client.id}
                href={`/admin/clients/${client.id}`}
                className="grid gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-4 transition hover:border-primary/40 hover:bg-black/20 lg:grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr]"
              >
                <div>
                  <div className="font-medium text-white">{client.name}</div>
                  <div className="text-sm text-white/55">{client.email}</div>
                </div>
                <div className="text-sm text-white/60">
                  <div>{client.totalTrips} trips</div>
                  <div>{client.lastTripDate ?? "No trips yet"}</div>
                </div>
                <div className="text-sm text-white/60">{client.totalSpend}</div>
                <div className="text-sm text-white/60">
                  <StatusBadge tone="success">{client.country ?? "Unknown"}</StatusBadge>
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
