"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { CldImage } from "next-cloudinary"
import { Edit2, Eye, EyeOff, Loader2, Plus, RefreshCw, Sparkles, Trash2, Video } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { extractCloudinaryPublicId, isAbsoluteUrl, normalizeCloudinaryMediaValue } from "@/lib/cloudinary"
import { GalleryDialog, type GalleryItemRow } from "./GalleryDialog"

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

function previewUrl(item: GalleryItemRow) {
  return normalizeCloudinaryMediaValue(item.mediaRef, item.mediaType, CLOUD_NAME)
}

function posterUrl(item: GalleryItemRow) {
  if (!item.posterRef) return ""
  return normalizeCloudinaryMediaValue(item.posterRef, "image", CLOUD_NAME)
}

interface Props {
  initialItems: GalleryItemRow[]
}

export function GalleryManager({ initialItems }: Props) {
  const [items, setItems] = useState<GalleryItemRow[]>(initialItems)
  const [dialog, setDialog] = useState<{ open: boolean; item: GalleryItemRow | null }>({
    open: false,
    item: null,
  })
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)

  const handleSync = async () => {
    setSyncing(true)
    setSyncMsg(null)
    try {
      const res = await fetch("/api/admin/gallery/sync", { method: "POST" })
      const data = (await res.json()) as { inserted?: number; skipped?: number; total?: number; error?: string }
      if (!res.ok) throw new Error(data.error ?? "Sync failed")
      setSyncMsg(`✓ ${data.inserted} new · ${data.skipped} already exist (${data.total} total in Cloudinary)`)
      if ((data.inserted ?? 0) > 0) {
        const refreshed = await fetch("/api/admin/gallery")
        if (refreshed.ok) setItems(await refreshed.json() as GalleryItemRow[])
      }
    } catch (err) {
      setSyncMsg(`Error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setSyncing(false)
    }
  }

  const sortedItems = useMemo(
    () =>
      items
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)),
    [items]
  )

  const openAdd = () => setDialog({ open: true, item: null })
  const openEdit = (item: GalleryItemRow) => setDialog({ open: true, item })
  const closeDialog = () => setDialog({ open: false, item: null })

  const handleSaved = (saved: GalleryItemRow) => {
    setItems((prev) => {
      const index = prev.findIndex((item) => item.id === saved.id)
      if (index >= 0) {
        const next = [...prev]
        next[index] = saved
        return next
      }
      return [...prev, saved]
    })
    closeDialog()
  }

  const toggleField = async (item: GalleryItemRow, field: "published" | "featured") => {
    setPendingId(item.id)
    try {
      const res = await fetch(`/api/admin/gallery/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !item[field] }),
      })
      if (!res.ok) {
        throw new Error("Failed to update gallery item")
      }

      const updated = (await res.json()) as GalleryItemRow
      setItems((prev) => prev.map((entry) => (entry.id === updated.id ? updated : entry)))
    } finally {
      setPendingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this gallery item? This cannot be undone.")) return
    setPendingId(id)
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" })
      if (!res.ok) {
        throw new Error("Failed to delete gallery item")
      }
      setItems((prev) => prev.filter((item) => item.id !== id))
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
            onClick={() => void handleSync()}
            disabled={syncing}
          >
            <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} />
            Sync from Cloudinary
          </Button>
          {syncMsg && (
            <span className="text-xs text-white/50">{syncMsg}</span>
          )}
        </div>
        <Button
          type="button"
          className="rounded-full bg-amber-400 text-navy hover:bg-amber-300"
          onClick={openAdd}
        >
          <Plus className="size-4" />
          Add asset
        </Button>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Gallery assets ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedItems.length === 0 ? (
            <p className="text-sm text-white/40">
              No gallery assets yet. Add the first image or video above.
            </p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {sortedItems.map((item) => {
                const mediaPreview = previewUrl(item)
                const resolvedPoster = posterUrl(item)

                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-black/10"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
                      {item.mediaType === "image" ? (
                        isAbsoluteUrl(mediaPreview) ? (
                          <Image
                            src={mediaPreview}
                            alt={item.altText ?? item.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1280px) 50vw, 33vw"
                          />
                        ) : CLOUD_NAME ? (
                          <CldImage
                            src={extractCloudinaryPublicId(mediaPreview)}
                            alt={item.altText ?? item.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1280px) 50vw, 33vw"
                          />
                        ) : null
                      ) : (
                        <video
                          src={mediaPreview}
                          poster={resolvedPoster || undefined}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      )}

                      <div className="absolute left-3 top-3 flex gap-2">
                        <span className="rounded-full bg-black/65 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
                          {item.mediaType}
                        </span>
                        {item.featured && (
                          <span className="rounded-full bg-amber-400/85 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-navy">
                            featured
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 p-4">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-white">{item.title}</div>
                            <div className="mt-1 text-xs text-white/45">{item.slug}</div>
                          </div>
                          <div className="text-xs text-white/45">#{item.sortOrder}</div>
                        </div>
                        {item.caption && (
                          <p className="mt-2 line-clamp-2 text-sm text-white/60">{item.caption}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-white/45">
                        {item.boatCategory && (
                          <span className="rounded-full border border-white/10 px-2 py-1">
                            Boat: {item.boatCategory}
                          </span>
                        )}
                        {item.species && (
                          <span className="rounded-full border border-white/10 px-2 py-1">
                            Species: {item.species}
                          </span>
                        )}
                        {(item.tags ?? []).slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full border border-white/10 px-2 py-1">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-lg border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                          onClick={() => openEdit(item)}
                        >
                          <Edit2 className="size-3.5" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-lg border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                          onClick={() => void toggleField(item, "published")}
                          disabled={pendingId === item.id}
                        >
                          {item.published ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                          {item.published ? "Unpublish" : "Publish"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-lg border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                          onClick={() => void toggleField(item, "featured")}
                          disabled={pendingId === item.id}
                        >
                          <Sparkles className="size-3.5" />
                          {item.featured ? "Unfeature" : "Feature"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-lg border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10"
                          onClick={() => void handleDelete(item.id)}
                          disabled={pendingId === item.id}
                        >
                          {pendingId === item.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between text-xs text-white/40">
                        <span>{item.published ? "Live on public gallery" : "Draft only"}</span>
                        {item.mediaType === "video" && (
                          <span className="inline-flex items-center gap-1">
                            <Video className="size-3.5" />
                            video asset
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {dialog.open && (
        <GalleryDialog
          open={dialog.open}
          item={dialog.item}
          onClose={closeDialog}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
