"use client"

import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  buildCloudinaryAssetUrl,
  isAbsoluteUrl,
  normalizeCloudinaryMediaValue,
} from "@/lib/cloudinary"
import type { PublicGalleryItem } from "@/lib/gallery"

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

function resolveAsset(value: string, resourceType: "image" | "video") {
  const normalized = normalizeCloudinaryMediaValue(value, resourceType, CLOUD_NAME)
  if (!normalized) return ""
  if (isAbsoluteUrl(normalized)) return normalized
  return (
    buildCloudinaryAssetUrl(normalized, resourceType, CLOUD_NAME, "f_auto,q_auto") ?? normalized
  )
}

interface Props {
  items: PublicGalleryItem[]
  activeIndex: number
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
}

export function GalleryLightbox({ items, activeIndex, onClose, onPrevious, onNext }: Props) {
  const item = items[activeIndex]

  if (!item) return null

  const mediaUrl = resolveAsset(item.mediaRef, item.mediaType)
  const posterUrl = item.posterRef ? resolveAsset(item.posterRef, "image") : undefined

  return (
    <div className="fixed inset-0 z-[80] bg-[#020817]/95 backdrop-blur-lg">
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
          onClick={onPrevious}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
          onClick={onNext}
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="grid h-full grid-rows-[1fr_auto] px-4 pb-6 pt-20 lg:px-10">
        <div className="flex min-h-0 items-center justify-center">
          <div className="relative flex h-full max-h-[72vh] w-full max-w-6xl items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
            {item.mediaType === "video" ? (
              <video
                src={mediaUrl}
                poster={posterUrl}
                className="h-full w-full object-contain"
                controls
                playsInline
                preload="metadata"
                autoPlay
              />
            ) : (
              <Image
                src={mediaUrl}
                alt={item.altText ?? item.title}
                fill
                className="object-contain"
                sizes="100vw"
              />
            )}
          </div>
        </div>

        <div className="mx-auto mt-5 w-full max-w-5xl rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-gold/75">
                {item.mediaType === "video" ? "Video Log" : "Gallery Capture"}
              </p>
              <h3 className="mt-2 font-heading text-3xl text-white">{item.title}</h3>
              {item.caption ? <p className="mt-2 max-w-3xl text-sm text-sand/72">{item.caption}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {item.boatCategory ? (
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                  Boat: {item.boatCategory}
                </span>
              ) : null}
              {item.species ? (
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                  Species: {item.species}
                </span>
              ) : null}
              {item.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
