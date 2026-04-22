"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function ApproveReviewButton({ reviewId }: { reviewId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleApprove() {
    setLoading(true)
    try {
      await fetch(`/api/admin/reviews/${reviewId}/approve`, { method: "POST" })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleApprove}
      className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-sm text-emerald-100 transition hover:bg-emerald-500/25 disabled:opacity-60"
    >
      {loading ? "Approving..." : "Approve response"}
    </button>
  )
}
