import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';

export const marketingPosts = pgTable('marketing_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  platform: text('platform').notNull(), // instagram, tiktok, facebook
  content: text('content').notNull(),
  mediaUrls: jsonb('media_urls').$type<string[]>(),
  hashtags: jsonb('hashtags').$type<string[]>(),
  status: text('status').default('draft'), // draft, scheduled, published, failed
  scheduledAt: timestamp('scheduled_at'),
  publishedAt: timestamp('published_at'),
  platformPostId: text('platform_post_id'),
  engagement: jsonb('engagement').$type<{
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  }>(),
  createdAt: timestamp('created_at').defaultNow(),
});
