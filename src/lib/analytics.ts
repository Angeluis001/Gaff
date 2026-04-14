"use client"

declare global {
  interface Window {
    dataLayer?: unknown[]
    fbq?: (...args: unknown[]) => void
    ttq?: {
      track: (event: string, payload?: Record<string, unknown>) => void
      page: () => void
    }
    gtag?: (...args: unknown[]) => void
  }
}

type BookingStartedPayload = {
  date: string
  selectedBoat: string
  status: string
}

type BookingCompletedPayload = {
  bookingId: string
  sessionId: string
}

export function trackPageView() {
  window.gtag?.("event", "page_view", {
    page_path: window.location.pathname,
    page_title: document.title,
  })

  window.fbq?.("track", "PageView")
  window.ttq?.page()
}

export function trackBookingStarted(payload: BookingStartedPayload) {
  window.gtag?.("event", "booking_started", payload)
  window.fbq?.("trackCustom", "booking_started", payload)
  window.ttq?.track("booking_started", payload)
}

export function trackBookingCompleted(payload: BookingCompletedPayload) {
  window.gtag?.("event", "booking_completed", payload)
  window.fbq?.("trackCustom", "booking_completed", payload)
  window.ttq?.track("booking_completed", payload)
}

// Phase 3 TODO: implement lead_captured after the real booking form exists.
