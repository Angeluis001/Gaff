import type { Metadata } from "next"
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google"

import { AnalyticsScripts } from "@/components/AnalyticsScripts"
import { BotpressWidgetBridge } from "@/components/BotpressWidgetBridge"
import { PublicWidgets } from "@/components/PublicWidgets"
import { SmoothScroll } from "@/components/SmoothScroll"
import { LanguageProvider } from "@/contexts/LanguageContext"
import {
  BUSINESS_ADDRESS,
  BUSINESS_COORDINATES,
  CONTACT_EMAIL,
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
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} | Sport Fishing Charters in Cabo San Lucas`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Book premium sport fishing charters in Cabo San Lucas from $550. Half-day & full-day trips for marlin, yellowfin tuna, dorado & wahoo. Expert captains, real-time availability, instant online booking.",
  keywords: [
    "cabo san lucas fishing charter",
    "sport fishing los cabos",
    "cabo fishing trips",
    "marlin fishing cabo san lucas",
    "deep sea fishing cabo",
    "cabo san lucas fishing boats",
    "yellowfin tuna fishing cabo",
    "dorado fishing cabo",
    "los cabos fishing charter prices",
    "cabo fishing half day full day",
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
      "Sport fishing charters from $550 in Cabo San Lucas. Marlin, tuna & dorado trips. Expert captains, instant online booking, real-time availability.",
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
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
    shortcut: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#business`,
    name: SITE_NAME,
    image: `${SITE_URL}/og-image.jpg`,
    url: SITE_URL,
    telephone: CONTACT_PHONE,
    email: CONTACT_EMAIL,
    description:
      "Premium sport fishing charters in Cabo San Lucas. Half-day and full-day trips for marlin, tuna, dorado, wahoo and roosterfish. Book online with instant confirmation.",
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS_ADDRESS,
      addressLocality: "Cabo San Lucas",
      addressRegion: "Baja California Sur",
      postalCode: "23450",
      addressCountry: "MX",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS_COORDINATES.latitude,
      longitude: BUSINESS_COORDINATES.longitude,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      opens: "06:00",
      closes: "18:00",
    },
    priceRange: "$550–$3120",
    currenciesAccepted: "USD",
    paymentAccepted: "Credit Card, Debit Card",
    areaServed: ["Cabo San Lucas", "Los Cabos", "Baja California Sur"],
    sameAs: [
      SOCIAL_LINKS.instagram,
      SOCIAL_LINKS.facebook,
      SOCIAL_LINKS.tiktok,
      SOCIAL_LINKS.tripadvisor,
    ],
  },
  // Charter packages — enables price display in Google search results
  {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Cabo San Lucas Sport Fishing Charter",
    description:
      "Sport fishing charters in Cabo San Lucas for marlin, yellowfin tuna, dorado and wahoo. Boats from 26 to 45 feet for groups of 2 to 10 guests.",
    image: `${SITE_URL}/og-image.jpg`,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: [
      {
        "@type": "Offer",
        name: "Standard 26ft — Half Day (up to 4 guests)",
        price: "550",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/booking`,
        validFrom: "2025-01-01",
      },
      {
        "@type": "Offer",
        name: "Standard 26ft — Full Day (up to 4 guests)",
        price: "880",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/booking`,
      },
      {
        "@type": "Offer",
        name: "Midsize 31ft — Half Day (up to 6 guests)",
        price: "850",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/booking`,
      },
      {
        "@type": "Offer",
        name: "Midsize 31ft — Full Day (up to 6 guests)",
        price: "1360",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/booking`,
      },
      {
        "@type": "Offer",
        name: "Large 38ft — Half Day (up to 8 guests)",
        price: "1250",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/booking`,
      },
      {
        "@type": "Offer",
        name: "Large 38ft — Full Day (up to 8 guests)",
        price: "2000",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/booking`,
      },
      {
        "@type": "Offer",
        name: "Luxury 45ft — Half Day (up to 10 guests)",
        price: "1950",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/booking`,
      },
      {
        "@type": "Offer",
        name: "Luxury 45ft — Full Day (up to 10 guests)",
        price: "3120",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/booking`,
      },
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
          <PublicWidgets />
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
