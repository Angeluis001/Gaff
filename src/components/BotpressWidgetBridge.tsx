"use client"

import { useEffect, useRef } from "react"
import Script from "next/script"

declare global {
  interface Window {
    botpress?: {
      init?: (config: Record<string, unknown>) => void
      open?: () => void
      on?: (event: string, callback: () => void) => void
    }
  }
}

export function BotpressWidgetBridge() {
  const botId = process.env.NEXT_PUBLIC_BOTPRESS_BOT_ID
  const clientId = process.env.NEXT_PUBLIC_BOTPRESS_CLIENT_ID
  const pendingOpenRef = useRef(false)

  useEffect(() => {
    if (!botId || !clientId) {
      return
    }

    const handleOpen = () => {
      if (window.botpress?.open) {
        window.botpress.open()
        return
      }

      pendingOpenRef.current = true
    }

    window.addEventListener("gaff:open-chat", handleOpen)

    return () => {
      window.removeEventListener("gaff:open-chat", handleOpen)
    }
  }, [botId, clientId])

  const initializeBotpress = () => {
    if (!botId || !clientId || !window.botpress?.init) {
      return
    }

    window.botpress.on?.("webchat:initialized", () => {
      if (pendingOpenRef.current) {
        pendingOpenRef.current = false
        window.botpress?.open?.()
      }
    })

    window.botpress.init({
      botId,
      clientId,
      configuration: {
        themeMode: "dark",
        variant: "soft",
        fontFamily: "Plus Jakarta Sans",
      },
    })
  }

  if (!botId || !clientId) {
    return null
  }

  return (
    <>
      <Script
        id="botpress-webchat"
        src="https://cdn.botpress.cloud/webchat/v3.3/inject.js"
        strategy="afterInteractive"
        onLoad={initializeBotpress}
      />
      <Script
        id="botpress-config"
        strategy="afterInteractive"
      >{`window.botpress = window.botpress || {};`}</Script>
    </>
  )
}
