"use client"

import { ArrowRight } from "lucide-react"
import { CldImage } from "next-cloudinary"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { ctaMedia } from "@/lib/landing-data"

export function CTASection() {
  const { messages } = useLanguage()
  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  return (
    <section id="cta" className="landing-section scroll-mt-28 pt-0">
      <div className="landing-grid">
        <div className="glass-panel relative overflow-hidden rounded-[2rem] border border-gold/10">
          <div className="relative min-h-[26rem]">
            {cloudinaryCloudName ? (
              <CldImage
                alt="Panoramic GAFF charter scene in Los Cabos"
                src={ctaMedia.cloudinaryPublicId}
                fill
                className="object-cover"
                sizes="100vw"
                crop="fill"
                gravity="auto"
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(98,182,203,0.24),transparent_35%),linear-gradient(180deg,#163753_0%,#07111e_100%)]" />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,30,0.2)_0%,rgba(7,17,30,0.78)_100%)]" />
            <div className="relative z-10 flex min-h-[26rem] flex-col justify-end p-8 sm:p-10">
              <p className="section-kicker">{messages.cta.eyebrow}</p>
              <h2 className="section-title mt-5 max-w-3xl">{messages.cta.title}</h2>
              <p className="section-copy mt-5 max-w-2xl">{messages.cta.subtitle}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
