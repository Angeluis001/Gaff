"use client"

import { Fish } from "lucide-react"
import { motion } from "framer-motion"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useLanguage } from "@/contexts/LanguageContext"

const MONTH_LABELS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

type SpeciesStyle = {
  activeBg: string
  text: string
  glow: string
  chipBg: string
  chipText: string
}

const SPECIES_STYLE: Record<string, SpeciesStyle> = {
  marlin:      { activeBg: "bg-blue-400",    text: "text-blue-300",    glow: "shadow-[0_0_12px_rgba(96,165,250,0.55)]",   chipBg: "bg-blue-400/12 border-blue-400/30",       chipText: "text-blue-300"    },
  tuna:        { activeBg: "bg-teal",        text: "text-teal",        glow: "shadow-[0_0_12px_rgba(98,182,203,0.55)]",   chipBg: "bg-teal/12 border-teal/30",               chipText: "text-teal"        },
  dorado:      { activeBg: "bg-emerald-400", text: "text-emerald-300", glow: "shadow-[0_0_12px_rgba(52,211,153,0.55)]",   chipBg: "bg-emerald-400/12 border-emerald-400/30", chipText: "text-emerald-300" },
  wahoo:       { activeBg: "bg-orange-400",  text: "text-orange-300",  glow: "shadow-[0_0_12px_rgba(251,146,60,0.55)]",   chipBg: "bg-orange-400/12 border-orange-400/30",   chipText: "text-orange-300"  },
  roosterfish: { activeBg: "bg-purple-400",  text: "text-purple-300",  glow: "shadow-[0_0_12px_rgba(196,181,253,0.55)]",  chipBg: "bg-purple-400/12 border-purple-400/30",   chipText: "text-purple-300"  },
}

const DEFAULT_STYLE: SpeciesStyle = {
  activeBg: "bg-teal", text: "text-teal", glow: "shadow-[0_0_12px_rgba(98,182,203,0.55)]",
  chipBg: "bg-teal/12 border-teal/30", chipText: "text-teal",
}

function getStyle(name: string): SpeciesStyle {
  return SPECIES_STYLE[name.toLowerCase()] ?? DEFAULT_STYLE
}

