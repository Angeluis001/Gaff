"use client"

import { useEffect, useState } from "react"
import { CldImage, CldUploadWidget } from "next-cloudinary"
import { Loader2, Trash2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type BoatCategory = "standard" | "midsize" | "large" | "luxury"

export interface BoatRow {
  id: string
  name: string
  slug: string
  category: BoatCategory
  capacity: number
  length: string | null
  description: string | null
  features: string[] | null
  images: string[] | null
  priceHalfDay: string | null
  priceFullDay: string | null
  captainName: string | null
  isActive: boolean
}

interface Props {
  open: boolean
  boat: BoatRow | null
  onClose: () => void
  onSaved: (boat: BoatRow) => void
}

const CATEGORIES: BoatCategory[] = ["standard", "midsize", "large", "luxury"]
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"

const labelClass = "block text-xs font-semibold uppercase tracking-widest text-white/50 mb-1"

export function BoatDialog({ open, boat, onClose, onSaved }: Props) {
  const isEditing = Boolean(boat)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [category, setCategory] = useState<BoatCategory>("standard")
  const [capacity, setCapacity] = useState("6")
  const [length, setLength] = useState("")
  const [description, setDescription] = useState("")
  const [features, setFeatures] = useState("") // comma-separated
  const [priceHalfDay, setPriceHalfDay] = useState("")
  const [priceFullDay, setPriceFullDay] = useState("")
  const [captainName, setCaptainName] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [images, setImages] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (boat) {
      setName(boat.name)
      setSlug(boat.slug)
      setCategory(boat.category)
      setCapacity(String(boat.capacity))
      setLength(boat.length ?? "")
      setDescription(boat.description ?? "")
      setFeatures((boat.features ?? []).join(", "))
      setPriceHalfDay(boat.priceHalfDay ?? "")
      setPriceFullDay(boat.priceFullDay ?? "")
      setCaptainName(boat.captainName ?? "")
      setIsActive(boat.isActive)
      setImages(boat.images ?? [])
    } else {
      setName("")
      setSlug("")
      setCategory("standard")
      setCapacity("6")
      setLength("")
      setDescription("")
      setFeatures("")
      setPriceHalfDay("")
      setPriceFullDay("")
      setCaptainName("")
      setIsActive(true)
      setImages([])
    }
    setError(null)
  }, [boat, open])

  const autoSlug = (value: string) =>
    value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")

  const handleNameChange = (value: string) => {
    setName(value)
    if (!isEditing) setSlug(autoSlug(value))
  }

  const removeImage = (publicId: string) =>
    setImages((prev) => prev.filter((id) => id !== publicId))

  const handleSave = async () => {
    setError(null)
    setSaving(true)

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        category,
        capacity: parseInt(capacity, 10),
        length: length.trim() || null,
        description: description.trim() || null,
        features: features
          ? features.split(",").map((f) => f.trim()).filter(Boolean)
          : null,
        images,
        priceHalfDay: priceHalfDay.trim() || null,
        priceFullDay: priceFullDay.trim() || null,
        captainName: captainName.trim() || null,
        isActive,
      }

      const url = isEditing ? `/api/admin/boats/${boat!.id}` : "/api/admin/boats"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? "Failed to save")
      }

      const saved = (await res.json()) as BoatRow
      onSaved(saved)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving boat")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border border-white/10 bg-[#0a1628] text-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {isEditing ? `Edit — ${boat?.name}` : "Add new boat"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Basic info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Name *</label>
              <input
                className={fieldClass}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Grander 37"
              />
            </div>
            <div>
              <label className={labelClass}>Slug *</label>
              <input
                className={fieldClass}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="grander-37"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Category *</label>
              <select
                className={fieldClass}
                value={category}
                onChange={(e) => setCategory(e.target.value as BoatCategory)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#0a1628]">
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Capacity *</label>
              <input
                className={fieldClass}
                type="number"
                min="1"
                max="30"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Length (ft)</label>
              <input
                className={fieldClass}
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder='37"'
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-xl border border-white/8 bg-white/3 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
              Pricing (USD)
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Half day price</label>
                <input
                  className={fieldClass}
                  value={priceHalfDay}
                  onChange={(e) => setPriceHalfDay(e.target.value)}
                  placeholder="1200.00"
                />
              </div>
              <div>
                <label className={labelClass}>Full day price</label>
                <input
                  className={fieldClass}
                  value={priceFullDay}
                  onChange={(e) => setPriceFullDay(e.target.value)}
                  placeholder="2200.00"
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <label className={labelClass}>Captain name</label>
            <input
              className={fieldClass}
              value={captainName}
              onChange={(e) => setCaptainName(e.target.value)}
              placeholder="Capitán Carlos"
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              className={`${fieldClass} resize-none`}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description shown on the landing page…"
            />
          </div>

          <div>
            <label className={labelClass}>Features (comma-separated)</label>
            <input
              className={fieldClass}
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="Live bait well, GPS fishfinder, Fighting chair"
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <div className="peer h-6 w-11 rounded-full bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full" />
            </label>
            <span className="text-sm text-white/70">
              {isActive ? "Active — visible to customers" : "Inactive — hidden from booking"}
            </span>
          </div>

          {/* Images */}
          <div className="rounded-xl border border-white/8 bg-white/3 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
              Images
            </p>

            {CLOUD_NAME && images.length > 0 && (
              <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {images.map((publicId) => (
                  <div key={publicId} className="group relative aspect-square overflow-hidden rounded-lg">
                    <CldImage
                      src={publicId}
                      alt="Boat image"
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(publicId)}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="size-5 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {CLOUD_NAME ? (
              <CldUploadWidget
                signatureEndpoint="/api/admin/cloudinary-signature"
                options={{
                  multiple: true,
                  maxFiles: 10,
                  resourceType: "image",
                  clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
                  maxFileSize: 8_000_000,
                }}
                onSuccess={(result) => {
                  if (result.info && typeof result.info === "object" && "public_id" in result.info) {
                    const publicId = (result.info as { public_id: string }).public_id
                    setImages((prev) => [...prev, publicId])
                  }
                }}
              >
                {({ open }) => (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                    onClick={() => open()}
                  >
                    <Upload className="size-4" />
                    Upload images
                  </Button>
                )}
              </CldUploadWidget>
            ) : (
              <p className="text-xs text-white/30">
                Cloudinary not configured — set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to enable uploads.
              </p>
            )}
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}
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
            onClick={handleSave}
            disabled={saving}
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {isEditing ? "Save changes" : "Create boat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
