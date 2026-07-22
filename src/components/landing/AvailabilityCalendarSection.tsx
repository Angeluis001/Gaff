"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowRight, CalendarSync, LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { useLanguage } from "@/contexts/LanguageContext"
import type { BoatCategory } from "@/lib/landing-data"
import type {
  BookingAvailabilityEntry,
  BookingAvailabilityResponse,
  BookingBoatOption,
} from "@/types/booking"

type AvailabilityResponse = BookingAvailabilityResponse
type AvailabilityStatus = BookingAvailabilityEntry["status"]

const REFRESH_INTERVAL_MS = 60_000

function toDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function getAggregatedStatus(statuses: AvailabilityStatus[]) {
  if (statuses.includes("available")) {
    return "available"
  }

  if (statuses.includes("limited")) {
    return "limited"
  }

  if (statuses.includes("maintenance")) {
    return "maintenance"
  }

  return "booked"
}

export function AvailabilityCalendarSection() {
  const router = useRouter()
  const { messages } = useLanguage()
  const [payload, setPayload] = useState<AvailabilityResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedBoat, setSelectedBoat] = useState<BoatCategory | "all">("all")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  useEffect(() => {
    let cancelled = false

    const fetchAvailability = async () => {
      try {
        const response = await fetch("/api/booking/availability", {
          cache: "no-store",
        })
        const nextPayload = (await response.json()) as AvailabilityResponse

        if (!cancelled) {
          setPayload(nextPayload)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void fetchAvailability()
    const intervalId = window.setInterval(fetchAvailability, REFRESH_INTERVAL_MS)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [])

  const filteredAvailability = useMemo(() => {
    const source = payload?.availability ?? []

    if (selectedBoat === "all") {
      return source
    }

    return source.filter((entry) => entry.boatSlug === selectedBoat)
  }, [payload?.availability, selectedBoat])

  const statusMap = useMemo(() => {
    const map = new Map<string, AvailabilityStatus>()

    if (selectedBoat !== "all") {
      filteredAvailability.forEach((entry) => {
        map.set(entry.date, entry.status)
      })

      return map
    }

    const groupedByDate = new Map<string, AvailabilityStatus[]>()

    filteredAvailability.forEach((entry) => {
      const current = groupedByDate.get(entry.date) ?? []
      current.push(entry.status)
      groupedByDate.set(entry.date, current)
    })

    groupedByDate.forEach((statuses, date) => {
      map.set(date, getAggregatedStatus(statuses))
    })

    return map
  }, [filteredAvailability, selectedBoat])

  const boatMap = useMemo(
    () => new Map((payload?.boats ?? []).map((boat) => [boat.slug, boat])),
    [payload?.boats]
  )

  const selectedBoatForDate = useMemo<BookingBoatOption | null>(() => {
    if (!selectedDate || !payload) {
      return null
    }

    const dateKey = format(selectedDate, "yyyy-MM-dd")
    const matches = payload.availability.filter((entry) => entry.date === dateKey)

    if (selectedBoat !== "all") {
      const selected = matches.find(
        (entry) => entry.boatSlug === selectedBoat && entry.status !== "booked"
      )

      return selected ? boatMap.get(selected.boatSlug) ?? null : null
    }

    const bestMatch =
      matches.find((entry) => entry.status === "available") ??
      matches.find((entry) => entry.status === "limited") ??
      null

    return bestMatch ? boatMap.get(bestMatch.boatSlug) ?? null : null
  }, [boatMap, payload, selectedBoat, selectedDate])

  const availableDates = useMemo(
    () =>
      Array.from(statusMap.entries())
        .filter(([, status]) => status === "available")
        .map(([date]) => toDate(date)),
    [statusMap]
  )

  const limitedDates = useMemo(
    () =>
      Array.from(statusMap.entries())
        .filter(([, status]) => status === "limited")
        .map(([date]) => toDate(date)),
    [statusMap]
  )

  const bookedDates = useMemo(
    () =>
      Array.from(statusMap.entries())
        .filter(([, status]) => status === "booked")
        .map(([date]) => toDate(date)),
    [statusMap]
  )

  const handleDayClick = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd")
    const status = statusMap.get(dateKey)

    if (!status || status === "booked" || status === "maintenance") {
      return
    }

    setSelectedDate(day)
    window.dispatchEvent(
      new CustomEvent("gaff:booking-started", {
        detail: {
          date: dateKey,
          selectedBoat,
          status,
        },
      })
    )
  }

  return (
    <section id="availability" className="landing-section scroll-mt-24">
      <div className="landing-grid">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="section-kicker">{messages.availability.eyebrow}</p>
            <h2 className="section-title mt-5">{messages.availability.title}</h2>
            <p className="section-copy mt-5">{messages.availability.subtitle}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-gold/20 bg-white/4 text-white hover:bg-white/8"
            onClick={() => {
              setLoading(true)
              void fetch("/api/booking/availability", { cache: "no-store" })
                .then((response) => response.json())
                .then((nextPayload: AvailabilityResponse) => {
                  setPayload(nextPayload)
                })
                .finally(() => setLoading(false))
            }}
          >
            <CalendarSync className="size-4" />
            Refresh
          </Button>
        </div>

        <div className="availability-shell glass-panel overflow-hidden rounded-[2rem] border border-gold/10 p-6 sm:p-8">
          <div className="mb-6 flex flex-wrap gap-3">
            {messages.availability.filters.map((label) => {
              const key = label.toLowerCase()
              const value = key === "all" ? "all" : (key as BoatCategory)

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelectedBoat(value)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    selectedBoat === value
                      ? "border-gold bg-gold text-navy"
                      : "border-gold/16 bg-white/4 text-sand/78 hover:bg-white/8"
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onDayClick={handleDayClick}
                modifiers={{
                  available: availableDates,
                  limited: limitedDates,
                  booked: bookedDates,
                }}
                modifiersClassNames={{
                  available: "rdp-day-available",
                  limited: "rdp-day-limited",
                  booked: "rdp-day-booked",
                }}
                className="w-full rounded-[1.5rem] border border-gold/10 bg-white/2 p-4"
              />
            </div>

            <div className="flex flex-col gap-5 rounded-[1.5rem] border border-gold/10 bg-white/3 p-5">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-sand/72">
                  <LoaderCircle className="size-4 animate-spin" />
                  Syncing live availability…
                </div>
              ) : selectedDate ? (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold/76">
                      Your selection
                    </p>
                    <p className="mt-3 font-heading text-3xl text-white">
                      {format(selectedDate, "MMMM d")}
                    </p>
                    <p className="text-sm text-sand/56">{format(selectedDate, "EEEE · yyyy")}</p>
                  </div>

                  {selectedBoatForDate ? (
                    <>
                      <div className="space-y-3 rounded-[1.25rem] border border-gold/10 bg-white/4 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold/70">
                          Suggested boat
                        </p>
                        <div>
                          <p className="font-semibold text-white">{selectedBoatForDate.name}</p>
                          <p className="mt-0.5 text-xs text-sand/58">
                            Up to {selectedBoatForDate.capacity} guests ·{" "}
                            {selectedBoatForDate.category}
                          </p>
                        </div>
                        {(selectedBoatForDate.priceHalfDay ||
                          selectedBoatForDate.priceFullDay) && (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            {selectedBoatForDate.priceHalfDay && (
                              <div className="rounded-[0.875rem] border border-gold/10 bg-white/3 px-3 py-2 text-center">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-sand/54">
                                  Half Day
                                </p>
                                <p className="mt-1 text-sm font-semibold text-white">
                                  ${selectedBoatForDate.priceHalfDay}
                                </p>
                              </div>
                            )}
                            {selectedBoatForDate.priceFullDay && (
                              <div className="rounded-[0.875rem] border border-gold/10 bg-white/3 px-3 py-2 text-center">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-sand/54">
                                  Full Day
                                </p>
                                <p className="mt-1 text-sm font-semibold text-white">
                                  ${selectedBoatForDate.priceFullDay}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <Button
                        type="button"
                        className="w-full rounded-full bg-gold text-navy hover:bg-gold/90"
                        onClick={() => {
                          if (!selectedDate) {
                            return
                          }

                          const query = new URLSearchParams({
                            date: format(selectedDate, "yyyy-MM-dd"),
                          })

                          if (selectedBoatForDate) {
                            query.set("boat", selectedBoatForDate.slug)
                          } else if (selectedBoat !== "all") {
                            query.set("boat", selectedBoat)
                          }

                          router.push(`/booking?${query.toString()}`)
                        }}
                      >
                        {messages.availability.modalCta}
                        <ArrowRight className="size-4" />
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm leading-7 text-sand/62">
                      No boats available for this date with the current filter. Try another date or
                      change the boat category.
                    </p>
                  )}

                  <button
                    type="button"
                    className="text-center text-xs text-sand/48 transition hover:text-sand/80"
                    onClick={() => setSelectedDate(undefined)}
                  >
                    ← Choose a different date
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold/76">
                      Live status
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-sand/74">
                      <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-teal" />
                      {messages.availability.available}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-sand/74">
                      <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-gold" />
                      {messages.availability.limited}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-sand/74">
                      <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-coral" />
                      {messages.availability.booked}
                    </div>
                  </div>

                  <div className="border-t border-gold/10 pt-4">
                    <p className="font-heading text-3xl text-white">
                      {availableDates.filter((d) => d >= new Date()).length}
                    </p>
                    <p className="mt-1 text-xs text-sand/54">open dates available</p>
                  </div>

                  <p className="text-sm leading-7 text-sand/60">
                    Select a date on the calendar to see available boats and pricing.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
