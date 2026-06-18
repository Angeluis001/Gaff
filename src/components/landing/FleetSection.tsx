"use client"

import Image from "next/image"
import { useState } from "react"
import { ArrowRight, Users } from "lucide-react"
import { CldImage } from "next-cloudinary"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { AnimatePresence, motion, type Variants } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/LanguageContext"
import {
  extractCloudinaryPublicId,
  isAbsoluteUrl,
  normalizeCloudinaryImageValue,
} from "@/lib/cloudinary"
import { cn } from "@/lib/utils"

type FleetSectionBoat = {
  slug: string
  name: string
  category: string
  capacity: number
  length: string | null
  priceHalfDay: string | null
  priceFullDay: string | null
  image: string | null
}

type BoatCardData = {
  name: string
  tagline: string
  capacityLabel: string
  priceLabel: string
  lengthLabel: string
  badgeLabel: string | null
  image: string | null
  features: string[]
}

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
}

function formatPriceLabel(
  halfDayValue: string | null,
  fullDayValue: string | null,
  lang: "en" | "es"
) {
  const value = halfDayValue ?? fullDayValue

  if (!value) {
    return lang === "es" ? "Precio por confirmar" : "Price on request"
  }

  const amount = Number(value)
  if (Number.isNaN(amount)) {
    return value
  }

  const formatted = new Intl.NumberFormat(lang === "es" ? "es-MX" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)

  if (halfDayValue) {
    return lang === "es" ? `Desde ${formatted}` : `From ${formatted}`
  }

  return lang === "es" ? `Día completo ${formatted}` : `Full day ${formatted}`
}

function formatCapacityLabel(value: number, lang: "en" | "es") {
  return lang === "es" ? `Hasta ${value} personas` : `Up to ${value} guests`
}

function formatLengthLabel(value: string | null, fallback: string) {
  return value?.trim() || fallback
}

