"use client"

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { ArrowLeft, ArrowRight, Check, LoaderCircle, ShieldCheck } from "lucide-react"

import { BoatSelector } from "@/components/booking/BoatSelector"
import { DatePicker } from "@/components/booking/DatePicker"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import {
  calculateDepositAmount,
  formatUsdAmount,
  getBoatPrice,
} from "@/lib/booking/pricing"
import { cn } from "@/lib/utils"
import type { TripType } from "@/types/boat"
import type {
  BookingAvailabilityResponse,
  BookingFormData,
  PendingBookingResponse,
} from "@/types/booking"

const TOTAL_STEPS = 3

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

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDisplayDate(value: string, lang: "en" | "es") {
  if (!value) {
    return "—"
  }

  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function BookingForm({ initialDate, initialBoat }: BookingFormProps) {
  const { messages, lang } = useLanguage()
  const t = messages.booking

  const [availability, setAvailability] = useState<BookingAvailabilityResponse | null>(null)
  const [form, setForm] = useState<BookingFormData>({
    ...initialForm,
    date: initialDate ?? "",
    boatId: "",
  })
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resolvedInitialBoat, setResolvedInitialBoat] = useState(false)
  const hasAutoStepped = useRef(false)

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
  }, [])

  // Resolve initial boat slug/id once availability loads
  useEffect(() => {
    if (!availability || resolvedInitialBoat || !initialBoat) {
      return
    }

    const matchingBoat = availability.boats.find(
      (boat) => boat.id === initialBoat || boat.slug === initialBoat
    )

    if (matchingBoat) {
      setForm((current) => ({ ...current, boatId: matchingBoat.id }))
    }

    setResolvedInitialBoat(true)
  }, [availability, initialBoat, resolvedInitialBoat])

  // If date prefilled, jump closer to checkout once
  useEffect(() => {
    if (!availability || !initialDate || hasAutoStepped.current) {
      return
    }

    hasAutoStepped.current = true

    if (!initialBoat) {
      setStep(2)
      return
    }

    const matchingBoat = availability.boats.find(
      (boat) => boat.id === initialBoat || boat.slug === initialBoat
    )
    const boatAvailable = matchingBoat
      ? availability.availability.some(
          (entry) =>
            entry.boatId === matchingBoat.id &&
            entry.date === initialDate &&
            (entry.status === "available" || entry.status === "limited")
        )
      : false

    setStep(boatAvailable ? 3 : 2)
  }, [availability, initialBoat, initialDate])

  const selectedBoat = useMemo(
    () => availability?.boats.find((boat) => boat.id === form.boatId) ?? null,
    [availability?.boats, form.boatId]
  )

  const availableBoatsForDate = useMemo(() => {
    if (!availability || !form.date) {
      return []
    }

    const freeBoatIds = new Set(
      availability.availability
        .filter(
          (entry) =>
            entry.date === form.date &&
            (entry.status === "available" || entry.status === "limited")
        )
        .map((entry) => entry.boatId)
    )

    return availability.boats.filter(
      (boat) => freeBoatIds.has(boat.id) && boat.capacity >= form.guestCount
    )
  }, [availability, form.date, form.guestCount])

  const pricing = useMemo(() => {
    if (!selectedBoat) {
      return null
    }

    try {
      const total = getBoatPrice(selectedBoat, form.tripType)
      const deposit = calculateDepositAmount(total)
      return {
        total,
        deposit,
        balance: total - deposit,
        totalLabel: formatMoney(total),
        depositLabel: formatMoney(deposit),
        balanceLabel: formatMoney(total - deposit),
      }
    } catch {
      return null
    }
  }, [form.tripType, selectedBoat])

  const tripOptions = ["half_day", "full_day"] as const

  function tripTypeLabel(tripType: TripType) {
    if (tripType === "half_day" || tripType === "full_day") {
      return t.tripTypes[tripType]
    }
    return tripType.replace("_", " ")
  }

  const stepLabels = [t.steps.trip, t.steps.boat, t.steps.details]

  function canContinueFromStep1() {
    return Boolean(form.date) && form.guestCount >= 1
  }

  function canContinueFromStep2() {
    return Boolean(form.boatId) && availableBoatsForDate.some((boat) => boat.id === form.boatId)
  }

  function goNext() {
    setError(null)

    if (step === 1) {
      if (!canContinueFromStep1()) {
        setError(
          lang === "es"
            ? "Selecciona una fecha y el número de invitados."
            : "Select a date and guest count to continue."
        )
        return
      }

      // Clear boat if no longer available for the new filters
      if (
        form.boatId &&
        !availableBoatsForDate.some((boat) => boat.id === form.boatId)
      ) {
        setForm((current) => ({ ...current, boatId: "" }))
      }

      setStep(2)
      return
    }

    if (step === 2) {
      if (!canContinueFromStep2()) {
        setError(
          lang === "es"
            ? "Elige un barco disponible para continuar."
            : "Choose an available boat to continue."
        )
        return
      }
      setStep(3)
    }
  }

  function goBack() {
    setError(null)
    setStep((current) => Math.max(1, current - 1))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      if (selectedBoat && form.guestCount > selectedBoat.capacity) {
        throw new Error(
          lang === "es"
            ? `Este barco admite hasta ${selectedBoat.capacity} personas.`
            : `This boat holds up to ${selectedBoat.capacity} guests.`
        )
      }

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
        throw new Error(payload.error ?? "Unable to create the booking.")
      }

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
            (lang === "es"
              ? "La reserva se creó, pero no se pudo iniciar el pago."
              : "Booking created, but checkout could not be started.")
        )
      }

      window.location.assign(checkoutPayload.url)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to create booking.")
    } finally {
      setSubmitting(false)
    }
  }

  const inputClassName =
    "w-full rounded-xl border border-gold/14 bg-navy/60 px-4 py-3 text-white outline-none ring-0 transition focus:border-gold"

  return (
    <div className="booking-form-shell glass-panel mx-auto max-w-6xl rounded-[2rem] border border-gold/10 px-5 py-7 sm:px-8 sm:py-8">
      {/* Header */}
      <div className="mb-8 max-w-2xl">
        <p className="section-kicker">{t.eyebrow}</p>
        <h1 className="section-title mt-3">{t.title}</h1>
        <p className="section-copy mt-3">{t.subtitle}</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-gold/70">
          {t.stepOf
            .replace("{current}", String(step))
            .replace("{total}", String(TOTAL_STEPS))}
        </p>
        <ol className="grid grid-cols-3 gap-2">
          {stepLabels.map((label, index) => {
            const stepNumber = index + 1
            const active = step === stepNumber
            const complete = step > stepNumber

            return (
              <li key={label}>
                <button
                  type="button"
                  disabled={stepNumber > step}
                  onClick={() => {
                    if (stepNumber < step) {
                      setError(null)
                      setStep(stepNumber)
                    }
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-full border px-3 py-2 text-left text-sm transition",
                    active && "border-gold bg-gold text-navy",
                    complete && "border-teal/40 bg-teal/15 text-white",
                    !active && !complete && "border-gold/12 bg-white/3 text-sand/55"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      active && "bg-navy text-gold",
                      complete && "bg-teal text-navy",
                      !active && !complete && "bg-white/8 text-sand/60"
                    )}
                  >
                    {complete ? <Check className="size-3.5" strokeWidth={3} /> : stepNumber}
                  </span>
                  <span className="hidden font-semibold sm:inline">{label}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 rounded-[1.5rem] border border-gold/10 bg-white/3 px-5 py-10 text-sand/72">
          <LoaderCircle className="size-5 animate-spin text-gold" />
          {t.loading}
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="min-w-0">
            {/* Step 1: Trip */}
            {step === 1 ? (
              <div className="space-y-7">
                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-gold/72">
                    {t.dateLabel}
                  </p>
                  {availability ? (
                    <DatePicker
                      availability={availability.availability}
                      anyBoat
                      value={form.date}
                      onChange={(date) => setForm((current) => ({ ...current, date }))}
                      legend={t.calendarLegend}
                    />
                  ) : null}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-sand/78">{t.guestsLabel}</span>
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
                      className={inputClassName}
                    />
                  </label>

                  <div className="space-y-2">
                    <span className="text-sm text-sand/78">{t.tripTypeLabel}</span>
                    <div className="grid gap-2">
                      {tripOptions.map((option) => {
                        const selected = form.tripType === option
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              setForm((current) => ({ ...current, tripType: option }))
                            }
                            className={cn(
                              "rounded-xl border px-3 py-2.5 text-left transition",
                              selected
                                ? "border-gold bg-gold text-navy"
                                : "border-gold/14 bg-white/3 text-sand/80 hover:bg-white/6"
                            )}
                          >
                            <p className="text-sm font-semibold">{t.tripTypes[option]}</p>
                            <p
                              className={cn(
                                "mt-0.5 text-xs",
                                selected ? "text-navy/70" : "text-sand/55"
                              )}
                            >
                              {t.tripTypeHints[option]}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Step 2: Boat */}
            {step === 2 ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold/72">
                      {t.chooseBoat}
                    </p>
                    <p className="mt-2 text-sm text-sand/62">
                      {formatDisplayDate(form.date, lang)} · {form.guestCount} {t.guests} ·{" "}
                      {tripTypeLabel(form.tripType)}
                    </p>
                  </div>
                </div>

                <BoatSelector
                  boats={availableBoatsForDate}
                  selectedBoatId={form.boatId}
                  tripType={form.tripType}
                  onSelect={(boatId) => setForm((current) => ({ ...current, boatId }))}
                  capacityLabel={(count) => t.capacityLabel.replace("{count}", String(count))}
                  emptyMessage={t.noBoats}
                  depositLabel={t.depositLabel}
                />
              </div>
            ) : null}

            {/* Step 3: Details */}
            {step === 3 ? (
              <form id="booking-details-form" className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-sand/78">{t.firstName}</span>
                    <input
                      required
                      value={form.firstName}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, firstName: event.target.value }))
                      }
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-sand/78">{t.lastName}</span>
                    <input
                      required
                      value={form.lastName}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, lastName: event.target.value }))
                      }
                      className={inputClassName}
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-sand/78">{t.email}</span>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, email: event.target.value }))
                      }
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-sand/78">{t.phone}</span>
                    <input
                      required
                      value={form.phone}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, phone: event.target.value }))
                      }
                      className={inputClassName}
                      placeholder="+1 555 000 0000"
                    />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm text-sand/78">{t.specialRequests}</span>
                  <textarea
                    rows={4}
                    value={form.specialRequests}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        specialRequests: event.target.value,
                      }))
                    }
                    placeholder={t.specialRequestsPlaceholder}
                    className={inputClassName}
                  />
                </label>
              </form>
            ) : null}

            {error ? (
              <div className="mt-6 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-white">
                {error}
              </div>
            ) : null}

            {/* Step navigation (1 & 2) */}
            {step < 3 ? (
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    className="h-12 rounded-full border-gold/20 bg-white/4 px-6 text-white hover:bg-white/8"
                  >
                    <ArrowLeft className="size-4" />
                    {t.back}
                  </Button>
                ) : (
                  <span />
                )}
                <Button
                  type="button"
                  onClick={goNext}
                  className="h-12 rounded-full bg-gold px-8 text-navy hover:bg-gold/92"
                >
                  {t.continue}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  className="h-12 rounded-full border-gold/20 bg-white/4 px-6 text-white hover:bg-white/8"
                >
                  <ArrowLeft className="size-4" />
                  {t.back}
                </Button>
                <Button
                  type="submit"
                  form="booking-details-form"
                  disabled={submitting || !form.boatId || !form.date}
                  className="h-12 rounded-full bg-gold px-6 text-navy hover:bg-gold/92 sm:min-w-[16rem]"
                >
                  {submitting ? t.payingCta : t.payCta}
                  {!submitting ? <ArrowRight className="size-4" /> : null}
                </Button>
              </div>
            )}
          </div>

          {/* Sticky summary */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[1.75rem] border border-gold/12 bg-white/3 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold/74">
                {t.summaryTitle}
              </p>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-sand/60">{t.selectedDate}</dt>
                  <dd className="text-right font-medium text-white">
                    {form.date ? formatDisplayDate(form.date, lang) : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-sand/60">{t.tripTypeLabel}</dt>
                  <dd className="text-right font-medium text-white">
                    {tripTypeLabel(form.tripType)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-sand/60">{t.guestsLabel}</dt>
                  <dd className="text-right font-medium text-white">
                    {form.guestCount} {t.guests}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-sand/60">{t.selectedBoat}</dt>
                  <dd className="text-right font-medium text-white">
                    {selectedBoat?.name ?? "—"}
                  </dd>
                </div>
              </dl>

              <div className="my-5 border-t border-gold/10" />

              {pricing ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-sand/60">{t.totalLabel}</span>
                    <span className="font-semibold text-white">{pricing.totalLabel}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-sand/60">{t.depositLabel}</span>
                    <span className="text-lg font-semibold text-gold">{pricing.depositLabel}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-sand/60">{t.balanceLabel}</span>
                    <span className="font-medium text-white">{pricing.balanceLabel}</span>
                  </div>
                  <p className="pt-1 text-xs leading-5 text-sand/55">{t.depositNote}</p>
                </div>
              ) : (
                <p className="text-sm leading-6 text-sand/55">
                  {lang === "es"
                    ? "Elige fecha, tipo de viaje y barco para ver el total y el depósito."
                    : "Pick a date, trip length, and boat to see total and deposit."}
                </p>
              )}

              <div className="mt-6 flex items-start gap-2 rounded-[1rem] border border-teal/20 bg-teal/10 px-3 py-3 text-xs leading-5 text-sand/78">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal" />
                <span>{t.trustLine}</span>
              </div>

              {pricing && process.env.NODE_ENV === "development" ? (
                <p className="mt-3 hidden text-[10px] text-sand/30">
                  {formatUsdAmount(pricing.total)}
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
