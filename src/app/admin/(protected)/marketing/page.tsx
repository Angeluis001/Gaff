import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { EmptyState } from "@/components/admin/EmptyState"
import { SectionStatusCard } from "@/components/admin/SectionStatusCard"
import { AdminStatGrid } from "@/components/admin/AdminStatGrid"
import { MetricCard } from "@/components/admin/MetricCard"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getAdminMarketingOverview } from "@/lib/admin/marketing"

export default async function AdminMarketingPage() {
  const overview = await getAdminMarketingOverview()

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Marketing"
        title="Marketing"
        description="Stage content, preview post readiness, and prepare for the social publishing workflow."
      />

      <AdminStatGrid>
        <MetricCard title="Drafts" value={String(overview.queue.summary.draftCount)} tone="info" />
        <MetricCard title="Scheduled" value={String(overview.queue.summary.scheduledCount)} tone="warning" />
        <MetricCard title="Published" value={String(overview.queue.summary.publishedCount)} tone="success" />
        <MetricCard
          title="Queue health"
          value={overview.queue.summary.queueHealth}
          tone={overview.queue.summary.queueHealth === "blocked" ? "danger" : "neutral"}
        />
      </AdminStatGrid>

      <SectionStatusCard
        title="Publishing pipeline"
        status={overview.queue.summary.queueHealth === "blocked" ? "blocked" : overview.queue.summary.scheduledCount > 0 ? "live" : "pending"}
        description="Marketing posts, publishing readiness, and campaign visibility are now tracked server-side."
        nextStep="Keep the queue moving and confirm Meta/TikTok credentials before live publication."
      />

      <Card className="border-white/10 bg-white/5">
        <CardContent className="pt-6">
          {overview.posts.length === 0 ? (
            <EmptyState
              title="No marketing posts yet"
              description="Once posts are created or synced, they will appear in this launch-ready queue."
            />
          ) : (
            <div className="space-y-3">
              {overview.posts.map((post) => (
                <div key={post.id} className="rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-white">{post.platform}</div>
                    <div className="text-xs uppercase tracking-[0.22em] text-white/45">{post.status}</div>
                  </div>
                  <div className="mt-2 text-sm text-white/65">{post.content}</div>
                  <div className="mt-2 text-xs text-white/45">
                    Scheduled: {post.scheduledAt ?? "—"} | Published: {post.publishedAt ?? "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-white/10 bg-white/5">
          <CardContent className="pt-6">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">Ads readiness</div>
            <div className="mt-2 space-y-3">
              {overview.ads.campaigns.map((campaign) => (
                <div key={campaign.name} className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
                  <span className="text-sm text-white/65">{campaign.name}</span>
                  <Badge variant="outline" className="border-white/10 text-white/60">
                    {campaign.status}
                  </Badge>
                </div>
              ))}
              <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white/70">
                {overview.ads.spendStatus}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardContent className="pt-6">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">Queue summary</div>
            <div className="mt-2 space-y-2 text-sm text-white/70">
              <div>Drafts: {overview.queue.summary.draftCount}</div>
              <div>Scheduled: {overview.queue.summary.scheduledCount}</div>
              <div>Published: {overview.queue.summary.publishedCount}</div>
              <div>Failed: {overview.queue.summary.failedCount}</div>
              <div>
                Next scheduled:{" "}
                {overview.queue.summary.nextScheduledAt ? new Date(overview.queue.summary.nextScheduledAt).toLocaleString() : "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
