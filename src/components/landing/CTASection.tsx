"use client"

import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { motion, type Variants } from "framer-motion"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"

const CTA_BG = "https://res.cloudinary.com/dtqelgtco/image/upload/v1777344379/Cabo_BG_xwya7n.png"

const contentVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export function CTASection() {
  const { messages } = useLanguage()

  return (
    <section id="cta" className="landing-section scroll-mt-24 pt-0">
      <div className="landing-grid">
        <motion.div
          className="glass-panel relative overflow-hidden rounded-[2rem] border border-gold/10"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="relative min-h-[26rem]">
            <Image
              alt="Panoramic GAFF charter scene in Los Cabos"
              src={CTA_BG}
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,30,0.2)_0%,rgba(7,17,30,0.78)_100%)]" />
            <motion.div
              className="relative z-10 flex min-h-[26rem] flex-col justify-end p-8 sm:p-10"
              variants={contentVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <motion.p variants={itemVariants} className="section-kicker">
                {messages.cta.eyebrow}
              </motion.p>
              <motion.h2 variants={itemVariants} className="section-title mt-5 max-w-3xl">
                {messages.cta.title}
              </motion.h2>
              <motion.p variants={itemVariants} className="section-copy mt-5 max-w-2xl">
                {messages.cta.subtitle}
              </motion.p>
              <motion.div variants={itemVariants} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  render={<a href="#availability" />}
                  size="lg"
                  className="rounded-full bg-gold px-6 text-sm font-semibold text-navy hover:bg-gold/90"
                >
                  {messages.cta.primaryCta}
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  render={<a href="#faq" />}
                  size="lg"
                  variant="outline"
                  className="rounded-full border-gold/20 bg-white/4 px-6 text-sm font-semibold text-white hover:bg-white/8"
                >
                  {messages.cta.secondaryCta}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
