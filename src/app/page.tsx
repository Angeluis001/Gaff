import type { ComponentProps, ReactElement } from "react"
import nextDynamic from "next/dynamic"
import { db } from "@/lib/db"
import { boats } from "@/lib/db/schema"
import { getPublishedGalleryItems } from "@/lib/gallery"
import { FleetSection } from "@/components/landing/FleetSection"
import { HeroSection } from "@/components/landing/HeroSection"
import { Navbar } from "@/components/landing/Navbar"

export const dynamic = "force-dynamic"
export const revalidate = 0

const AvailabilityCalendarSection = nextDynamic(
  () =>
    import("@/components/landing/AvailabilityCalendarSection").then(
      (module) => module.AvailabilityCalendarSection
    ),
  { loading: () => null }
)
const FishingSeasonsSection = nextDynamic(
  () =>
    import("@/components/landing/FishingSeasonsSection").then(
      (module) => module.FishingSeasonsSection
    ),
  { loading: () => null }
)
const TestimonialsSection = nextDynamic(
  () =>
    import("@/components/landing/TestimonialsSection").then(
      (module) => module.TestimonialsSection
    ),
  { loading: () => null }
)
const FAQSection = nextDynamic(
  () =>
    import("@/components/landing/FAQSection").then(
      (module) => module.FAQSection
    ),
  { loading: () => null }
)
const ConservationSection = nextDynamic(
  () =>
    import("@/components/landing/ConservationSection").then(
      (module) => module.ConservationSection
    ),
  { loading: () => null }
)
const CTASection = nextDynamic(
  () =>
    import("@/components/landing/CTASection").then(
      (module) => module.CTASection
    ),
  { loading: () => null }
)
const GalleryTeaserSection = nextDynamic(
  () =>
    import("@/components/landing/GalleryTeaserSection").then(
      (module) => module.GalleryTeaserSection
    ),
  { loading: () => null }
)
const Footer = nextDynamic(
  () => import("@/components/landing/Footer").then((module) => module.Footer),
  { loading: () => null }
)

const Image = (() => null) as unknown as (
  props: ComponentProps<"img"> & { priority?: boolean }
) => ReactElement | null

function LegacyHome() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
              src/app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}

void LegacyHome

function PlaceholderCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="glass-panel mx-auto max-w-3xl px-6 py-10 text-center sm:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gold/80">
        Next Wave
      </p>
      <h2 className="mt-4 font-heading text-4xl text-white sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-sand/78">{description}</p>
    </div>
  )
}

void PlaceholderCard

const CATEGORY_ORDER = ["standard", "midsize", "large", "luxury"] as const

export default async function Home() {
  const [boatRows, galleryItems] = await Promise.all([
    db.select().from(boats),
    getPublishedGalleryItems(),
  ])

  const fleetBoats = boatRows
    .filter((boat) => boat.isActive !== false)
    .sort((a, b) => {
      const aIndex = CATEGORY_ORDER.indexOf(a.category as (typeof CATEGORY_ORDER)[number])
      const bIndex = CATEGORY_ORDER.indexOf(b.category as (typeof CATEGORY_ORDER)[number])
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
    })
    .map((boat) => ({
      slug: boat.slug,
      name: boat.name,
      category: boat.category,
      capacity: boat.capacity,
      length: boat.length ?? null,
      priceHalfDay: boat.priceHalfDay ?? null,
      priceFullDay: boat.priceFullDay ?? null,
      image: ((boat.images as string[] | null) ?? [])[0] ?? null,
    }))

  return (
    <>
      <Navbar />
      <main className="landing-shell pb-16">
        <HeroSection />
        <FleetSection boats={fleetBoats} />

        <AvailabilityCalendarSection />
        <FishingSeasonsSection />
        <TestimonialsSection />
        <FAQSection />
        <GalleryTeaserSection items={galleryItems.filter((item) => item.featured || item.mediaType === "video")} />
        <ConservationSection />
        <CTASection />
        <Footer />
      </main>
    </>
  )
}
