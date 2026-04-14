import type { ComponentProps, ReactElement } from "react"
import dynamic from "next/dynamic"
import { FleetSection } from "@/components/landing/FleetSection"
import { HeroSection } from "@/components/landing/HeroSection"
import { Navbar } from "@/components/landing/Navbar"

const AvailabilityCalendarSection = dynamic(
  () =>
    import("@/components/landing/AvailabilityCalendarSection").then(
      (module) => module.AvailabilityCalendarSection
    ),
  { loading: () => null }
)
const FishingSeasonsSection = dynamic(
  () =>
    import("@/components/landing/FishingSeasonsSection").then(
      (module) => module.FishingSeasonsSection
    ),
  { loading: () => null }
)
const TestimonialsSection = dynamic(
  () =>
    import("@/components/landing/TestimonialsSection").then(
      (module) => module.TestimonialsSection
    ),
  { loading: () => null }
)
const FAQSection = dynamic(
  () =>
    import("@/components/landing/FAQSection").then(
      (module) => module.FAQSection
    ),
  { loading: () => null }
)
const CrewSection = dynamic(
  () =>
    import("@/components/landing/CrewSection").then(
      (module) => module.CrewSection
    ),
  { loading: () => null }
)
const ConservationSection = dynamic(
  () =>
    import("@/components/landing/ConservationSection").then(
      (module) => module.ConservationSection
    ),
  { loading: () => null }
)
const CTASection = dynamic(
  () =>
    import("@/components/landing/CTASection").then(
      (module) => module.CTASection
    ),
  { loading: () => null }
)
const Footer = dynamic(
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

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="landing-shell pb-16">
        <HeroSection />
        <FleetSection />

        <AvailabilityCalendarSection />
        <FishingSeasonsSection />
        <TestimonialsSection />
        <FAQSection />
        <CrewSection />
        <ConservationSection />
        <CTASection />
        <Footer />
      </main>
    </>
  )
}
