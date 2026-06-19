"use client"

export type GalleryFilterValue = "all" | "image" | "video" | "featured"

interface Props {
  active: GalleryFilterValue
  onChange: (value: GalleryFilterValue) => void
}

const FILTERS: Array<{ value: GalleryFilterValue; label: string }> = [
  { value: "all", label: "All" },
  { value: "image", label: "Photos" },
  { value: "video", label: "Videos" },
  { value: "featured", label: "Featured" },
]

export function GalleryFilters({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          type="button"
          onClick={() => onChange(filter.value)}
          className={`rounded-full border px-4 py-2 text-sm transition ${
            active === filter.value
              ? "border-gold bg-gold text-navy"
              : "border-gold/20 bg-white/5 text-sand/80 hover:border-gold/40 hover:text-white"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
