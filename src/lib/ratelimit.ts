import { Ratelimit } from "@upstash/ratelimit"
import { redis } from "./redis"

const hasRedisConfig = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
)

// Booking routes should stay usable in local/dev even before Upstash is configured.
export const ratelimit = hasRedisConfig
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
      prefix: "gaff:ratelimit",
    })
  : null
