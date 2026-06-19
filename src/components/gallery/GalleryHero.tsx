import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function GalleryHero() {
  return (
    <section className="landing-grid pt-32">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-gold/10 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.16),_transparent_38%),linear-gradient(180deg,rgba(8,20,34,0.96),rgba(6,16,28,0.98))] px-6 py-12 shadow-[0_28px_120px_rgba(2,6,23,0.45)] sm:px-10 lg:px-14 lg:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.36em] text-gold/80">
          Visual Proof
        </p>
        <h1 className="mt-4 max-w-4xl font-heading text-5xl leading-none text-white sm:text-6xl lg:text-7xl">
          A closer look at the boats, the bite, and the moments that make Cabo worth it.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-sand/72 sm:text-lg">
          Browse real GAFF photos and on-the-water clips across the fleet. Every asset is
          selected to help future guests picture the day they are actually booking.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            render={<Link href="/booking" />}
            size="lg"
            className="rounded-full bg-gold px-6 text-sm font-semibold text-navy hover:bg-gold/90"
          >
            Start your trip
            <ArrowRight className="size-4" />
          </Button>
          <Button
            render={<Link href="/#fleet" />}
            size="lg"
            variant="outline"
            className="rounded-full border-gold/20 bg-white/5 px-6 text-sm font-semibold text-white hover:bg-white/10"
          >
            Compare boats
          </Button>
        </div>
      </div>
    </section>
  )
}
