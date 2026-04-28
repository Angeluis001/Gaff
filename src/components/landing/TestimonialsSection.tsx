"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Fish } from "lucide-react"
import { motion, useInView, type Variants } from "framer-motion"

import { useLanguage } from "@/contexts/LanguageContext"
import { certificationLogos, testimonialMedia } from "@/lib/landing-data"

const LOGO_IGFA       = "https://res.cloudinary.com/dtqelgtco/image/upload/v1777344379/Tag2_ejx1qn.png"
const LOGO_GRAYFISHTAG = "https://res.cloudinary.com/dtqelgtco/image/upload/v1777344379/Tag1_hq7zk8.png"

const logoUrlMap: Record<string, string> = {
  IGFA: LOGO_IGFA,
  GrayFishTag: LOGO_GRAYFISHTAG,
}

function HighlightedQuote({ text, highlights }: { text: string; highlights?: string[] }) {
  if (!highlights?.length) return <>{text}</>

  type Part = { text: string; gold: boolean }
  let parts: Part[] = [{ text, gold: false }]

  for (const phrase of highlights) {
    parts = parts.flatMap((part) => {
      if (part.gold) return [part]
      const segments = part.text.split(phrase)
      if (segments.length === 1) return [part]
      return segments.flatMap((seg, i) => [
        ...(seg ? [{ text: seg, gold: false }] : []),
        ...(i < segments.length - 1 ? [{ text: phrase, gold: true }] : []),
      ])
    })
  }

  return (
    <>
      {parts.map((p, i) =>
        p.gold ? (
          <span key={i} className="text-gold">{p.text}</span>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  )
}

function Counter({ label, value }: { label: string; value: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="glass-panel rounded-[1.5rem] px-5 py-4"
    >
      <motion.p
        className="font-heading text-4xl text-white"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {value}
      </motion.p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.28em] text-sand/54">
        {label}
      </p>
    </motion.div>
  )
}

export function TestimonialsSection() {
  const { messages } = useLanguage()

  const trackRef = useRef<HTMLDivElement>(null)
  const [dragLeft, setDragLeft] = useState(0)

  useEffect(() => {
    function calcConstraints() {
      if (!trackRef.current) return
      const overflow = trackRef.current.scrollWidth - trackRef.current.clientWidth
      setDragLeft(overflow > 0 ? -overflow : 0)
    }
    calcConstraints()
    window.addEventListener("resize", calcConstraints)
    return () => window.removeEventListener("resize", calcConstraints)
  }, [])

  return (
    <section id="testimonials" className="landing-section scroll-mt-24 pt-0">
      <div className="landing-grid">
        <div className="mb-10 max-w-3xl">
          <p className="section-kicker">{messages.testimonials.eyebrow}</p>
          <h2 className="section-title mt-5">{messages.testimonials.title}</h2>
          <p className="section-copy mt-5">{messages.testimonials.subtitle}</p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {messages.testimonials.stats.map((stat) => (
            <Counter key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
          {/* Draggable card track */}
          <div className="relative overflow-hidden rounded-[1rem]">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#07111e] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#07111e] to-transparent" />

            <motion.div
              ref={trackRef}
              drag="x"
              dragConstraints={{ left: dragLeft, right: 0 }}
              dragElastic={0.06}
              dragTransition={{ bounceDamping: 28, bounceStiffness: 280 }}
              className="flex cursor-grab gap-4 active:cursor-grabbing"
              style={{ touchAction: "pan-y" }}
            >
              {testimonialMedia.map((item, idx) => (
                <motion.article
                  key={item.guest}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: idx * 0.06 }}
                  whileHover={{
                    y: -6,
                    boxShadow: "0 28px 56px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,168,67,0.18)",
                    transition: { type: "spring", stiffness: 280, damping: 22 },
                  }}
                  className="relative min-w-[min(88vw,44rem)] flex-shrink-0 h-[34rem] overflow-hidden rounded-[2rem] border border-gold/12"
                  style={{ userSelect: "none" }}
                >
                  {/* Fallback gradient base */}
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#0d2137_0%,#07111e_60%,#0a1a2e_100%)]" />

                  {/* Photo — renders on top of gradient if URL is set */}
                  {item.imageUrl && (
                    <Image
                      alt={`${item.guest} fishing trip`}
                      src={item.imageUrl}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 44rem, 88vw"
                      draggable={false}
                    />
                  )}

                  {/* Left-to-right gradient overlay for text legibility */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(7,17,30,0.95)_0%,rgba(7,17,30,0.80)_38%,rgba(7,17,30,0.30)_62%,transparent_82%)]" />
                  {/* Bottom vignette */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(7,17,30,0.6)_0%,transparent_40%)]" />

                  {/* Text content */}
                  <div className="absolute inset-y-0 left-0 flex w-[58%] flex-col justify-between p-8 sm:p-10">
                    {/* Top — trip label */}
                    <div>
                      <p className="text-[0.62rem] font-bold uppercase tracking-[0.38em] text-gold/80">
                        {item.trip}
                      </p>
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="h-px w-5 bg-gold/40" />
                        <Fish className="size-3 text-gold/50" />
                      </div>
                    </div>

                    {/* Bottom — quote + attribution */}
                    <div>
                      <p className="font-heading text-2xl leading-snug text-white sm:text-3xl">
                        &ldquo;<HighlightedQuote text={item.quote} highlights={item.highlightPhrases} />&rdquo;
                      </p>
                      <div className="mt-6 h-px w-8 bg-gold/40" />
                      <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-gold">
                        {item.guest}
                      </p>
                      <p className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-sand/48">
                        {item.location}
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}

              <div className="w-8 flex-shrink-0" />
            </motion.div>
          </div>

          {/* Certification sidebar */}
          <aside className="glass-panel rounded-[1.75rem] border border-gold/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold/76">
              Certifications
            </p>
            <div className="mt-5 space-y-3">
              {certificationLogos.map((logo) => {
                const url = logoUrlMap[logo.name]
                return (
                  <motion.div
                    key={logo.name}
                    whileHover={{ x: 4, transition: { type: "spring", stiffness: 400, damping: 20 } }}
                    className="flex items-center gap-3 rounded-[1.25rem] border border-gold/10 bg-white/3 p-3"
                  >
                    {url ? (
                      <Image
                        alt={`${logo.name} logo`}
                        src={url}
                        width={48}
                        height={48}
                        className="rounded-full bg-white/80 object-contain p-1 flex-shrink-0"
                      />
                    ) : (
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white">
                        {logo.name.slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-white">{logo.name}</p>
                      <p className="text-xs text-sand/50">Certified partner</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
