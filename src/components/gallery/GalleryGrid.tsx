"use client"

import Image from "next/image"
import { PlayCircle } from "lucide-react"

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
  onSelect: (item: PublicGalleryItem) => void
}

export function GalleryGrid({ items, onSelect }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-12 text-center text-sand/65">
        No media has been published yet. Check back after the next trip on the water.
      </div>
    )
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const mediaUrl = resolveAsset(item.mediaRef, item.mediaType)
        const posterUrl = item.posterRef ? resolveAsset(item.posterRef, "image") : undefined

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 text-left transition hover:border-gold/30 hover:bg-white/[0.08]"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[#081422]">
              {item.mediaType === "video" ? (
                <>
                  <video
                    src={mediaUrl}
                    poster={posterUrl}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="rounded-full border border-white/20 bg-black/40 p-3 text-white backdrop-blur">
                      <PlayCircle className="size-7" />
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Image
                    src={mediaUrl}
                    alt={item.altText ?? item.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-transparent to-transparent" />
                </>
              )}

              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                {item.featured ? (
                  <span className="rounded-full bg-gold px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-navy">
                    Featured
                  </span>
                ) : null}
                <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
                  {item.mediaType === "video" ? "Video" : "Photo"}
                </span>
              </div>
            </div>

            <div className="space-y-3 px-5 py-5">
              <div>
                <h3 className="font-heading text-3xl text-white">{item.title}</h3>
                {item.caption ? <p className="mt-2 text-sm text-sand/68">{item.caption}</p> : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {item.boatCategory ? (
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                    {item.boatCategory}
                  </span>
                ) : null}
                {item.species ? (
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                    {item.species}
                  </span>
                ) : null}
                {item.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