export function FishingSeasonsSection() {
  const { messages, lang } = useLanguage()
  const currentMonth = new Date().getMonth() + 1

  const inSeasonNow = messages.seasons.species.filter((s) => s.months.includes(currentMonth))

  return (
    <section id="seasons" className="landing-section scroll-mt-24 pt-0">
      <div className="landing-grid">
        <div className="mb-10 max-w-3xl">
          <p className="section-kicker">{messages.seasons.eyebrow}</p>
          <h2 className="section-title mt-5">{messages.seasons.title}</h2>
          <p className="section-copy mt-5">{messages.seasons.subtitle}</p>
        </div>

        {/* ── Biting NOW banner ── */}
        {inSeasonNow.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-gold/20 bg-gold/6 px-5 py-4"
          >
            <div className="flex flex-shrink-0 items-center gap-2">
              <Fish className="size-4 text-gold" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-gold">
                {lang === "es" ? "En temporada ahora" : "In season right now"}
              </span>
            </div>
            <div className="hidden h-4 w-px bg-gold/20 sm:block" />
            <div className="flex flex-wrap gap-2">
              {inSeasonNow.map((species) => {
                const style = getStyle(species.name)
                return (
                  <span
                    key={species.name}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${style.chipBg} ${style.chipText}`}
                  >
                    <Fish className="size-3" />
                    {species.name}
                  </span>
                )
              })}
            </div>
          </motion.div>
        )}

        <div className="glass-panel overflow-hidden rounded-[2rem] border border-gold/10">
          {/* ── Legend ── */}
          <div className="flex flex-wrap items-center gap-5 border-b border-gold/8 px-6 py-4 sm:px-8">
            <div className="flex items-center gap-2 text-xs text-sand/60">
              <span className="h-2.5 w-6 rounded-full bg-teal/80 shadow-[0_0_8px_rgba(98,182,203,0.5)]" />
              {lang === "es" ? "Temporada activa" : "Active season"}
            </div>
            <div className="flex items-center gap-2 text-xs text-sand/60">
              <span className="h-2.5 w-6 rounded-full bg-gold shadow-[0_0_8px_rgba(212,168,67,0.5)]" />
              {lang === "es" ? "Este mes" : "This month"}
            </div>
            <div className="flex items-center gap-2 text-xs text-sand/60">
              <span className="h-2.5 w-6 rounded-full border border-white/12 bg-white/6" />
              {lang === "es" ? "Fuera de temporada" : "Off season"}
            </div>
          </div>

          {/* ── Mobile: stacked species cards ── */}
          <div className="space-y-2 p-4 sm:p-6 lg:hidden">
            {messages.seasons.species.map((species) => {
              const style = getStyle(species.name)
              const inSeason = species.months.includes(currentMonth)
              return (
                <motion.div
                  key={species.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="rounded-[1.25rem] border border-gold/10 bg-white/3 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Fish className={`size-5 flex-shrink-0 ${style.text}`} />
                      <div>
                        <p className="font-heading text-2xl text-white">{species.name}</p>
                        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold/65">
                          {species.peak}
                        </p>
                      </div>
                    </div>
                    {inSeason && (
                      <span className={`flex-shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${style.chipBg} ${style.chipText}`}>
                        {lang === "es" ? "En temporada" : "In season"}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {MONTH_LABELS.map((label, i) => {
                      const month = i + 1
                      const active = species.months.includes(month)
                      const isCurrent = month === currentMonth
                      return (
                        <div key={i} className="flex flex-1 flex-col items-center gap-1">
                          <div
                            className={`h-1.5 w-full rounded-full ${
                              active
                                ? isCurrent
                                  ? "bg-gold shadow-[0_0_8px_rgba(212,168,67,0.6)]"
                                  : `${style.activeBg} opacity-80`
                                : isCurrent
                                ? "border border-gold/30 bg-gold/10"
                                : "bg-white/8"
                            }`}
                          />
                          <span className={`text-[9px] ${isCurrent ? "text-gold" : "text-sand/28"}`}>
                            {label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <p className="mt-2.5 text-xs text-sand/50">{species.window}</p>
                </motion.div>
              )
            })}
          </div>

          {/* ── Desktop: full table ── */}
          <TooltipProvider>
            <div className="hidden overflow-x-auto px-6 py-6 sm:px-8 lg:block">
              <div className="min-w-[38rem]">

                {/* Month header row */}
                <div className="mb-3 grid grid-cols-[8rem_repeat(12,1fr)] items-end gap-x-1.5">
                  <span className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-sand/36">
                    {lang === "es" ? "Especie" : "Species"}
                  </span>
                  {MONTH_LABELS.map((label, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      {i + 1 === currentMonth && (
                        <span className="rounded-full bg-gold/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold">
                          {lang === "es" ? "hoy" : "now"}
                        </span>
                      )}
                      <span
                        className={`text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${
                          i + 1 === currentMonth ? "text-gold" : "text-sand/38"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Species rows */}
                {messages.seasons.species.map((species, sIdx) => {
                  const style = getStyle(species.name)
                  return (
                    <div
                      key={species.name}
                      className={`grid grid-cols-[8rem_repeat(12,1fr)] items-center gap-x-1.5 py-4 ${
                        sIdx < messages.seasons.species.length - 1
                          ? "border-b border-gold/8"
                          : ""
                      }`}
                    >
                      {/* Species label with icon */}
                      <div className="pr-2">
                        <div className="mb-0.5 flex items-center gap-1.5">
                          <Fish className={`size-4 flex-shrink-0 ${style.text}`} />
                          <p className="font-heading text-[1.6rem] leading-tight text-white">
                            {species.name}
                          </p>
                        </div>
                        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold/65">
                          {species.peak}
                        </p>
                      </div>

                      {/* Month pills — color per species, gold on current month */}
                      {Array.from({ length: 12 }).map((_, mIdx) => {
                        const month = mIdx + 1
                        const active = species.months.includes(month)
                        const isCurrent = month === currentMonth

                        const pillClass = active
                          ? isCurrent
                            ? "bg-gold shadow-[0_0_16px_rgba(212,168,67,0.65)] cursor-pointer"
                            : `${style.activeBg} ${style.glow} cursor-pointer`
                          : isCurrent
                          ? "border border-gold/30 bg-gold/8"
                          : "border border-white/8 bg-white/4"

                        return (
                          <Tooltip key={mIdx}>
                            <TooltipTrigger
                              render={<div className="flex items-center justify-center" />}
                            >
                              <motion.div
                                className={`h-6 w-full rounded-full ${pillClass}`}
                                initial={{ opacity: 0, scaleX: 0.3 }}
                                whileInView={{ opacity: 1, scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{
                                  delay: sIdx * 0.05 + mIdx * 0.03,
                                  duration: 0.35,
                                  ease: "easeOut",
                                }}
                                whileHover={
                                  active
                                    ? { scaleX: 1.08, scaleY: 1.22, y: -3 }
                                    : { scaleY: 1.12 }
                                }
                                style={{ transformOrigin: "center" }}
                              />
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="border border-white/10 bg-navy/95 text-white backdrop-blur"
                            >
                              <p className="text-sm font-semibold">{species.name}</p>
                              <p className="text-xs text-sand/60">
                                {MONTH_NAMES[mIdx]}
                                {active
                                  ? ` · ${species.window}`
                                  : ` · ${lang === "es" ? "Fuera de temporada" : "Off season"}`}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </TooltipProvider>
        </div>
      </div>
    </section>
  )
}
