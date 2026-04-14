"use client"

import { useEffect } from "react"

export function BookingConfirmationTracker({
  bookingId,
  sessionId,
}: {
  bookingId: string
  sessionId: string
}) {
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("gaff:booking-completed", {
        detail: {
          bookingId,
          sessionId,
        },
      })
    )
  }, [bookingId, sessionId])

  return null
}
