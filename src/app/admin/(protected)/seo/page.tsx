import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { EmptyState } from "@/components/admin/EmptyState"
import { SectionStatusCard } from "@/components/admin/SectionStatusCard"
import { AdminStatGrid } from "@/components/admin/AdminStatGrid"
import { MetricCard } from "@/components/admin/MetricCard"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getAdminSeoOverview } from "@/lib/admin/seo"

export default async function AdminSeoPage() {
  const overview = await getAdminSeoOverview()

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="SEO"
        title="SEO"
        description="Hold the content and reporting surfaces that future automation will populate."
      />

      <AdminStatGrid>
        <MetricCard title="Weekly reports" value={String(overview.weeklyReports)} tone="info" />
        <MetricCard title="SEO posts" value={String(overview.totalSeoPosts)} tone="success" />
        <MetricCard title="Blog posts" value={String(overview.blogPostCount)} tone="neutral" />
        <MetricCard title="Fishing reports" value={String(overview.fishingReportCount)} tone="warning" />
      </AdminStatGrid>

      <SectionStatusCard
        title="Ranking and content"
        status={overview.totalSeoPosts > 0 ? "live" : "pending"}
        description="Weekly blog posts and fishing reports now flow through the SEO content store."
        nextStep="Keep the weekly generator running and expand keyword coverage as bookings increase."
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-white/10 bg-white/5">
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-white/45">Latest content</div>
                <div className="mt-1 text-lg font-semibold text-white">SEO feed</div>
              </div>
              {overview.latestPost ? (
                <Badge variant="outline" className="border-white/10 text-white/60">
                  {overview.latestPost.kind}
                </Badge>
              ) : null}
            </div>
            {overview.latestPost ? (
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
                  <div className="font-medium text-white">{overview.latestPost.title}</div>
                  <div className="text-sm text-white/60">{overview.latestPost.status}</div>
                  <div className="mt-2 text-xs text-white/45">
                    Scheduled: {overview.latestPost.scheduledAt ?? "N/A"} | Published: {overview.latestPost.publishedAt ?? "N/A"}
                  </div>
                </div>
                {overview.recentSeoPosts.map((post) => (
                  <div key={post.id} className="rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-white">{post.title}</div>
                      <span className="text-xs uppercase tracking-[0.22em] text-white/45">{post.kind}</span>
                    </div>
                    <div className="mt-1 text-sm text-white/60">{post.status}</div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No SEO content yet"
                description="Weekly blog posts and completed-trip reports will appear here after the generator runs."
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardContent className="pt-6">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">Keyword report</div>
            <div className="mt-2 space-y-3">
              {overview.keywordReport.map((keyword) => (
                <div key={keyword.keyword} className="rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-white">{keyword.keyword}</div>
                    <Badge variant="outline" className="border-white/10 text-white/60">
                      {keyword.trend}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-white/45">
                    GAFF #{keyword.gaffRank} vs competitor #{keyword.competitorRank}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardContent className="pt-6">
          {overview.recentCompletedTrips.length === 0 ? (
            <EmptyState
              title="No completed trips yet"
              description="Fishing reports and keyword updates will be generated after completed bookings exist."
            />
          ) : (
            <div className="space-y-3">
              {overview.recentCompletedTrips.map((trip) => (
                <div key={trip.id} className="rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
                  <div className="font-medium text-white">{trip.tripType}</div>
                  <div className="text-sm text-white/60">{trip.date}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
