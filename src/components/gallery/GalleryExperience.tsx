"use client"

import { useEffect, useMemo, useState } from "react"

import type { PublicGalleryItem } from "@/lib/gallery"
import { GalleryFilters, type GalleryFilterValue } from "./GalleryFilters"
import { GalleryGrid } from "./GalleryGrid"
import { GalleryLightbox } from "./GalleryLightbox"

interface Props {
  items: PublicGalleryItem[]
}

export function GalleryExperience({ items }: Props) {
  const [activeFilter, setActiveFilter] = useState<GalleryFilterValue>("all")
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const filteredItems = useMemo(() => {
    switch (activeFilter) {
      case "image":
        return items.filter((item) => item.mediaType === "image")
      case "video":
        return items.filter((item) => item.mediaType === "video")
      case "featured":
        return items.filter((item) => item.featured)
      default:
        return items
    }
  }, [activeFilter, items])

  useEffect(() => {
    if (activeIndex === null) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null)
      if (event.key === "ArrowLeft") {
        setActiveIndex((prev) =>
          prev === null ? prev : (prev - 1 + filteredItems.length) % filteredItems.length
        )
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((prev) => (prev === null ? prev : (prev + 1) % filteredItems.length))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeIndex, filteredItems.length])

  useEffect(() => {
    if (activeIndex !== null && activeIndex >= filteredItems.length) {
      setActiveIndex(filteredItems.length ? 0 : null)
    }
  }, [activeIndex, filteredItems])

  return (
    <>
      <section className="landing-grid mt-8 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-gold/70">Curated Media</p>
            <h2 className="mt-3 font-heading text-4xl text-white">Explore the public gallery</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-sand/68">
              Filter between photos and videos, then open any asset full-screen to inspect boats,
              water conditions, and the kind of experience guests can expect offshore.
            </p>
          </div>
          <GalleryFilters active={activeFilter} onChange={setActiveFilter} />
        </div>

        <GalleryGrid
          items={filteredItems}
          onSelect={(item) =>
            setActiveIndex(filteredItems.findIndex((entry) => entry.id === item.id))
          }
        />
      </section>

      {activeIndex !== null && filteredItems[activeIndex] ? (
        <GalleryLightbox
          items={filteredItems}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onPrevious={() =>
            setActiveIndex((prev) =>
              prev === null ? prev : (prev - 1 + filteredItems.length) % filteredItems.length
            )
          }
          onNext={() =>
            setActiveIndex((prev) =>
              prev === null ? prev : (prev + 1) % filteredItems.length
            )
          }
        />
      ) : null}
    </>
  )
}
