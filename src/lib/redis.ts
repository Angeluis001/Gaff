import { Redis } from "@upstash/redis"

const hasRedisConfig = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
)

// Booking APIs should compile cleanly before Redis is configured in every environment.
export const redis = hasRedisConfig ? Redis.fromEnv() : null
