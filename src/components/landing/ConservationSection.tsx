"use client"

import { Fish, ShieldCheck, Waves } from "lucide-react"
import { CldImage } from "next-cloudinary"
import { motion } from "framer-motion"

import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/LanguageContext"

const icons = [Fish, ShieldCheck, Waves]

export function ConservationSection() {
  const { messages } = useLanguage()
  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  return (
    <section id="conservation" className="landing-section scroll-mt-28">
      <div className="landing-grid">
        <div className="glass-panel grid overflow-hidden rounded-[2rem] border border-gold/10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[24rem] border-b border-gold/10 lg:min-h-[32rem] lg:border-b-0 lg:border-r">
            {cloudinaryCloudName ? (
              <CldImage
                alt="Catch and release moment off the coast of Los Cabos"
                src="gaff/landing/conservation-release"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 46vw, 100vw"
                crop="fill"
                gravity="auto"
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(98,182,203,0.2),transparent_35%),linear-gradient(180deg,#1b4965_0%,#07111e_100%)]" />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,30,0.1)_0%,rgba(7,17,30,0.74)_100%)]" />
            <div className="absolute bottom-6 left-6 right-6 rounded-[1.5rem] border border-white/10 bg-navy/58 p-5 backdrop-blur">
              <p className="section-kicker">Conservation in Action</p>
              <p className="mt-3 font-heading text-3xl text-white">
                Every tagged marlin released is a data point for science and a victory for the future of sport fishing in Los Cabos.
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="px-6 py-8 sm:px-10 sm:py-10"
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

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-gold/10 bg-white/3 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold/78">
                  GrayFishTag
                </p>
                <p className="mt-3 text-sm leading-7 text-sand/72">
                  Tag-and-release stewardship keeps sport-fishing impact visible and
                  measurable.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-gold/10 bg-white/3 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold/78">
                  IGFA
                </p>
                <p className="mt-3 text-sm leading-7 text-sand/72">
                  Handling cues and release-first framing reinforce premium care on
                  the water.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
