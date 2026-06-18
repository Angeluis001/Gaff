"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, PlayCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
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
}

export function GalleryTeaserSection({ items }: Props) {
  const { lang } = useLanguage()

  if (items.length === 0) return null

  return (
    <section className="landing-section scroll-mt-24 pt-0">
      <div className="landing-grid">
        <div className="glass-panel overflow-hidden rounded-[2rem] border border-gold/10 p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="section-kicker">{lang === "es" ? "Galería" : "Gallery"}</p>
              <h2 className="section-title mt-5">
                {lang === "es"
                  ? "Momentos reales de la experiencia GAFF"
                  : "Real moments from the GAFF experience"}
              </h2>
              <p className="section-copy mt-5">
                {lang === "es"
                  ? "Desde liberaciones de marlín hasta tomas a bordo y videos de navegación, la nueva galería muestra lo que los clientes realmente viven en el agua."
                  : "From marlin releases to on-board captures and running footage, the new gallery shows what guests actually experience offshore."}
              </p>
            </div>
            <Button
              render={<Link href="/gallery" />}
              size="lg"
              className="rounded-full bg-gold px-6 text-sm font-semibold text-navy hover:bg-gold/90"
            >
              {lang === "es" ? "Ver galería completa" : "View full gallery"}
              <ArrowRight className="size-4" />
            </Button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {items.slice(0, 3).map((item) => {
              const mediaUrl = resolveAsset(item.mediaRef, item.mediaType)
              const posterUrl = item.posterRef ? resolveAsset(item.posterRef, "image") : undefined

              return (
                <Link
                  key={item.id}
                  href="/gallery"
                  className="group overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/5"
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
                        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" />
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
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" />
                      </>
                    )}
                  </div>
                  <div className="space-y-2 px-4 py-4">
                    <div className="font-heading text-2xl text-white">{item.title}</div>
                    {item.caption ? <p className="text-sm text-sand/68">{item.caption}</p> : null}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
