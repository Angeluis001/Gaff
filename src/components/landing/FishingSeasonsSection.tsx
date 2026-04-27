"use client"

import { motion } from "framer-motion"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useLanguage } from "@/contexts/LanguageContext"

const MONTH_LABELS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export function FishingSeasonsSection() {
  const { messages } = useLanguage()
  const currentMonth = new Date().getMonth() + 1

  return (
    <section id="seasons" className="landing-section scroll-mt-24 pt-0">
      <div className="landing-grid">
        <div className="mb-10 max-w-3xl">
          <p className="section-kicker">{messages.seasons.eyebrow}</p>
          <h2 className="section-title mt-5">{messages.seasons.title}</h2>
          <p className="section-copy mt-5">{messages.seasons.subtitle}</p>
        </div>

        <div className="glass-panel overflow-hidden rounded-[2rem] border border-gold/10">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-5 border-b border-gold/8 px-6 py-4 sm:px-8">
            <div className="flex items-center gap-2 text-xs text-sand/60">
              <span className="h-2.5 w-6 rounded-full bg-teal/80 shadow-[0_0_8px_rgba(98,182,203,0.5)]" />
              Active season
            </div>
            <div className="flex items-center gap-2 text-xs text-sand/60">
              <span className="h-2.5 w-6 rounded-full bg-gold shadow-[0_0_8px_rgba(212,168,67,0.5)]" />
              This month
            </div>
            <div className="flex items-center gap-2 text-xs text-sand/60">
              <span className="h-2.5 w-6 rounded-full border border-white/12 bg-white/6" />
              Off season
            </div>
          </div>

          <TooltipProvider>
            <div className="overflow-x-auto px-6 py-6 sm:px-8">
              <div className="min-w-[38rem]">

                {/* Month header row */}
                <div className="mb-3 grid grid-cols-[8rem_repeat(12,1fr)] items-end gap-x-1.5">
                  <span className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-sand/36">
                    Species
                  </span>
                  {MONTH_LABELS.map((label, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      {i + 1 === currentMonth && (
                        <span className="rounded-full bg-gold/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold">
                          now
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
                {messages.seasons.species.map((species, sIdx) => (
                  <div
                    key={species.name}
                    className={`grid grid-cols-[8rem_repeat(12,1fr)] items-center gap-x-1.5 py-4 ${
                      sIdx < messages.seasons.species.length - 1
                        ? "border-b border-gold/8"
                        : ""
                    }`}
                  >
                    {/* Species label */}
                    <div className="pr-2">
                      <p className="font-heading text-[1.6rem] leading-tight text-white">
                        {species.name}
                      </p>
                      <p className="mt-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold/65">
                        {species.peak}
                      </p>
                    </div>

                    {/* Month pills */}
                    {Array.from({ length: 12 }).map((_, mIdx) => {
                      const month = mIdx + 1
                      const active = species.months.includes(month)
                      const isCurrent = month === currentMonth

                      const pillClass = active
                        ? isCurrent
                          ? "bg-gold shadow-[0_0_16px_rgba(212,168,67,0.65)] cursor-pointer"
                          : "bg-teal shadow-[0_0_10px_rgba(98,182,203,0.4)] cursor-pointer"
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
                              {active ? ` · ${species.window}` : " · Off season"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </TooltipProvider>
        </div>
      </div>
    </section>
  )
}
