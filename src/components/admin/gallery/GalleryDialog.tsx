"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { CldImage } from "next-cloudinary"
import { Loader2, Plus, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  buildCloudinaryAssetUrl,
  extractCloudinaryPublicId,
  isAbsoluteUrl,
  normalizeCloudinaryMediaValue,
} from "@/lib/cloudinary"

export type GalleryMediaType = "image" | "video"

export interface GalleryItemRow {
  id: string
  title: string
  slug: string
  mediaType: GalleryMediaType
  mediaRef: string
  posterRef: string | null
  caption: string | null
  altText: string | null
  tags: string[] | null
  boatCategory: string | null
  species: string | null
  sortOrder: number
  featured: boolean
  published: boolean
  createdAt: string | Date | null
  updatedAt: string | Date | null
}

interface Props {
  open: boolean
  item: GalleryItemRow | null
  onClose: () => void
  onSaved: (item: GalleryItemRow) => void
}

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-widest text-white/50"
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

function resolveAssetUrl(value: string, resourceType: GalleryMediaType) {
  const normalized = normalizeCloudinaryMediaValue(value, resourceType, CLOUD_NAME)
  if (!normalized) return ""
  if (isAbsoluteUrl(normalized)) return normalized
  return buildCloudinaryAssetUrl(normalized, resourceType, CLOUD_NAME, "f_auto,q_auto") ?? normalized
}

