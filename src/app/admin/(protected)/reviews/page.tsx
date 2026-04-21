import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { EmptyState } from "@/components/admin/EmptyState"
import { SectionStatusCard } from "@/components/admin/SectionStatusCard"
import { AdminStatGrid } from "@/components/admin/AdminStatGrid"
import { MetricCard } from "@/components/admin/MetricCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminReviewsOverview } from "@/lib/admin/reviews"

export default async function AdminReviewsPage() {
  const overview = await getAdminReviewsOverview()

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Reviews"
        title="Reviews"
        description="Track platform coverage and prepare draft responses for moderation."
      />

      <AdminStatGrid>
        <MetricCard title="Review platforms" value={String(Object.keys(overview.summary).length)} tone="info" />
        <MetricCard title="Review records" value={String(overview.reviews.length)} tone="success" />
        <MetricCard title="Low-star alerts" value={String(overview.alerts.lowStarCount)} tone="warning" />
        <MetricCard title="Draft responses" value={String(overview.alerts.pendingDraftCount)} tone="neutral" />
      </AdminStatGrid>

      <Card className="border-amber-400/20 bg-amber-500/10">
        <CardHeader>
          <CardTitle className="text-white">Review alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {overview.alerts.latestLowStarReviews.length === 0 ? (
            <div className="text-sm text-white/65">No low-star reviews are currently flagged.</div>
          ) : (
            overview.alerts.latestLowStarReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-white">{review.platform}</div>
                  <div className="text-xs uppercase tracking-[0.22em] text-white/45">
                    {review.rating ?? "—"} stars
                  </div>
                </div>
                <div className="mt-2 text-sm text-white/60">
                  {review.authorName ?? "Anonymous"} | {review.reviewDate ?? "Unknown date"}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <SectionStatusCard
        title="Response workflow"
        status={overview.alerts.pendingDraftCount > 0 ? "pending" : "planned"}
        description="Draft responses are generated automatically and remain pending human approval."
        nextStep="Approve or publish the AI draft responses after review polling syncs data."
      />

      <Card className="border-white/10 bg-white/5">
        <CardContent className="pt-6">
          {overview.reviews.length === 0 ? (
            <EmptyState
              title="No reviews yet"
              description="Once review data is synced, response drafts and moderation details will appear here."
            />
          ) : (
            <div className="space-y-3">
              {overview.reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-white">{review.platform}</div>
                    <div className="text-xs uppercase tracking-[0.22em] text-white/45">
                      {review.responseStatus}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-white/60">
                    {review.authorName ?? "Anonymous"} | Rating: {review.rating ?? "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
