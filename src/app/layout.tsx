import type { Metadata } from "next"
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google"

import { AnalyticsScripts } from "@/components/AnalyticsScripts"
import { BotpressWidgetBridge } from "@/components/BotpressWidgetBridge"
import { SmoothScroll } from "@/components/SmoothScroll"
import { LanguageProvider } from "@/contexts/LanguageContext"
import {
  BUSINESS_ADDRESS,
  BUSINESS_COORDINATES,
  CONTACT_PHONE,
  SITE_NAME,
  SITE_URL,
  SOCIAL_LINKS,
} from "@/lib/constants"

import "./globals.css"

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
})

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Sport Fishing Charters in Cabo San Lucas`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Book premium sport fishing charters in Cabo San Lucas with elite captains, luxury boats, real-time availability, and conservation-minded experiences.",
  keywords: [
    "cabo san lucas fishing",
    "sport fishing los cabos",
    "deep sea fishing cabo",
    "cabo fishing charters",
    "marlin fishing cabo san lucas",
    "los cabos fishing boats",
  ],
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-US": SITE_URL,
      "es-MX": `${SITE_URL}?lang=es`,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Sport Fishing Charters in Cabo San Lucas`,
    description:
      "Luxury charters, expert captains, and premium offshore experiences built for traveling anglers in Los Cabos.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} marina and offshore charter experience`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Sport Fishing Charters in Cabo San Lucas`,
    description:
      "Discover premium GAFF offshore experiences, read-only live availability, and charter-ready planning in Los Cabos.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: SITE_NAME,
    description:
      "Premier sport fishing charters in Cabo San Lucas with premium boats, experienced captains, and conservation-minded experiences.",
    url: SITE_URL,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS_ADDRESS,
      addressLocality: "Cabo San Lucas",
      addressRegion: "Baja California Sur",
      addressCountry: "MX",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS_COORDINATES.latitude,
      longitude: BUSINESS_COORDINATES.longitude,
    },
    sameAs: [
      SOCIAL_LINKS.instagram,
      SOCIAL_LINKS.facebook,
      SOCIAL_LINKS.tiktok,
      SOCIAL_LINKS.tripadvisor,
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    image: `${SITE_URL}/og-image.jpg`,
    url: SITE_URL,
    telephone: CONTACT_PHONE,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS_ADDRESS,
      addressLocality: "Cabo San Lucas",
      addressRegion: "Baja California Sur",
      addressCountry: "MX",
    },
    priceRange: "$$-$$$$",
    areaServed: "Los Cabos",
    sameAs: [
      SOCIAL_LINKS.instagram,
      SOCIAL_LINKS.facebook,
      SOCIAL_LINKS.tiktok,
      SOCIAL_LINKS.tripadvisor,
    ],
  },
]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakarta.variable} ${cormorant.variable} antialiased`}
      >
        <LanguageProvider>
          <AnalyticsScripts />
          <BotpressWidgetBridge />
          <SmoothScroll />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
