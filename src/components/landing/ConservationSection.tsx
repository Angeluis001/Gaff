"use client"

import Image from "next/image"
import { Fish, ShieldCheck, Waves } from "lucide-react"
import { motion } from "framer-motion"

import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/LanguageContext"

const icons = [Fish, ShieldCheck, Waves]

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const CDN = CLOUD ? `https://res.cloudinary.com/${CLOUD}/image/upload` : null

const MAIN_IMAGE_URL   = CDN ? `${CDN}/Marlin_zdcdgy.png`  : null
const LOGO_GRAYFSHTAG_URL = CDN ? `${CDN}/Tag1_hq7zk8.png` : null
const LOGO_IGFA_URL    = CDN ? `${CDN}/Tag2_ejx1qn.png`    : null

export function ConservationSection() {
  const { messages } = useLanguage()

  return (
    <section id="conservation" className="landing-section scroll-mt-24">
      <div className="landing-grid space-y-5">

        {/* ── Main 2-column panel ───────────────────────────────────────── */}
        <div className="glass-panel grid overflow-hidden rounded-[2rem] border border-gold/10 lg:grid-cols-[1.1fr_0.9fr]">

          {/* Left — full-bleed image with bottom overlay */}
          <div className="relative min-h-[28rem] lg:min-h-[40rem]">
            {MAIN_IMAGE_URL ? (
              <Image
                alt="Catch and release moment off the coast of Los Cabos"
                src={MAIN_IMAGE_URL}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 55vw, 100vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(98,182,203,0.2),transparent_35%),linear-gradient(180deg,#1b4965_0%,#07111e_100%)]" />
            )}

            {/* Gradient vignette */}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,30,0.08)_0%,rgba(7,17,30,0.55)_70%,rgba(7,17,30,0.82)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,17,30,0.0)_50%,rgba(7,17,30,0.55)_100%)]" />

            {/* Bottom overlay text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className="absolute bottom-0 left-0 right-0 p-6 lg:right-8"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold/90">
                Conservation in Action
              </p>
              <p className="mt-3 font-heading text-2xl leading-snug text-white sm:text-3xl">
                Every tagged marlin released is a data point for science and a victory for the future of sport fishing in Los Cabos.
              </p>
            </motion.div>
          </div>

          {/* Right — text content */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-10 lg:border-l lg:border-gold/10"
          >
            <p className="section-kicker">{messages.conservation.eyebrow}</p>
            <h2 className="section-title mt-5">{messages.conservation.title}</h2>
            <p className="section-copy mt-5">{messages.conservation.subtitle}</p>
            <p className="mt-6 text-base leading-8 text-sand/78">
              {messages.conservation.manifesto}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {messages.conservation.badges.map((badge, index) => {
                const Icon = icons[index % icons.length]
                return (
                  <Badge
                    key={badge}
                    variant="secondary"
                    className="rounded-full border border-gold/14 bg-white/5 px-3 py-2 text-sm text-sand"
                  >
                    <Icon className="size-3.5 text-gold" />
                    {badge}
                  </Badge>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* ── Bottom 3-column detail cards ─────────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-3">

          {/* Card 1 — manifesto quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="glass-panel rounded-[1.75rem] border border-gold/10 p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold/80">
              Our Commitment
            </p>
            <p className="mt-4 text-base leading-7 text-sand/78">
              {messages.conservation.manifesto}
            </p>
          </motion.div>

          {/* Card 2 — GrayFishTag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
            className="glass-panel rounded-[1.75rem] border border-gold/10 p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold/80">
                  GrayFishTag
                </p>
                <p className="mt-3 text-sm leading-7 text-sand/72">
                  Tag-and-release stewardship keeps sport-fishing impact visible and measurable.
                </p>
              </div>
              {LOGO_GRAYFSHTAG_URL ? (
                <Image
                  alt="GrayFishTag logo"
                  src={LOGO_GRAYFSHTAG_URL}
                  width={56}
                  height={56}
                  className="flex-shrink-0 rounded-full bg-white/10 object-contain p-1"
                />
              ) : (
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
                  <Fish className="size-6 text-gold" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Card 3 — IGFA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.16 }}
            className="glass-panel rounded-[1.75rem] border border-gold/10 p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold/80">
                  IGFA
                </p>
                <p className="mt-3 text-sm leading-7 text-sand/72">
                  Handling cues and release-first framing reinforce premium care on the water.
                </p>
              </div>
              {LOGO_IGFA_URL ? (
                <Image
                  alt="IGFA logo"
                  src={LOGO_IGFA_URL}
                  width={56}
                  height={56}
                  className="flex-shrink-0 rounded-full bg-white/10 object-contain p-1"
                />
              ) : (
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
                  <ShieldCheck className="size-6 text-gold" />
                </div>
              )}
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  )
}
