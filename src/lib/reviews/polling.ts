export type ReviewPlatform = "tripadvisor" | "google" | "yelp"

export type ReviewSnapshot = {
  platform: ReviewPlatform
  platformReviewId: string | null
  authorName: string | null
  rating: number | null
  content: string | null
  reviewDate: Date | null
  bookingId: string | null
  raw: Record<string, unknown>
}

const REVIEW_FEED_URLS: Record<ReviewPlatform, string | null> = {
  tripadvisor: process.env.TRIPADVISOR_REVIEWS_URL?.trim() || null,
  google: process.env.GOOGLE_REVIEWS_URL?.trim() || null,
  yelp: process.env.YELP_REVIEWS_URL?.trim() || null,
}

function toDate(value: unknown) {
  if (!value) {
    return null
  }

  const parsed = new Date(value as string | number | Date)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function toRating(value: unknown) {
  const rating = Number(value)
  return Number.isFinite(rating) ? rating : null
}

function buildFallbackReviewId(platform: ReviewPlatform, item: Record<string, unknown>) {
  const author = typeof item.authorName === "string" ? item.authorName : typeof item.author === "string" ? item.author : "unknown"
  const date =
    typeof item.reviewDate === "string" || typeof item.reviewDate === "number"
      ? String(item.reviewDate)
      : typeof item.date === "string" || typeof item.date === "number"
        ? String(item.date)
        : typeof item.createdAt === "string" || typeof item.createdAt === "number"
          ? String(item.createdAt)
          : "undated"
  const content = typeof item.content === "string" ? item.content : typeof item.text === "string" ? item.text : ""

  return `${platform}:${author}:${date}:${content.slice(0, 48)}`
}

function normalizeSnapshot(platform: ReviewPlatform, item: Record<string, unknown>): ReviewSnapshot {
  return {
    platform,
    platformReviewId:
      typeof item.platformReviewId === "string"
        ? item.platformReviewId
        : typeof item.id === "string"
          ? item.id
          : typeof item.reviewId === "string"
            ? item.reviewId
            : buildFallbackReviewId(platform, item),
    authorName:
      typeof item.authorName === "string"
        ? item.authorName
        : typeof item.author === "string"
          ? item.author
          : null,
    rating: toRating(item.rating ?? item.stars),
    content:
      typeof item.content === "string"
        ? item.content
        : typeof item.text === "string"
          ? item.text
          : null,
    reviewDate: toDate(item.reviewDate ?? item.date ?? item.createdAt),
    bookingId: typeof item.bookingId === "string" ? item.bookingId : null,
    raw: item,
  }
}

async function fetchFeed(platform: ReviewPlatform): Promise<ReviewSnapshot[]> {
  const url = REVIEW_FEED_URLS[platform]

  if (!url) {
    return []
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Review feed for ${platform} returned ${response.status}.`)
  }

  const payload = (await response.json()) as
    | Array<Record<string, unknown>>
    | { reviews?: Array<Record<string, unknown>> }
    | Record<string, unknown>

  const items = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { reviews?: Array<Record<string, unknown>> }).reviews)
      ? (payload as { reviews?: Array<Record<string, unknown>> }).reviews ?? []
      : [payload as Record<string, unknown>]

  return items.map((item) => normalizeSnapshot(platform, item))
}

export async function pollReviewFeeds(): Promise<ReviewSnapshot[]> {
  const feeds = await Promise.all(
    (["tripadvisor", "google", "yelp"] as ReviewPlatform[]).map((platform) => fetchFeed(platform))
  )

  return feeds.flat()
}
