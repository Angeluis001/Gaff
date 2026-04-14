"use client"

import { Award, Star } from "lucide-react"
import { CldImage } from "next-cloudinary"
import { motion } from "framer-motion"

import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/LanguageContext"
import { crewProfiles } from "@/lib/landing-data"

export function CrewSection() {
  const { messages } = useLanguage()
  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  return (
    <section id="crew" className="landing-section scroll-mt-28 pt-0">
      <div className="landing-grid">
        <div className="mb-10 max-w-3xl">
          <p className="section-kicker">{messages.crew.eyebrow}</p>
          <h2 className="section-title mt-5">{messages.crew.title}</h2>
          <p className="section-copy mt-5">{messages.crew.subtitle}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {crewProfiles.map((captain) => (
            <motion.article
              key={captain.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              className="glass-panel overflow-hidden rounded-[1.75rem] border border-gold/10"
            >
              <div className="relative h-72">
                {cloudinaryCloudName ? (
                  <CldImage
                    alt={`${captain.name} captain portrait`}
                    src={captain.cloudinaryPublicId}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 30vw, 100vw"
                    crop="fill"
                    gravity="auto"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(98,182,203,0.24),transparent_40%),linear-gradient(180deg,#163753_0%,#07111e_100%)]" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,30,0)_20%,rgba(7,17,30,0.78)_100%)]" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold/76">
                    captain
                  </p>
                  <p className="mt-2 font-heading text-4xl text-white">
                    {captain.name}
                  </p>
                  <p className="text-sm text-sand/62">{captain.role}</p>
                </div>
              </div>
              <div className="space-y-4 p-6">
                <div className="flex items-center gap-3 text-sm text-sand/70">
                  <Star className="size-4 text-gold" />
                  <span>experience · {captain.experience}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-sand/70">
                  <Award className="size-4 text-teal" />
                  <span>specialty · {captain.specialty}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {captain.certifications.map((certification) => (
                    <Badge
                      key={certification}
                      variant="secondary"
                      className="rounded-full border border-gold/12 bg-white/4 px-3 py-1.5 text-sand"
                    >
                      {certification}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
