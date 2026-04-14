"use client"

import { useMemo } from "react"
import { format } from "date-fns"

import { Calendar } from "@/components/ui/calendar"
import type { BookingAvailabilityEntry, BookingAvailabilityStatus } from "@/types/booking"

type DatePickerProps = {
  availability: BookingAvailabilityEntry[]
  selectedBoatId: string
  value?: string
  onChange: (nextDate: string) => void
}

function fromDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function DatePicker({
  availability,
  selectedBoatId,
  value,
  onChange,
}: DatePickerProps) {
  const scopedAvailability = useMemo(() => {
    if (!selectedBoatId) {
      return []
    }

    return availability.filter((entry) => entry.boatId === selectedBoatId)
  }, [availability, selectedBoatId])

  const byStatus = useMemo(() => {
    const statusMap = new Map<string, BookingAvailabilityStatus>()

    scopedAvailability.forEach((entry) => {
      statusMap.set(entry.date, entry.status)
    })

    return statusMap
  }, [scopedAvailability])

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

  const blockedDates = useMemo(
    () =>
      Array.from(byStatus.entries())
        .filter(([, status]) => status === "booked" || status === "maintenance")
        .map(([date]) => fromDateKey(date)),
    [byStatus]
  )

  return (
    <Calendar
      mode="single"
      selected={value ? fromDateKey(value) : undefined}
      onSelect={(nextDate) => {
        if (!nextDate) {
          return
        }

        onChange(format(nextDate, "yyyy-MM-dd"))
      }}
      disabled={blockedDates}
      modifiers={{
        available: availableDates,
        limited: limitedDates,
        booked: blockedDates,
      }}
      modifiersClassNames={{
        available: "rdp-day-available",
        limited: "rdp-day-limited",
        booked: "rdp-day-booked",
      }}
      className="w-full rounded-[1.5rem] border border-gold/10 bg-white/2 p-4"
    />
  )
}
