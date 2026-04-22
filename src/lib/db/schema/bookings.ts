import { pgTable, text, timestamp, integer, decimal, uuid, jsonb } from 'drizzle-orm/pg-core';
import { bookingStatusEnum, tripTypeEnum } from './enums';
import { boats } from './boats';
import { clients } from './clients';
import { leads } from './leads';

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').references(() => clients.id),
  leadId: uuid('lead_id').references(() => leads.id),
  boatId: uuid('boat_id').references(() => boats.id).notNull(),
  date: timestamp('date').notNull(),
  tripType: tripTypeEnum('trip_type').notNull(),
  guests: integer('guests').notNull(),
  status: bookingStatusEnum('status').default('pending'),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  depositAmount: decimal('deposit_amount', { precision: 10, scale: 2 }),
  depositPaidAt: timestamp('deposit_paid_at'),
  balanceDueAmount: decimal('balance_due_amount', { precision: 10, scale: 2 }),
  balancePaidAt: timestamp('balance_paid_at'),
  stripeSessionId: text('stripe_session_id'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  specialRequests: text('special_requests'),
  internalNotes: text('internal_notes'),
  cancellationReason: text('cancellation_reason'),
  fishCaught: jsonb('fish_caught').$type<{ species: string; weight?: string; released: boolean }[]>(),
  reminderSentAt: timestamp('reminder_sent_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