function FleetHeroCard({ boat, lang }: { boat: BoatCardData; lang: "en" | "es" }) {
  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const resolvedImage = boat.image
    ? normalizeCloudinaryImageValue(boat.image, cloudinaryCloudName)
    : null
  const normalizedImage = resolvedImage ? extractCloudinaryPublicId(resolvedImage) : null
  const shouldUseCloudinary =
    Boolean(cloudinaryCloudName) && Boolean(normalizedImage) && !isAbsoluteUrl(resolvedImage ?? "")

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="glass-panel mb-8 overflow-hidden rounded-[2rem] border border-gold/15"
    >
      <div className="grid lg:grid-cols-[3fr_2fr]">
        {/* Image */}
        <div className="relative h-72 overflow-hidden sm:h-80 lg:h-[26rem]">
          {resolvedImage ? (
            shouldUseCloudinary ? (
              <CldImage
                alt={`${boat.name} flagship fishing charter Los Cabos`}
                src={normalizedImage!}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 60vw, 100vw"
                crop="fill"
                gravity="auto"
              />
            ) : (
              <Image
                alt={`${boat.name} flagship fishing charter Los Cabos`}
                src={resolvedImage}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 60vw, 100vw"
              />
            )
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(98,182,203,0.26),transparent_35%),linear-gradient(180deg,#163753_0%,#07111e_100%)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,30,0.06)_0%,rgba(7,17,30,0.5)_100%)] lg:bg-[linear-gradient(90deg,transparent_58%,rgba(7,17,30,0.9)_100%)]" />
          {boat.badgeLabel && (
            <div className="absolute left-5 top-5 rounded-full border border-teal/40 bg-teal/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-sm">
              {boat.badgeLabel}
            </div>
          )}
          <div className="absolute bottom-5 left-5 rounded-full border border-gold/18 bg-navy/72 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-gold">
            {boat.lengthLabel}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between p-6 lg:p-8 xl:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold/76">
              {boat.tagline}
            </p>
            <h3 className="mt-3 font-heading text-4xl text-white xl:text-5xl">{boat.name}</h3>
          </div>

          <div className="my-6 grid grid-cols-2 gap-3">
            <div className="rounded-[1.25rem] border border-gold/10 bg-white/3 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-sand/48">
                {lang === "es" ? "Capacidad" : "Capacity"}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <Users className="size-3.5 text-teal" />
                <p className="text-sm font-semibold text-white">{boat.capacityLabel}</p>
              </div>
            </div>
            <div className="rounded-[1.25rem] border border-gold/10 bg-white/3 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-sand/48">
                {lang === "es" ? "Desde" : "Starting from"}
              </p>
              <p className="mt-1.5 text-sm font-semibold text-white">{boat.priceLabel}</p>
            </div>
          </div>

          <ul className="mb-6 space-y-2 text-sm text-sand/74">
            {boat.features.slice(0, 4).map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            render={<a href="#availability" />}
            className="w-full rounded-full bg-gold text-sm font-semibold text-navy hover:bg-gold/90"
          >
            {lang === "es" ? "Reservar este barco" : "Book this boat"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function FleetCard({
  boat,
  interactive = false,
  onSelect,
  lang = "en",
}: {
  boat: BoatCardData
  interactive?: boolean
  onSelect?: () => void
  lang?: "en" | "es"
}) {
  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })
  const resolvedImage = boat.image
    ? normalizeCloudinaryImageValue(boat.image, cloudinaryCloudName)
    : null
  const normalizedImage = resolvedImage ? extractCloudinaryPublicId(resolvedImage) : null
  const shouldUseCloudinary =
    Boolean(cloudinaryCloudName) && Boolean(normalizedImage) && !isAbsoluteUrl(resolvedImage ?? "")

  return (
    <motion.div
      variants={interactive ? cardVariants : undefined}
      whileInView={interactive ? undefined : { opacity: 1, y: 0 }}
      initial={interactive ? undefined : { opacity: 0, y: 36 }}
      viewport={interactive ? undefined : { once: true, amount: 0.2 }}
      transition={interactive ? undefined : { duration: 0.55, ease: "easeOut" }}
      whileHover={
        interactive
          ? { boxShadow: "0 24px 64px rgba(212,168,67,0.22), 0 0 0 1px rgba(212,168,67,0.28)" }
          : { y: -6, transition: { type: "spring" as const, stiffness: 280, damping: 18 } }
      }
      onClick={onSelect}
      className={cn("h-full", onSelect && "cursor-pointer")}
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
          "glass-panel flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-gold/10 bg-transparent py-0 transition-transform duration-300",
          interactive && "will-change-transform"
        )}
      >
        <div className="relative h-72 overflow-hidden border-b border-gold/12 sm:h-80">
          {resolvedImage ? (
            shouldUseCloudinary ? (
              <CldImage
                alt={`${boat.name} fishing charter in Los Cabos`}
                src={normalizedImage!}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 25vw, 90vw"
                crop="fill"
                gravity="auto"
              />
            ) : (
              <Image
                alt={`${boat.name} fishing charter in Los Cabos`}
                src={resolvedImage}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 25vw, 90vw"
              />
            )
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(98,182,203,0.26),transparent_35%),linear-gradient(180deg,#163753_0%,#07111e_100%)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,30,0.08)_0%,rgba(7,17,30,0.64)_100%)]" />
          {boat.badgeLabel ? (
            <div className="absolute right-4 top-4 rounded-full border border-teal/40 bg-teal/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-sm">
              {boat.badgeLabel}
            </div>
          ) : null}
          <div className="absolute bottom-4 left-4 rounded-full border border-gold/18 bg-navy/72 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-gold">
            {boat.lengthLabel}
          </div>
        </div>
        <CardHeader className="min-h-[8.75rem] px-6 pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold/76">
            {boat.tagline}
          </p>
          <CardTitle className="font-heading text-4xl text-white">{boat.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col space-y-5 px-6 pb-6">
          <div className="flex items-center justify-between rounded-[1.25rem] border border-gold/10 bg-white/3 px-4 py-3">
            <div className="flex items-center gap-2 text-sand/70">
              <Users className="size-4 text-teal" />
              <span className="text-sm">{boat.capacityLabel}</span>
            </div>
            <span className="font-semibold text-white">{boat.priceLabel}</span>
          </div>
          <ul className="flex-1 space-y-2 text-sm text-sand/74">
            {boat.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gold" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="border-t border-gold/12 bg-white/2 px-6 py-5">
          {onSelect ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onSelect() }}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gold/25 py-3 text-sm font-semibold text-sand/75 transition-all duration-200 hover:border-gold/50 hover:text-white"
            >
              {lang === "es" ? "Ver detalles" : "Explore this boat"}
              <ArrowRight className="size-4" />
            </button>
          ) : (
            <Button
              render={<a href="#availability" />}
              className="w-full rounded-full bg-gold text-sm font-semibold text-navy hover:bg-gold/90"
            >
              {lang === "es" ? "Reservar" : "Book this boat"}
              <ArrowRight className="size-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export function FleetSection({ boats }: { boats: FleetSectionBoat[] }) {
  const { messages, lang } = useLanguage()
  const [emblaRef] = useEmblaCarousel({ loop: true, align: "start" }, [
    Autoplay({ delay: 5000, stopOnInteraction: true }),
  ])

  const translationByCategory = Object.fromEntries(
    messages.fleet.boats.map((boat) => [boat.name.toLowerCase(), boat])
  )

  const fleetBoats = boats.map((boat) => {
    const fallbackTranslation = messages.fleet.boats.find(
      (entry) => entry.name.toLowerCase() === boat.name.toLowerCase()
    )
    const translation =
      translationByCategory[boat.category.toLowerCase()] ??
      fallbackTranslation ??
      messages.fleet.boats[0]

    return {
      name: boat.name,
      tagline: translation.tagline,
      features: translation.features,
      capacityLabel: formatCapacityLabel(boat.capacity, lang),
      priceLabel: formatPriceLabel(boat.priceHalfDay, boat.priceFullDay, lang),
      lengthLabel: formatLengthLabel(boat.length, translation.length),
      badgeLabel: boat.name.toLowerCase() === "cabo express" ? "Seakeeper Equipped" : null,
      image: boat.image,
    }
  })

  const defaultHeroName = (fleetBoats.find((b) => b.badgeLabel !== null) ?? fleetBoats[0])?.name ?? ""
  const [selectedName, setSelectedName] = useState(defaultHeroName)
  const heroBoat = fleetBoats.find((b) => b.name === selectedName) ?? fleetBoats[0] ?? null
  const gridBoats = fleetBoats.filter((b) => b.name !== heroBoat?.name)

  const maxCapacity = boats.length > 0 ? Math.max(...boats.map((b) => b.capacity)) : 0
  const hasSeakeeper = fleetBoats.some((b) => b.badgeLabel !== null)

  const statItems = [
    { value: `${boats.length}`, label: lang === "es" ? "Embarcaciones" : "Vessels" },
    { value: `${maxCapacity}`, label: lang === "es" ? "Invitados máx." : "Max guests" },
    { value: lang === "es" ? "Anual" : "Year-round", label: lang === "es" ? "Disponibilidad" : "Availability" },
    ...(hasSeakeeper
      ? [{ value: "Seakeeper", label: lang === "es" ? "Estabilizador" : "On board" }]
      : []),
  ]

  return (
    <section id="fleet" className="landing-section relative scroll-mt-24 overflow-hidden">
      {/* Subtle teal glow from the top */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_55%_at_50%_-5%,rgba(98,182,203,0.07),transparent)]" />

      <div className="landing-grid relative z-10">
        <div className="mb-8 max-w-3xl">
          <p className="section-kicker">{messages.fleet.eyebrow}</p>
          <h2 className="section-title mt-5">{messages.fleet.title}</h2>
          <p className="section-copy mt-5">{messages.fleet.subtitle}</p>
        </div>

        {/* Stats bar */}
        {boats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {statItems.map(({ value, label }) => (
              <div
                key={label}
                className="rounded-[1.25rem] border border-gold/10 bg-white/3 px-4 py-3 text-center"
              >
                <p className="font-heading text-2xl text-white">{value}</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.22em] text-sand/48">
                  {label}
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Desktop: selected hero (animated) + clickable grid */}
        {fleetBoats.length > 0 && (
          <div className="hidden lg:block">
            <AnimatePresence mode="wait">
              {heroBoat && (
                <motion.div
                  key={heroBoat.name}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <FleetHeroCard boat={heroBoat} lang={lang} />
                </motion.div>
              )}
            </AnimatePresence>
            {gridBoats.length > 0 && (
              <motion.div
                className="mx-auto flex w-full justify-center gap-6 lg:grid lg:grid-cols-[repeat(auto-fit,minmax(17.5rem,20rem))]"
                variants={gridVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
              >
                {gridBoats.map((boat) => (
                  <FleetCard
                    key={boat.name}
                    boat={boat}
                    interactive
                    lang={lang}
                    onSelect={() => setSelectedName(boat.name)}
                  />
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Mobile carousel — all boats */}
        <div className="lg:hidden">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="-ml-4 flex">
              {fleetBoats.map((boat) => (
                <div key={boat.name} className="min-w-0 flex-[0_0_84%] pl-4 sm:flex-[0_0_65%]">
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
