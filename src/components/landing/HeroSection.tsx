"use client"

import { useEffect, useState } from "react"
import { ArrowDownRight, PlayCircle } from "lucide-react"
import { CldImage } from "next-cloudinary"
import { motion, useReducedMotion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"

const VIDEO_BUDGET_BYTES = 5_000_000

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
}

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.18,
    },
  },
}

function getCloudinaryBase(cloudName: string, resource: "image" | "video") {
  return `https://res.cloudinary.com/${cloudName}/${resource}/upload`
}

export function HeroSection() {
  const { messages } = useLanguage()
  const shouldReduceMotion = useReducedMotion()
  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const heroVideoId =
    process.env.NEXT_PUBLIC_CLOUDINARY_HERO_VIDEO_ID ??
    "gaff/landing/hero-marlin-run"
  const heroPosterId =
    process.env.NEXT_PUBLIC_CLOUDINARY_HERO_POSTER_ID ??
    "gaff/landing/hero-marlin-poster"

  const heroVideoUrl = cloudinaryCloudName
    ? `${getCloudinaryBase(
        cloudinaryCloudName,
        "video"
      )}/f_auto,q_auto:eco,vc_auto,br_900k,w_1600,c_fill/${heroVideoId}.mp4`
    : null

  const posterUrl = cloudinaryCloudName
    ? `${getCloudinaryBase(
        cloudinaryCloudName,
        "image"
      )}/f_auto,q_auto,w_1600,c_fill/${heroPosterId}.jpg`
    : null

  const [mediaMode, setMediaMode] = useState<"checking" | "video" | "poster">(
    heroVideoUrl ? "checking" : "poster"
  )

  useEffect(() => {
    if (!heroVideoUrl) {
      setMediaMode("poster")
      return
    }

    let cancelled = false

    const verifyBudget = async () => {
      try {
        const response = await fetch(heroVideoUrl, { method: "HEAD" })
        const contentLength = Number(response.headers.get("content-length") ?? 0)

        if (!cancelled) {
          setMediaMode(
            response.ok && contentLength > 0 && contentLength <= VIDEO_BUDGET_BYTES
              ? "video"
              : "poster"
          )
        }
      } catch {
        if (!cancelled) {
          setMediaMode("poster")
        }
      }
    }

    void verifyBudget()

    return () => {
      cancelled = true
    }
  }, [heroVideoUrl])

  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden px-0 pb-10 pt-28 sm:pb-16 sm:pt-32"
    >
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,rgba(98,182,203,0.18),transparent_34%),linear-gradient(180deg,#0b1829_0%,#08111d_40%,#08111d_100%)]" />
      <div className="absolute inset-x-0 top-20 -z-10 mx-auto h-56 w-[85vw] rounded-full bg-gold/10 blur-3xl" />

      <div className="landing-grid">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <motion.div
            variants={staggerChildren}
            initial="hidden"
            animate="visible"
            className="max-w-2xl"
          >
            <motion.p variants={fadeUp} className="section-kicker">
              {messages.hero.eyebrow}
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="mt-5 font-heading text-6xl leading-[0.9] text-white sm:text-7xl lg:text-[5.5rem]"
            >
              {messages.hero.title}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-xl text-lg leading-8 text-sand/78 sm:text-xl"
            >
              {messages.hero.subtitle}
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Button
                render={<a href="#availability" />}
                size="lg"
                className="rounded-full bg-gold px-6 text-sm font-semibold text-navy hover:bg-gold/90"
              >
                {messages.hero.primaryCta ?? "Book Now"}
                <ArrowDownRight className="size-4" />
              </Button>
              <Button
                render={
                  <a
                    href={mediaMode === "video" && heroVideoUrl ? heroVideoUrl : "#fleet"}
                    target={mediaMode === "video" ? "_blank" : undefined}
                    rel={mediaMode === "video" ? "noreferrer" : undefined}
                  />
                }
                size="lg"
                variant="outline"
                className="rounded-full border-gold/20 bg-white/3 px-6 text-sm font-semibold text-white hover:bg-white/8"
              >
                {messages.hero.secondaryCta ?? "Watch Video"}
                <PlayCircle className="size-4" />
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-6 flex items-center gap-2 text-sm text-sand/62"
            >
              <span className="h-2 w-2 rounded-full bg-teal shadow-[0_0_18px_rgba(98,182,203,0.7)]" />
              {messages.hero.availabilityHint}
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-10 grid gap-4 sm:grid-cols-3"
            >
              {messages.hero.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="glass-panel rounded-[1.5rem] px-5 py-4"
                >
                  <p className="font-heading text-4xl text-white">{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.28em] text-sand/54">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 42 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            id="hero-media"
            className="hero-shadow glass-panel relative min-h-[28rem] overflow-hidden rounded-[2rem] border border-gold/12"
          >
            {mediaMode === "video" && heroVideoUrl ? (
              <video
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster={posterUrl ?? undefined}
                onError={() => setMediaMode("poster")}
              >
                <source src={heroVideoUrl} type="video/mp4" />
              </video>
            ) : cloudinaryCloudName ? (
              <CldImage
                alt="Sport fishing boat cutting through the water in Los Cabos"
                src={heroPosterId}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 42vw, 100vw"
                crop="fill"
                gravity="auto"
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(98,182,203,0.24),transparent_35%),radial-gradient(circle_at_30%_25%,rgba(212,168,67,0.28),transparent_20%),linear-gradient(180deg,#163753_0%,#07111e_100%)]" />
            )}

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,30,0.08)_0%,rgba(7,17,30,0.22)_52%,rgba(7,17,30,0.82)_100%)]" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div className="max-w-md rounded-[1.5rem] border border-white/10 bg-navy/55 p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold/82">
                  Offshore Luxury
                </p>
                <p className="mt-3 font-heading text-3xl text-white">
                  Fast dock departure, tailored crews, and blue-water confidence.
                </p>
                <p className="mt-3 text-sm leading-7 text-sand/66">
                  Cloudinary-backed hero media stays optimized for launch, and the
                  poster fallback keeps the page premium even when the video budget
                  cannot be confirmed.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
