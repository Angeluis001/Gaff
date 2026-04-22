import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { EmptyState } from "@/components/admin/EmptyState"
import { MetricCard } from "@/components/admin/MetricCard"
import { AdminStatGrid } from "@/components/admin/AdminStatGrid"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { ApproveReviewButton } from "@/components/admin/ApproveReviewButton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminReviewsOverview } from "@/lib/admin/reviews"

const STATUS_TONE = {
  pending: "warning",
  draft: "info",
  approved: "success",
  published: "neutral",
} as const

function starLabel(rating: number | null) {
  if (!rating) return "—"
  return "★".repeat(rating) + "☆".repeat(5 - rating)
}

export default async function AdminReviewsPage() {
  const overview = await getAdminReviewsOverview()

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Reviews"
        title="Reviews"
        description="Read guest reviews, check AI draft responses, and approve before publishing."
      />

      <AdminStatGrid>
        <MetricCard title="Review platforms" value={String(Object.keys(overview.summary).length)} tone="info" />
        <MetricCard title="Review records" value={String(overview.reviews.length)} tone="success" />
        <MetricCard title="Low-star alerts" value={String(overview.alerts.lowStarCount)} tone="warning" />
        <MetricCard title="Pending approval" value={String(overview.alerts.pendingDraftCount)} tone="neutral" />
      </AdminStatGrid>

      {overview.reviews.length === 0 ? (
        <Card className="border-white/10 bg-white/5">
          <CardContent className="pt-6">
            <EmptyState
              title="No reviews yet"
              description="Once review data is synced, response drafts and moderation details will appear here."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {overview.reviews.map((review) => {
            const tone = STATUS_TONE[review.responseStatus as keyof typeof STATUS_TONE] ?? "neutral"
            const canApprove = review.responseStatus === "pending" || review.responseStatus === "draft"

            return (
              <Card key={review.id} className="border-white/10 bg-white/5">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-semibold capitalize text-white">{review.platform}</span>
                      <StatusBadge tone={tone}>{review.responseStatus}</StatusBadge>
                    </div>
                    <span className="text-sm text-amber-300">{starLabel(review.rating)}</span>
                  </div>
                  <div className="text-sm text-white/50">
                    {review.authorName ?? "Anonymous"} · {review.reviewDate ?? "Unknown date"}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Guest review */}
                  <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="mb-1 text-xs uppercase tracking-widest text-white/40">Guest review</div>
                    <p className="text-sm leading-relaxed text-white/80">{review.content ?? "No content."}</p>
                  </div>

                  {/* AI draft response */}
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                    <div className="mb-1 text-xs uppercase tracking-widest text-emerald-400/70">AI draft response</div>
                    {review.responseContent ? (
                      <p className="text-sm leading-relaxed text-white/80">{review.responseContent}</p>
                    ) : (
                      <p className="text-sm text-white/35 italic">No draft generated yet — run the reviews cron to generate one.</p>
                    )}
                  </div>

                  {/* Approve action */}
                  {canApprove && review.responseContent && (
                    <div className="flex items-center gap-3">
                      <ApproveReviewButton reviewId={review.id} />
                      <span className="text-xs text-white/40">
                        Approving marks this response as ready to publish on the platform.
                      </span>
                    </div>
                  )}

                  {review.responseStatus === "approved" && (
                    <div className="text-sm text-emerald-400">
                      ✓ Response approved — ready to publish on {review.platform}.
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
