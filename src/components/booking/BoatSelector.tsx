"use client"

import type { BookingBoatOption } from "@/types/booking"

type BoatSelectorProps = {
  boats: BookingBoatOption[]
  selectedBoatId: string
  onSelect: (boatId: string) => void
}

export function BoatSelector({
  boats,
  selectedBoatId,
  onSelect,
}: BoatSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {boats.map((boat) => {
        const selected = boat.id === selectedBoatId

        return (
          <button
            key={boat.id}
            type="button"
            onClick={() => onSelect(boat.id)}
            className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${
              selected
                ? "border-gold bg-gold text-navy"
                : "border-gold/16 bg-white/4 text-sand/82 hover:bg-white/8"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-heading text-xl">{boat.name}</p>
                <p className={selected ? "text-navy/72" : "text-sand/60"}>
                  {boat.capacity} guests
                </p>
              </div>
              <div className="text-right text-sm">
                <p>Half day: ${boat.priceHalfDay ?? "TBD"}</p>
                <p>Full day: ${boat.priceFullDay ?? "TBD"}</p>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
