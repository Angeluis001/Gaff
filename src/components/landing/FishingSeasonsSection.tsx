"use client"

import { motion } from "framer-motion"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useLanguage } from "@/contexts/LanguageContext"

const monthLabels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]

export function FishingSeasonsSection() {
  const { messages } = useLanguage()
  const currentMonth = new Date().getMonth() + 1

  return (
    <section id="seasons" className="landing-section scroll-mt-28 pt-0">
      <div className="landing-grid">
        <div className="mb-10 max-w-3xl">
          <p className="section-kicker">{messages.seasons.eyebrow}</p>
          <h2 className="section-title mt-5">{messages.seasons.title}</h2>
          <p className="section-copy mt-5">{messages.seasons.subtitle}</p>
        </div>

        <div className="glass-panel overflow-hidden rounded-[2rem] border border-gold/10 p-6 sm:p-8">
          <TooltipProvider>
            <div className="space-y-6">
              <div className="grid grid-cols-[8rem_repeat(12,minmax(0,1fr))] gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-sand/54">
                <span>Species</span>
                {monthLabels.map((month) => (
                  <span key={month} className="text-center">
                    {month}
                  </span>
                ))}
              </div>

              {messages.seasons.species.map((species) => (
                <div
                  key={species.name}
                  className="grid grid-cols-[8rem_repeat(12,minmax(0,1fr))] items-center gap-2"
                >
                  <div>
                    <p className="font-heading text-3xl text-white">{species.name}</p>
                    <p className="text-xs uppercase tracking-[0.28em] text-gold/76">
                      {species.peak}
                    </p>
                  </div>

                  <svg viewBox="0 0 480 34" className="col-span-12 hidden h-12 w-full md:block">
                    {Array.from({ length: 12 }).map((_, monthIndex) => {
                      const month = monthIndex + 1
                      const active = species.months.includes(month)

                      return (
                        <Tooltip key={`${species.name}-${month}`}>
                          <TooltipTrigger
                            render={
                              <g className="cursor-pointer" transform={`translate(${monthIndex * 38},0)`} />
                            }
                          >
                            <motion.rect
                              x={0}
                              y={6}
                              width={30}
                              height={22}
                              rx={11}
                              initial={{ opacity: 0.35, scaleY: 0.6 }}
                              whileInView={{ opacity: 1, scaleY: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: monthIndex * 0.03, duration: 0.35 }}
                              fill={
                                active
                                  ? month === currentMonth
                                    ? "#d4a843"
                                    : "#62b6cb"
                                  : "rgba(245,240,232,0.1)"
                              }
                              stroke={month === currentMonth ? "#f5f0e8" : "transparent"}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            {species.name} · {species.window}
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </svg>

                  <div className="col-span-12 grid grid-cols-3 gap-2 md:hidden">
                    {Array.from({ length: 12 }).map((_, monthIndex) => {
                      const month = monthIndex + 1
                      const active = species.months.includes(month)

                      return (
                        <motion.div
                          key={`${species.name}-mobile-${month}`}
                          initial={{ opacity: 0.35, y: 8 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          className="rounded-full px-3 py-2 text-center text-xs font-semibold"
                          style={{
                            background:
                              active
                                ? month === currentMonth
                                  ? "#d4a843"
                                  : "rgba(98,182,203,0.28)"
                                : "rgba(245,240,232,0.08)",
                            color: active ? "#07111e" : "#f5f0e8",
                          }}
                        >
                          {monthLabels[monthIndex]}
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </TooltipProvider>
        </div>
      </div>
    </section>
  )
}
