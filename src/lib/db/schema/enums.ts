import { pgEnum } from 'drizzle-orm/pg-core';

export const leadStatusEnum = pgEnum('lead_status', [
  'new', 'contacted', 'qualified', 'proposal_sent',
  'booked', 'completed', 'lost', 'nurture',
]);

export const leadSourceEnum = pgEnum('lead_source', [
  'website', 'whatsapp', 'instagram', 'facebook',
  'tiktok', 'tripadvisor', 'referral', 'google', 'other',
]);

export const leadClassificationEnum = pgEnum('lead_classification', [
  'hot', 'warm', 'cold',
]);

export const bookingStatusEnum = pgEnum('booking_status', [
  'pending', 'deposit_paid', 'confirmed', 'in_progress',
  'completed', 'cancelled', 'refunded', 'no_show',
]);

export const boatCategoryEnum = pgEnum('boat_category', [
  'standard', 'midsize', 'large', 'luxury',
]);

export const tripTypeEnum = pgEnum('trip_type', [
  'half_day', 'full_day', 'overnight',
]);

export const availabilityStatusEnum = pgEnum('availability_status', [
  'available', 'booked', 'maintenance', 'blocked',
]);
