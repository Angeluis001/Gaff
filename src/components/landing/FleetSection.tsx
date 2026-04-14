"use client"

import { useState } from "react"
import { ArrowRight, Users } from "lucide-react"
import { CldImage } from "next-cloudinary"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useLanguage } from "@/contexts/LanguageContext"
import { cn } from "@/lib/utils"

type Boat = ReturnType<typeof useLanguage>["messages"]["fleet"]["boats"][number]

function FleetCard({
  boat,
  interactive = false,
}: {
  boat: Boat
  interactive?: boolean
}) {
  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })

  return (
    <motion.div
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 36 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="h-full"
      onMouseMove={(event) => {
        if (!interactive) {
          return
        }

        const bounds = event.currentTarget.getBoundingClientRect()
        const x = event.clientX - bounds.left
        const y = event.clientY - bounds.top
        const rotateY = ((x / bounds.width) - 0.5) * 10
        const rotateX = -((y / bounds.height) - 0.5) * 10
        setTilt({ rotateX, rotateY })
      }}
      onMouseLeave={() => setTilt({ rotateX: 0, rotateY: 0 })}
      style={
        interactive
          ? {
              transform: `perspective(1400px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(-4px)`,
            }
          : undefined
      }
    >
      <Card
        className={cn(
          "glass-panel h-full overflow-hidden rounded-[1.75rem] border border-gold/10 bg-transparent py-0 transition-transform duration-300",
          interactive && "will-change-transform"
        )}
      >
        <div className="relative h-60 overflow-hidden border-b border-gold/12">
          {cloudinaryCloudName ? (
            <CldImage
              alt={`${boat.name} fishing charter in Los Cabos`}
              src={boat.cloudinaryPublicId}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 25vw, 90vw"
              crop="fill"
              gravity="auto"
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(98,182,203,0.26),transparent_35%),linear-gradient(180deg,#163753_0%,#07111e_100%)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,30,0.08)_0%,rgba(7,17,30,0.64)_100%)]" />
          <div className="absolute bottom-4 left-4 rounded-full border border-gold/18 bg-navy/72 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-gold">
            {boat.length}
          </div>
        </div>
        <CardHeader className="px-6 pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold/76">
            {boat.tagline}
          </p>
          <CardTitle className="font-heading text-4xl text-white">
            {boat.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 px-6 pb-6">
          <div className="flex items-center justify-between rounded-[1.25rem] border border-gold/10 bg-white/3 px-4 py-3">
            <div className="flex items-center gap-2 text-sand/70">
              <Users className="size-4 text-teal" />
              <span className="text-sm">{boat.capacity}</span>
            </div>
            <span className="font-semibold text-white">{boat.priceFrom}</span>
          </div>
          <ul className="space-y-2 text-sm text-sand/74">
            {boat.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gold" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="border-t border-gold/12 bg-white/2 px-6 py-5">
          <Button
            render={<a href="#availability" />}
            className="w-full rounded-full bg-gold text-sm font-semibold text-navy hover:bg-gold/90"
          >
            Book this boat
            <ArrowRight className="size-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export function FleetSection() {
  const { messages } = useLanguage()
  const [emblaRef] = useEmblaCarousel({ loop: true, align: "start" }, [
    Autoplay({ delay: 5000, stopOnInteraction: true }),
  ])

  return (
    <section id="fleet" className="landing-section scroll-mt-28">
      <div className="landing-grid">
        <div className="mb-10 max-w-3xl">
          <p className="section-kicker">{messages.fleet.eyebrow}</p>
          <h2 className="section-title mt-5">{messages.fleet.title}</h2>
          <p className="section-copy mt-5">{messages.fleet.subtitle}</p>
        </div>

        <div className="hidden grid-cols-4 gap-6 lg:grid">
          {messages.fleet.boats.map((boat) => (
            <FleetCard key={boat.name} boat={boat} interactive />
          ))}
        </div>

        <div className="lg:hidden">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="-ml-4 flex">
              {messages.fleet.boats.map((boat) => (
                <div
                  key={boat.name}
                  className="min-w-0 flex-[0_0_84%] pl-4 sm:flex-[0_0_65%]"
                >
                  <FleetCard boat={boat} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
