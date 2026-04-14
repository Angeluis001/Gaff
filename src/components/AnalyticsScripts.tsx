"use client"

import { useEffect } from "react"
import Script from "next/script"
import { GoogleAnalytics } from "@next/third-parties/google"

import { trackBookingStarted, trackPageView } from "@/lib/analytics"

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    ttq?: {
      track: (event: string, payload?: Record<string, unknown>) => void
      page: () => void
    }
  }
}

export function AnalyticsScripts() {
  const gaId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ??
    process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const tikTokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID

  useEffect(() => {
    trackPageView()

    const handleBookingStarted = (event: Event) => {
      const detail = (event as CustomEvent).detail as {
        date: string
        selectedBoat: string
        status: string
      }

      trackBookingStarted(detail)
    }

    window.addEventListener("gaff:booking-started", handleBookingStarted)

    return () => {
      window.removeEventListener("gaff:booking-started", handleBookingStarted)
    }
  }, [])

  return (
    <>
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}

      {metaPixelId ? (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        </>
      ) : null}

      {tikTokPixelId ? (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            window.ttq = window.ttq || {
              page: function(){},
              track: function(){}
            };
            window.ttq.track('PageView');
          `}
        </Script>
      ) : null}
    </>
  )
}
