import type { BookingFormData } from "@/types/booking"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[+()\-\s0-9]{7,20}$/

export function normalizeTripDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)

  if (!year || !month || !day) {
    throw new Error("A valid trip date is required.")
  }

  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
}

export function validateBookingFormData(input: BookingFormData) {
  const tripDate = normalizeTripDate(input.date)
  const now = new Date()
  now.setUTCHours(0, 0, 0, 0)

  if (tripDate < now) {
    throw new Error("Trip date must be today or later.")
  }

  if (!input.boatId.trim()) {
    throw new Error("A boat selection is required.")
  }

  if (!["half_day", "full_day", "overnight"].includes(input.tripType)) {
    throw new Error("Trip type is invalid.")
  }

  if (!Number.isInteger(input.guestCount) || input.guestCount < 1 || input.guestCount > 12) {
    throw new Error("Guest count must be between 1 and 12.")
  }

  if (!input.firstName.trim()) {
    throw new Error("First name is required.")
  }

  if (!input.lastName.trim()) {
    throw new Error("Last name is required.")
  }

  if (!EMAIL_PATTERN.test(input.email.trim())) {
    throw new Error("Email address is invalid.")
  }

  if (!PHONE_PATTERN.test(input.phone.trim())) {
    throw new Error("Phone number is invalid.")
  }

  return {
    ...input,
    date: input.date,
    boatId: input.boatId.trim(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    specialRequests: input.specialRequests?.trim() || undefined,
    tripDate,
  }
}
