"use client"

import { useRef, useState } from "react"
import { Anchor, ArrowDownRight, Fish, Star } from "lucide-react"
import { CldImage } from "next-cloudinary"
import { motion, useReducedMotion, type Variants } from "framer-motion"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
}

const staggerChildren: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.18 },
  },
}

function getCloudinaryBase(cloudName: string, resource: "image" | "video") {
  return `https://res.cloudinary.com/${cloudName}/${resource}/upload`
}

function AnimatedOceanBg() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Deep navy base */}
      <div className="absolute inset-0 bg-[#05111e]" />

      {/* Deep water colour masses */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: "radial-gradient(ellipse 90% 65% at 15% 75%, rgba(10,40,80,0.85), transparent)" }}
      />
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.85, 0.45, 0.85] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ background: "radial-gradient(ellipse 65% 85% at 85% 25%, rgba(8,30,62,0.75), transparent)" }}
      />

      {/* Teal shafts — sunlight filtering through water */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.1, 0.3, 0.1], x: ["-3%", "3%", "-3%"] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: "radial-gradient(ellipse 50% 40% at 38% 35%, rgba(98,182,203,0.4), transparent)" }}
      />
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.06, 0.22, 0.06], x: ["4%", "-4%", "4%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        style={{ background: "radial-gradient(ellipse 42% 58% at 70% 65%, rgba(98,182,203,0.28), transparent)" }}
      />

      {/* Gold surface glint */}
      <motion.div
        className="absolute inset-x-0 top-0 h-1/2"
        animate={{ opacity: [0.03, 0.12, 0.03] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{ background: "radial-gradient(ellipse 75% 55% at 55% 0%, rgba(212,168,67,0.22), transparent)" }}
      />

      {/* Very subtle scan lines for depth texture */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,rgba(255,255,255,0.7) 0px,rgba(255,255,255,0.7) 1px,transparent 1px,transparent 7px)" }}
      />
    </div>
  )
}

export function HeroSection() {
  const { messages } = useLanguage()
  const shouldReduceMotion = useReducedMotion()
  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const heroVideoId = process.env.NEXT_PUBLIC_CLOUDINARY_HERO_VIDEO_ID ?? "gaff/landing/hero-marlin-run"
  const heroPosterId = process.env.NEXT_PUBLIC_CLOUDINARY_HERO_POSTER_ID ?? "gaff/landing/hero-marlin-poster"

  const heroVideoUrl =
    process.env.NEXT_PUBLIC_HERO_VIDEO_URL ??
    (cloudinaryCloudName
      ? `${getCloudinaryBase(cloudinaryCloudName, "video")}/f_auto,q_auto:eco,vc_auto,br_900k,w_1920,c_fill/${heroVideoId}.mp4`
      : null)

  const posterUrl = cloudinaryCloudName
    ? `${getCloudinaryBase(cloudinaryCloudName, "image")}/f_auto,q_auto,w_1920,c_fill/${heroPosterId}.jpg`
    : null

  const [mediaMode, setMediaMode] = useState<"video" | "poster">(
    heroVideoUrl ? "video" : "poster"
  )
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <section
      id="hero"
      className="relative isolate min-h-screen overflow-hidden px-0 pb-16 pt-28 sm:pt-32"
    >
      {/* ── Full-bleed background ─────────────────────────────────────── */}
      <div className="absolute inset-0 -z-20">
        {mediaMode === "video" && heroVideoUrl ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            autoPlay
            muted
            playsInline
            poster={posterUrl ?? undefined}
            onEnded={() => {
              if (videoRef.current) {
                videoRef.current.currentTime = 0
                videoRef.current.pause()
              }
            }}
            onError={() => setMediaMode("poster")}
          >
            <source src={heroVideoUrl} type="video/mp4" />
          </video>
        ) : cloudinaryCloudName ? (
          <CldImage
            alt="Sport fishing boat in Los Cabos"
            src={heroPosterId}
            fill
            className="object-cover"
            sizes="100vw"
            crop="fill"
            gravity="auto"
          />
        ) : (
          <AnimatedOceanBg />
        )}
      </div>

      {/* ── Overlay layers ────────────────────────────────────────────── */}
      {/* Vignette + readability */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,17,30,0.55)_0%,rgba(5,17,30,0.28)_45%,rgba(5,17,30,0.72)_100%)]" />
      {/* Left-side text legibility */}
      <div className="absolute inset-y-0 left-0 -z-10 w-2/3 bg-[linear-gradient(to_right,rgba(5,17,30,0.55),transparent)]" />
      {/* Gold haze at top */}
      <div className="absolute inset-x-0 top-16 -z-10 mx-auto h-56 w-[70vw] rounded-full bg-gold/8 blur-3xl" />

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="landing-grid">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">

          {/* Left — text */}
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
              className="mt-6 max-w-xl text-lg leading-8 text-sand/80 sm:text-xl"
            >
              {messages.hero.subtitle}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                render={<a href="#availability" />}
                size="lg"
                className="rounded-full bg-gold px-6 text-sm font-semibold text-navy hover:bg-gold/90"
              >
                {messages.hero.primaryCta ?? "Book Now"}
                <ArrowDownRight className="size-4" />
              </Button>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10 grid gap-4 sm:grid-cols-3">
              {messages.hero.stats.map((stat) => (
                <div key={stat.label} className="glass-panel rounded-[1.5rem] px-5 py-4 backdrop-blur">
                  <p className="font-heading text-4xl text-white">{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.28em] text-sand/54">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — premium glass info card */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 42 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: "easeOut", delay: 0.3 }}
            className="hero-shadow glass-panel relative overflow-hidden rounded-[2rem] border border-gold/14 p-8 backdrop-blur-xl sm:p-10"
          >
            {/* Inner glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,168,67,0.07),transparent_65%)]" />

            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.38em] text-gold/80">
                Offshore Luxury
              </p>
              <p className="mt-4 font-heading text-[2rem] leading-tight text-white">
                Fast dock departure, tailored crews, and blue-water confidence.
              </p>
              <p className="mt-4 text-sm leading-7 text-sand/62">
                From the marina by 6:30&nbsp;AM, into the blue water where marlin,
                tuna, and dorado are waiting.
              </p>

              <div className="mt-6 space-y-2.5">
                {[
                  { Icon: Anchor, label: "Cabo San Lucas Marina", sub: "Departure 6:30 AM daily" },
                  { Icon: Fish,   label: "Marlin · Tuna · Dorado · Wahoo", sub: "Peak season year-round" },
                  { Icon: Star,   label: "4.9 stars · 500+ trips", sub: "Verified guest reviews" },
                ].map(({ Icon, label, sub }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 rounded-[1.25rem] border border-gold/10 bg-white/4 px-4 py-3"
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-teal" />
                    <div>
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs text-sand/50">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                render={<a href="#availability" />}
                size="lg"
                className="mt-7 w-full rounded-full bg-gold text-sm font-semibold text-navy hover:bg-gold/90"
              >
                Check availability
                <ArrowDownRight className="size-4" />
              </Button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