export function GalleryDialog({ open, item, onClose, onSaved }: Props) {
  const isEditing = Boolean(item)

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [mediaType, setMediaType] = useState<GalleryMediaType>("image")
  const [mediaRef, setMediaRef] = useState("")
  const [posterRef, setPosterRef] = useState("")
  const [caption, setCaption] = useState("")
  const [altText, setAltText] = useState("")
  const [tags, setTags] = useState("")
  const [boatCategory, setBoatCategory] = useState("")
  const [species, setSpecies] = useState("")
  const [sortOrder, setSortOrder] = useState("0")
  const [featured, setFeatured] = useState(false)
  const [published, setPublished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [uploadingPoster, setUploadingPoster] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (item) {
      setTitle(item.title)
      setSlug(item.slug)
      setMediaType(item.mediaType)
      setMediaRef(item.mediaRef)
      setPosterRef(item.posterRef ?? "")
      setCaption(item.caption ?? "")
      setAltText(item.altText ?? "")
      setTags((item.tags ?? []).join(", "))
      setBoatCategory(item.boatCategory ?? "")
      setSpecies(item.species ?? "")
      setSortOrder(String(item.sortOrder))
      setFeatured(item.featured)
      setPublished(item.published)
    } else {
      setTitle("")
      setSlug("")
      setMediaType("image")
      setMediaRef("")
      setPosterRef("")
      setCaption("")
      setAltText("")
      setTags("")
      setBoatCategory("")
      setSpecies("")
      setSortOrder("0")
      setFeatured(false)
      setPublished(false)
    }
    setSaving(false)
    setUploadingMedia(false)
    setUploadingPoster(false)
    setError(null)
  }, [item, open])

  const mediaPreviewUrl = useMemo(() => resolveAssetUrl(mediaRef, mediaType), [mediaRef, mediaType])
  const posterPreviewUrl = useMemo(() => resolveAssetUrl(posterRef, "image"), [posterRef])

  const uploadToCloudinary = async (file: File, folder: string) => {
    const signatureRes = await fetch("/api/admin/cloudinary-signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder }),
    })

    if (!signatureRes.ok) {
      throw new Error("Failed to get upload signature")
    }

    const signatureData = (await signatureRes.json()) as {
      signature: string
      timestamp: number
      apiKey: string
      cloudName: string
      folder: string
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("api_key", signatureData.apiKey)
    formData.append("timestamp", String(signatureData.timestamp))
    formData.append("signature", signatureData.signature)
    formData.append("folder", signatureData.folder)

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    )

    if (!uploadRes.ok) {
      throw new Error("Cloudinary upload failed")
    }

    const uploaded = (await uploadRes.json()) as { secure_url?: string }
    if (!uploaded.secure_url) {
      throw new Error("Upload finished without URL")
    }

    return uploaded.secure_url
  }

  const handleAssetUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    kind: "media" | "poster"
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    const isPoster = kind === "poster"
    if (isPoster) {
      setUploadingPoster(true)
    } else {
      setUploadingMedia(true)
      if (file.type.startsWith("video/")) {
        setMediaType("video")
      } else if (file.type.startsWith("image/")) {
        setMediaType("image")
      }
    }
    setError(null)

    try {
      const uploadedUrl = await uploadToCloudinary(file, "gaff/gallery")
      if (isPoster) {
        setPosterRef(uploadedUrl)
      } else {
        setMediaRef(uploadedUrl)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      if (isPoster) {
        setUploadingPoster(false)
      } else {
        setUploadingMedia(false)
      }
    }
  }

  const handleSave = async () => {
    setError(null)

    const normalizedMediaRef = mediaRef.trim()
    const normalizedTitle = title.trim()
    const normalizedSlug = slug.trim()
    const parsedSortOrder = Number.parseInt(sortOrder, 10)

    if (!normalizedTitle || !normalizedSlug || !normalizedMediaRef) {
      setError("Title, slug, and media reference are required")
      return
    }

    if (Number.isNaN(parsedSortOrder)) {
      setError("Sort order must be a valid number")
      return
    }

    setSaving(true)

    try {
      const payload = {
        title: normalizedTitle,
        slug: normalizedSlug,
        mediaType,
        mediaRef: normalizedMediaRef,
        posterRef: posterRef.trim() || null,
        caption: caption.trim() || null,
        altText: altText.trim() || normalizedTitle,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        boatCategory: boatCategory.trim() || null,
        species: species.trim() || null,
        sortOrder: parsedSortOrder,
        featured,
        published,
      }

      const res = await fetch(isEditing ? `/api/admin/gallery/${item!.id}` : "/api/admin/gallery", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = (await res.json()) as GalleryItemRow | { error?: string }
      if (!res.ok) {
        throw new Error("error" in data ? data.error ?? "Failed to save" : "Failed to save")
      }

      onSaved(data as GalleryItemRow)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving gallery item")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="flex max-h-[92vh] flex-col overflow-hidden border border-white/10 bg-[#0a1628] text-white sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {isEditing ? `Edit - ${item?.title}` : "Add gallery item"}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto pr-2">
          <div className="space-y-5 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Title *</label>
                <input
                  className={fieldClass}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (!isEditing) setSlug(makeSlug(e.target.value))
                  }}
                  placeholder="Sunrise marlin release"
                />
              </div>
              <div>
                <label className={labelClass}>Slug *</label>
                <input
                  className={fieldClass}
                  value={slug}
                  onChange={(e) => setSlug(makeSlug(e.target.value))}
                  placeholder="sunrise-marlin-release"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label className={labelClass}>Media type *</label>
                <select
                  className={fieldClass}
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as GalleryMediaType)}
                >
                  <option value="image" className="bg-[#0a1628]">
                    Image
                  </option>
                  <option value="video" className="bg-[#0a1628]">
                    Video
                  </option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Boat</label>
                <input
                  className={fieldClass}
                  value={boatCategory}
                  onChange={(e) => setBoatCategory(e.target.value)}
                  placeholder="large"
                />
              </div>
              <div>
                <label className={labelClass}>Species</label>
                <input
                  className={fieldClass}
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  placeholder="marlin"
                />
              </div>
              <div>
                <label className={labelClass}>Sort order</label>
                <input
                  className={fieldClass}
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-xl border border-white/8 bg-white/3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                  Upload
                </p>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
                    {uploadingMedia ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    Upload {mediaType}
                    <input
                      type="file"
                      accept={mediaType === "video" ? "video/*" : "image/*"}
                      className="hidden"
                      onChange={(e) => void handleAssetUpload(e, "media")}
                    />
                  </label>
                  {mediaType === "video" && (
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
                      {uploadingPoster ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Plus className="size-4" />
                      )}
                      Upload poster
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => void handleAssetUpload(e, "poster")}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Media ref or URL *</label>
                    <input
                      className={fieldClass}
                      value={mediaRef}
                      onChange={(e) => setMediaRef(e.target.value)}
                      placeholder="Cloudinary URL or public_id"
                    />
                  </div>
                  {mediaType === "video" && (
                    <div>
                      <label className={labelClass}>Poster ref or URL</label>
                      <input
                        className={fieldClass}
                        value={posterRef}
                        onChange={(e) => setPosterRef(e.target.value)}
                        placeholder="Optional poster image"
                      />
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
                    Preview
                  </p>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-white/5">
                    {mediaPreviewUrl ? (
                      mediaType === "image" ? (
                        isAbsoluteUrl(mediaPreviewUrl) ? (
                          <Image
                            src={mediaPreviewUrl}
                            alt={title || "Gallery preview"}
                            fill
                            className="object-cover"
                            sizes="320px"
                          />
                        ) : CLOUD_NAME ? (
                          <CldImage
                            src={extractCloudinaryPublicId(mediaPreviewUrl)}
                            alt={title || "Gallery preview"}
                            fill
                            className="object-cover"
                            sizes="320px"
                          />
                        ) : null
                      ) : (
                        <video
                          src={mediaPreviewUrl}
                          poster={posterPreviewUrl || undefined}
                          className="h-full w-full object-cover"
                          controls
                          muted
                          playsInline
                          preload="metadata"
                        />
                      )
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-white/35">
                        No media selected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Caption</label>
              <textarea
                className={`${fieldClass} resize-none`}
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Short editorial caption for the gallery viewer"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Alt text</label>
                <input
                  className={fieldClass}
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Anglers celebrating a marlin release in Cabo"
                />
              </div>
              <div>
                <label className={labelClass}>Tags (comma-separated)</label>
                <input
                  className={fieldClass}
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="marlin, crew, sunrise"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <span className="text-sm text-white/75">Featured item</span>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                />
                <span className="text-sm text-white/75">Published to public gallery</span>
              </label>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-full bg-amber-400 text-navy hover:bg-amber-300"
            onClick={() => void handleSave()}
            disabled={saving || uploadingMedia || uploadingPoster}
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {isEditing ? "Save changes" : "Create asset"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
