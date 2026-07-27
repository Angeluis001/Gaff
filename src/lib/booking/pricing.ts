import type { TripType } from "@/types/boat"

import type { BookingBoatOption } from "@/types/booking"

function toNumber(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function getBoatPrice(boat: BookingBoatOption, tripType: TripType) {
  const halfDayPrice = toNumber(boat.priceHalfDay)
  const fullDayPrice = toNumber(boat.priceFullDay)

  if (tripType === "half_day" && halfDayPrice) {
    return halfDayPrice
  }

  if (tripType === "full_day" && fullDayPrice) {
    return fullDayPrice
  }

  if (tripType === "overnight") {
    throw new Error("Overnight trips are not available for online booking.")
  }

  if (fullDayPrice) {
    return fullDayPrice
  }

  if (halfDayPrice) {
    return halfDayPrice
  }

  throw new Error(`Boat ${boat.name} does not have pricing configured.`)
}

export function calculateDepositAmount(totalPrice: number) {
  return Number((totalPrice * 0.5).toFixed(2))
}

export function formatUsdAmount(value: number) {
  return value.toFixed(2)
}
