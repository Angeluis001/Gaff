import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { EmptyState } from "@/components/admin/EmptyState"
import { SectionStatusCard } from "@/components/admin/SectionStatusCard"
import { AdminStatGrid } from "@/components/admin/AdminStatGrid"
import { MetricCard } from "@/components/admin/MetricCard"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { Card, CardContent } from "@/components/ui/card"
import { getAdminSeoOverview } from "@/lib/admin/seo"

const KIND_LABEL: Record<string, string> = {
  blog_post: "Blog post",
  fishing_report: "Fishing report",
}

export default async function AdminSeoPage() {
  const overview = await getAdminSeoOverview()

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="SEO"
        title="SEO"
        description="AI-generated blog posts and fishing reports. Review drafts and publish when ready."
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

      {/* Keyword report */}
      <Card className="border-white/10 bg-white/5">
        <CardContent className="pt-6">
          <div className="mb-4 text-xs uppercase tracking-[0.22em] text-white/45">Keyword report</div>
          {overview.keywordReport.length === 0 ? (
            <EmptyState title="No keywords tracked yet" description="Keywords will appear after the SEO generator runs." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {overview.keywordReport.map((kw) => (
                <div key={kw.keyword} className="rounded-xl border border-white/10 bg-black/10 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-white">{kw.keyword}</span>
                    <span className="text-xs text-white/50">{kw.trend}</span>
                  </div>
                  <div className="mt-1 text-xs text-white/40">
                    GAFF #{kw.gaffRank} vs competitor #{kw.competitorRank}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEO posts — full content */}
      <div className="space-y-4">
        <div className="text-xs uppercase tracking-[0.22em] text-white/45">Content feed</div>

        {overview.recentSeoPosts.length === 0 ? (
          <Card className="border-white/10 bg-white/5">
            <CardContent className="pt-6">
              <EmptyState
                title="No SEO content yet"
                description="Weekly blog posts and completed-trip reports will appear here after the generator runs."
              />
            </CardContent>
          </Card>
        ) : (
          overview.recentSeoPosts.map((post) => (
            <Card key={post.id} className="border-white/10 bg-white/5">
              <CardContent className="pt-5">
                {/* Header */}
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-white">{post.title}</div>
                    {post.keywordFocus && (
                      <div className="mt-0.5 text-xs text-white/40">
                        Keyword: <span className="text-emerald-400/80">{post.keywordFocus}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/50">
                      {KIND_LABEL[post.kind] ?? post.kind}
                    </span>
                    <StatusBadge tone={post.status === "published" ? "success" : post.status === "scheduled" ? "info" : "neutral"}>
                      {post.status}
                    </StatusBadge>
                  </div>
                </div>

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="mb-3 text-sm italic text-white/55">{post.excerpt}</p>
                )}

                {/* Expandable full content */}
                <details className="group">
                  <summary className="cursor-pointer select-none list-none text-xs text-emerald-400/70 hover:text-emerald-400 transition-colors">
                    <span className="group-open:hidden">▶ Read full content</span>
                    <span className="hidden group-open:inline">▼ Hide content</span>
                  </summary>
                  <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-4 py-4">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed text-white/75 font-sans">
                      {post.content}
                    </pre>
                  </div>
                </details>

                {/* Footer dates */}
                <div className="mt-3 text-xs text-white/30">
                  {post.scheduledAt && <>Scheduled: {post.scheduledAt}</>}
                  {post.publishedAt && <> · Published: {post.publishedAt}</>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
