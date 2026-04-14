"use client"

import { useEffect } from "react"
import Script from "next/script"

declare global {
  interface Window {
    botpress?: {
      init?: (config: Record<string, unknown>) => void
      open?: () => void
    }
  }
}

export function BotpressWidgetBridge() {
  const botId = process.env.NEXT_PUBLIC_BOTPRESS_BOT_ID
  const clientId = process.env.NEXT_PUBLIC_BOTPRESS_CLIENT_ID

  useEffect(() => {
    if (!botId || !clientId) {
      return
    }

    const handleOpen = () => {
      window.botpress?.open?.()
    }

    window.addEventListener("gaff:open-chat", handleOpen)

    return () => {
      window.removeEventListener("gaff:open-chat", handleOpen)
    }
  }, [botId, clientId])

  if (!botId || !clientId) {
    return null
  }

  return (
    <>
      <Script
        id="botpress-webchat"
        src="https://cdn.botpress.cloud/webchat/v3.2/inject.js"
        strategy="afterInteractive"
        onLoad={() => {
          window.botpress?.init?.({
            botId,
            clientId,
          })
        }}
      />
      <Script
        id="botpress-config"
        strategy="afterInteractive"
      >{`window.botpress = window.botpress || {};`}</Script>
    </>
  )
}
