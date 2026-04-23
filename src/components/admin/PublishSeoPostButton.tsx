"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function PublishSeoPostButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const router = useRouter()

  async function handlePublish() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/seo/${postId}/publish`, {
        method: "POST",
        credentials: "same-origin",
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? `Error ${res.status}`)
        return
      }
      setDone(true)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <span className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-sm text-emerald-300">
        Published
      </span>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={loading}
        onClick={handlePublish}
        className="rounded-xl border border-sky-400/30 bg-sky-500/15 px-4 py-2 text-sm text-sky-100 transition hover:bg-sky-500/25 disabled:opacity-60"
      >
        {loading ? "Publishing..." : "Publish"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
