"use client"

import { usePathname } from "next/navigation"

import { ChatWidget } from "@/components/landing/ChatWidget"
import { WhatsAppButton } from "@/components/landing/WhatsAppButton"

export function PublicWidgets() {
  const pathname = usePathname()

  if (pathname.startsWith("/admin")) return null

  return (
    <>
      <WhatsAppButton />
      <ChatWidget />
    </>
  )
}
