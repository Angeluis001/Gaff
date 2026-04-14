"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { BoatSelector } from "@/components/booking/BoatSelector"
import { DatePicker } from "@/components/booking/DatePicker"
import type {
  BookingAvailabilityResponse,
  BookingFormData,
  PendingBookingResponse,
} from "@/types/booking"
import type { TripType } from "@/types/boat"

const initialForm: BookingFormData = {
  date: "",
  boatId: "",
  tripType: "half_day",
  guestCount: 4,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  specialRequests: "",
}

type BookingFormProps = {
  initialDate?: string
  initialBoat?: string
}

export function BookingForm({ initialDate, initialBoat }: BookingFormProps) {
  const [availability, setAvailability] = useState<BookingAvailabilityResponse | null>(null)
  const [form, setForm] = useState<BookingFormData>({
    ...initialForm,
    date: initialDate ?? "",
    boatId: initialBoat ?? "",
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookingPreview, setBookingPreview] = useState<PendingBookingResponse | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadAvailability() {
      try {
        const response = await fetch("/api/booking/availability", { cache: "no-store" })
        const payload = (await response.json()) as BookingAvailabilityResponse & {
          error?: string
        }

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load booking availability.")
        }

        if (!cancelled) {
          setAvailability(payload)

          if (!form.boatId && payload.boats[0]) {
            setForm((current) => ({ ...current, boatId: payload.boats[0].id }))
          }

          if (initialBoat) {
            const matchingBoat = payload.boats.find(
              (boat) => boat.id === initialBoat || boat.slug === initialBoat
            )

            if (matchingBoat) {
              setForm((current) => ({ ...current, boatId: matchingBoat.id }))
            }
          }
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : "Unable to load booking.")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadAvailability()

    return () => {
      cancelled = true
    }
  }, [form.boatId, initialBoat])

  const selectedBoat = useMemo(
    () => availability?.boats.find((boat) => boat.id === form.boatId) ?? null,
    [availability?.boats, form.boatId]
  )

  const tripOptions: { value: TripType; label: string }[] = [
    { value: "half_day", label: "Half day" },
    { value: "full_day", label: "Full day" },
    { value: "overnight", label: "Overnight" },
  ]

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const payload = (await response.json()) as PendingBookingResponse & {
        error?: string
      }

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to create the pending booking.")
      }

      setBookingPreview(payload)
      const checkoutResponse = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: payload.bookingId,
        }),
      })

      const checkoutPayload = (await checkoutResponse.json()) as {
        url?: string
        error?: string
      }

      if (!checkoutResponse.ok || !checkoutPayload.url) {
        throw new Error(
          checkoutPayload.error ??
            "Pending booking created, but Stripe checkout could not be started."
        )
      }

      window.location.assign(checkoutPayload.url)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to create booking.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="glass-panel mx-auto max-w-6xl rounded-[2rem] border border-gold/10 px-6 py-8 sm:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="section-kicker">Phase 3 booking</p>
          <h1 className="section-title mt-4">Reserve your trip with a real booking flow</h1>
          <p className="section-copy mt-4">
            Pick your boat, choose a date, and create the pending reservation that Stripe
            checkout will use for the 50% deposit.
          </p>

          <div className="mt-8 space-y-6">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-gold/72">
                Boat
              </p>
              {availability ? (
                <BoatSelector
                  boats={availability.boats}
                  selectedBoatId={form.boatId}
                  onSelect={(boatId) => setForm((current) => ({ ...current, boatId }))}
                />
              ) : null}
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-gold/72">
                Date
              </p>
              {availability ? (
                <DatePicker
                  availability={availability.availability}
                  selectedBoatId={form.boatId}
                  value={form.date}
                  onChange={(date) => setForm((current) => ({ ...current, date }))}
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-gold/10 bg-white/3 p-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-sand/78">First name</span>
                <input
                  required
                  value={form.firstName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, firstName: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gold/14 bg-navy/60 px-4 py-3 text-white outline-none ring-0 transition focus:border-gold"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-sand/78">Last name</span>
                <input
                  required
                  value={form.lastName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, lastName: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gold/14 bg-navy/60 px-4 py-3 text-white outline-none ring-0 transition focus:border-gold"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-sand/78">Email</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gold/14 bg-navy/60 px-4 py-3 text-white outline-none ring-0 transition focus:border-gold"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-sand/78">Phone</span>
                <input
                  required
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gold/14 bg-navy/60 px-4 py-3 text-white outline-none ring-0 transition focus:border-gold"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-sand/78">Trip type</span>
                <select
                  value={form.tripType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      tripType: event.target.value as TripType,
                    }))
                  }
                  className="w-full rounded-xl border border-gold/14 bg-navy/60 px-4 py-3 text-white outline-none transition focus:border-gold"
                >
                  {tripOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm text-sand/78">Guests</span>
                <input
                  required
                  min={1}
                  max={12}
                  type="number"
                  value={form.guestCount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      guestCount: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-gold/14 bg-navy/60 px-4 py-3 text-white outline-none ring-0 transition focus:border-gold"
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm text-sand/78">Special requests</span>
              <textarea
                rows={4}
                value={form.specialRequests}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    specialRequests: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-gold/14 bg-navy/60 px-4 py-3 text-white outline-none ring-0 transition focus:border-gold"
              />
            </label>

            <div className="rounded-[1.25rem] border border-gold/12 bg-navy/55 p-4 text-sm text-sand/76">
              <p>
                <span className="font-semibold text-white">Selected boat:</span>{" "}
                {selectedBoat?.name ?? "Choose a boat"}
              </p>
              <p>
                <span className="font-semibold text-white">Selected date:</span>{" "}
                {form.date || "Choose a date"}
              </p>
              {bookingPreview ? (
                <>
                  <p>
                    <span className="font-semibold text-white">Pending booking:</span>{" "}
                    {bookingPreview.bookingId}
                  </p>
                  <p>
                    <span className="font-semibold text-white">Deposit preview:</span> $
                    {bookingPreview.depositAmount}
                  </p>
                </>
              ) : null}
            </div>

            {error ? (
              <div className="rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-white">
                {error}
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={loading || submitting || !form.date || !form.boatId}
              className="h-12 w-full rounded-full bg-gold text-navy hover:bg-gold/92"
            >
              {submitting ? "Creating pending booking..." : "Create pending booking"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
