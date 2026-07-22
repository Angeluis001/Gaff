import type { BoatCategory, TripType } from "./boat"

export type BookingStatus =
  | "pending"
  | "deposit_paid"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "refunded"
  | "no_show"

export type BookingAvailabilityStatus =
  | "available"
  | "limited"
  | "booked"
  | "maintenance"

export interface BookingFormData {
  date: string
  boatId: string
  tripType: TripType
  guestCount: number
  firstName: string
  lastName: string
  email: string
  phone: string
  specialRequests?: string
}

export interface Booking {
  id: string
  leadId?: string
  boatId: string
  tripDate: Date
  tripType: TripType
  guestCount: number
  status: BookingStatus
  depositAmount?: string
  totalAmount?: string
  stripeSessionId?: string
  stripePaymentIntentId?: string
  specialRequests?: string
  createdAt: Date
  updatedAt: Date
}

export interface BookingBoatOption {
  id: string
  slug: string
  name: string
  category: BoatCategory
  capacity: number
  length?: string | null
  description?: string | null
  image?: string | null
  priceHalfDay?: string | null
  priceFullDay?: string | null
  stripeProductHalfDayId?: string | null
  stripeProductFullDayId?: string | null
  stripePriceHalfDayId?: string | null
  stripePriceFullDayId?: string | null
  stripeDepositPriceHalfDayId?: string | null
  stripeDepositPriceFullDayId?: string | null
}

export interface BookingAvailabilityEntry {
  date: string
  boatId: string
  boatSlug: string
  status: BookingAvailabilityStatus
}

export interface BookingAvailabilityResponse {
  updatedAt: string
  boats: BookingBoatOption[]
  availability: BookingAvailabilityEntry[]
}

export interface PendingBookingResponse {
  bookingId: string
  leadId: string
  totalPrice: string
  depositAmount: string
  boatId: string
  tripType: TripType
  date: string
}
