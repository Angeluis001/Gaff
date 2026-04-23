"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function PublishSeoPostButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handlePublish() {
    setLoading(true)
    try {
      await fetch(`/api/admin/seo/${postId}/publish`, { method: "POST" })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handlePublish}
      className="rounded-xl border border-sky-400/30 bg-sky-500/15 px-4 py-2 text-sm text-sky-100 transition hover:bg-sky-500/25 disabled:opacity-60"
    >
      {loading ? "Publishing..." : "Publish"}
    </button>
  )
}
