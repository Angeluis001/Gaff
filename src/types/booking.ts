import type { TripType } from './boat';

export type BookingStatus =
  | 'pending'
  | 'deposit_paid'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'no_show';

export interface BookingFormData {
  date: string;               // ISO date string YYYY-MM-DD
  boatId: string;
  tripType: TripType;
  guestCount: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export interface Booking {
  id: string;
  leadId?: string;
  boatId: string;
  tripDate: Date;
  tripType: TripType;
  guestCount: number;
  status: BookingStatus;
  depositAmount?: string;
  totalAmount?: string;
  stripeSessionId?: string;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}
