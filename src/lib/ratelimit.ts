import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';

// Default rate limit: 10 requests per 10 seconds per IP
// Apply this limiter in Phase 3+ booking and lead API routes
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: 'gaff:ratelimit',
});
