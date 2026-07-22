"use client"

import { useMemo } from "react"
import { format } from "date-fns"

import { Calendar } from "@/components/ui/calendar"
import type { BookingAvailabilityEntry, BookingAvailabilityStatus } from "@/types/booking"

type DatePickerProps = {
  availability: BookingAvailabilityEntry[]
  selectedBoatId?: string
  /** When true, only show days where at least one boat is free (not scoped to a single boat). */
  anyBoat?: boolean
  value?: string
  onChange: (nextDate: string) => void
  legend?: {
    available: string
    limited: string
    booked: string
  }
}

function fromDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export function DatePicker({
  availability,
  selectedBoatId,
  anyBoat = false,
  value,
  onChange,
  legend,
}: DatePickerProps) {
  const scopedAvailability = useMemo(() => {
    if (anyBoat) {
      return availability
    }

    if (!selectedBoatId) {
      return []
    }

    return availability.filter((entry) => entry.boatId === selectedBoatId)
  }, [anyBoat, availability, selectedBoatId])

  const byStatus = useMemo(() => {
    if (!anyBoat) {
      const statusMap = new Map<string, BookingAvailabilityStatus>()
      scopedAvailability.forEach((entry) => {
        statusMap.set(entry.date, entry.status)
      })
      return statusMap
    }

    const grouped = new Map<string, BookingAvailabilityStatus[]>()
    scopedAvailability.forEach((entry) => {
      const current = grouped.get(entry.date) ?? []
      current.push(entry.status)
      grouped.set(entry.date, current)
    })

    const statusMap = new Map<string, BookingAvailabilityStatus>()
    grouped.forEach((statuses, date) => {
      if (statuses.includes("available")) {
        statusMap.set(date, "available")
      } else if (statuses.includes("limited")) {
        statusMap.set(date, "limited")
      } else if (statuses.includes("maintenance")) {
        statusMap.set(date, "maintenance")
      } else {
        statusMap.set(date, "booked")
      }
    })

    return statusMap
  }, [anyBoat, scopedAvailability])

  const availableDates = useMemo(
    () =>
      Array.from(byStatus.entries())
        .filter(([, status]) => status === "available")
        .map(([date]) => fromDateKey(date)),
    [byStatus]
  )

  const limitedDates = useMemo(
    () =>
      Array.from(byStatus.entries())
        .filter(([, status]) => status === "limited")
        .map(([date]) => fromDateKey(date)),
    [byStatus]
  )

  const selectableKeys = useMemo(() => {
    const keys = new Set<string>()
    byStatus.forEach((status, date) => {
      if (status === "available" || status === "limited") {
        keys.add(date)
      }
    })
    return keys
  }, [byStatus])

  const today = startOfToday()

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={value ? fromDateKey(value) : undefined}
        onSelect={(nextDate) => {
          if (!nextDate) {
            return
          }

          const key = format(nextDate, "yyyy-MM-dd")
          if (!selectableKeys.has(key)) {
            return
          }

          onChange(key)
        }}
        disabled={(date) => {
          if (date < today) {
            return true
          }

          return !selectableKeys.has(format(date, "yyyy-MM-dd"))
        }}
        modifiers={{
          available: availableDates,
          limited: limitedDates,
        }}
        modifiersClassNames={{
          available: "rdp-day-available",
          limited: "rdp-day-limited",
        }}
        className="w-full rounded-[1.5rem] border border-gold/10 bg-white/2 p-4"
      />

      {legend ? (
        <div className="flex flex-wrap gap-4 px-1 text-xs text-sand/68">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-teal" />
            {legend.available}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-gold" />
            {legend.limited}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-coral" />
            {legend.booked}
          </span>
        </div>
      ) : null}
    </div>
  )
}
