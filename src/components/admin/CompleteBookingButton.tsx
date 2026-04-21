"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type CompleteBookingButtonProps = {
  bookingId: string
}

export function CompleteBookingButton({ bookingId }: CompleteBookingButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleClick() {
    setIsLoading(true)

    try {
      await fetch(`/api/admin/bookings/${bookingId}/complete`, {
        method: "POST",
      })
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={handleClick}
      className="rounded-xl border border-amber-300/30 bg-amber-500/15 px-4 py-2 text-sm text-amber-100 transition hover:bg-amber-500/25 disabled:opacity-60"
    >
      {isLoading ? "Completing..." : "Mark completed"}
    </button>
  )
}

