import { pgTable, text, timestamp, integer, uuid } from 'drizzle-orm/pg-core';
import { bookings } from './bookings';

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  platform: text('platform').notNull(), // tripadvisor, google, yelp
  platformReviewId: text('platform_review_id'),
  authorName: text('author_name'),
  rating: integer('rating'),
  content: text('content'),
  responseContent: text('response_content'),
  responseStatus: text('response_status').default('pending'), // pending, approved, published
  bookingId: uuid('booking_id').references(() => bookings.id),
  reviewDate: timestamp('review_date'),
  createdAt: timestamp('created_at').defaultNow(),
});
