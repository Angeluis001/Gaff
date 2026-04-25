"use client"

import { useRef } from "react"
import { motion, useInView, type Variants } from "framer-motion"
import { CldImage } from "next-cloudinary"

import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/LanguageContext"
import { certificationLogos, testimonialMedia } from "@/lib/landing-data"

const articleVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

function Counter({
  label,
  value,
}: {
  label: string
  value: string
}) {
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
  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

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
          <div className="flex snap-x gap-4 overflow-x-auto pb-2">
            {testimonialMedia.map((item) => (
              <motion.article
                key={item.guest}
                variants={articleVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                whileHover={{ y: -5, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                className="glass-panel min-w-[20rem] snap-start overflow-hidden rounded-[1.75rem] border border-gold/10 sm:min-w-[24rem]"
              >
                <div className="relative h-56 border-b border-gold/10">
                  {cloudinaryCloudName ? (
                    <CldImage
                      alt={`${item.guest} fishing trip photo`}
                      src={item.cloudinaryPublicId}
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 28rem, 20rem"
                      crop="fill"
                      gravity="auto"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(98,182,203,0.24),transparent_40%),linear-gradient(180deg,#163753_0%,#07111e_100%)]" />
                  )}
                </div>
                <div className="p-6">
                  <Badge className="rounded-full bg-gold text-navy">{item.trip}</Badge>
                  <p className="mt-4 text-lg leading-8 text-sand/84">“{item.quote}”</p>
                  <p className="mt-5 text-sm font-semibold text-white">{item.guest}</p>
                  <p className="text-sm text-sand/58">{item.location}</p>
                </div>
              </motion.article>
            ))}
          </div>

          <aside className="glass-panel rounded-[1.75rem] border border-gold/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold/76">
              Certification logo wall
            </p>
            <div className="mt-5 space-y-3">
              {certificationLogos.map((logo) => (
                <div
                  key={logo.name}
                  className="flex items-center gap-3 rounded-[1.25rem] border border-gold/10 bg-white/3 p-3"
                >
                  {cloudinaryCloudName ? (
                    <CldImage
                      alt={`${logo.name} logo`}
                      src={logo.cloudinaryPublicId}
                      width={56}
                      height={56}
                      className="rounded-full bg-white/80 object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                      logo
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white">{logo.name}</p>
                    <p className="text-sm text-sand/60">Badge-backed trust signal</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
