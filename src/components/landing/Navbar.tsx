"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowRight, Menu } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useLanguage } from "@/contexts/LanguageContext"
import { cn } from "@/lib/utils"

const navigationAnchors = [
  { href: "#fleet", key: "fleet" },
  { href: "#availability", key: "availability" },
  { href: "#seasons", key: "seasons" },
  { href: "#faq", key: "faq" },
  { href: "#crew", key: "crew" },
  { href: "#conservation", key: "conservation" },
] as const

export function Navbar() {
  const pathname = usePathname()
  const { lang, setLang, messages } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const isHomePage = pathname === "/"
  const primaryCtaHref = isHomePage ? "#availability" : "/booking"

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 48)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-gold/12 bg-navy/80 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="landing-grid">
        <div className="flex h-20 items-center justify-between gap-4">
          <Link href="/" className="flex flex-col leading-none text-white">
            <span className="font-heading text-3xl tracking-[0.08em]">GAFF</span>
            <span className="text-[0.68rem] uppercase tracking-[0.36em] text-sand/60">
              {messages.nav.brand}
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {navigationAnchors.map((item) => (
              <a
                key={item.href}
                href={isHomePage ? item.href : `/${item.href}`}
                className="text-sm font-medium text-sand/82 hover:text-white"
              >
                {messages.nav.links[item.key]}
              </a>
            ))}
            <Link href="/blog" className="text-sm font-medium text-sand/82 hover:text-white">
              {messages.nav.links.blog}
            </Link>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="flex rounded-full border border-gold/20 bg-white/4 p-1 backdrop-blur">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.18em] text-sand/70 transition",
                  lang === "en" && "bg-gold text-navy"
                )}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("es")}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.18em] text-sand/70 transition",
                  lang === "es" && "bg-gold text-navy"
                )}
              >
                ES
              </button>
            </div>
            <Button
              render={<a href={primaryCtaHref} />}
              size="lg"
              className="rounded-full bg-gold px-5 text-sm font-semibold text-navy hover:bg-gold/90"
            >
              {messages.nav.primaryCta}
              <ArrowRight className="size-4" />
            </Button>
          </div>

          <Sheet>
            <SheetTrigger
              render={
                <button
                  type="button"
                  className="inline-flex size-11 items-center justify-center rounded-full border border-gold/20 bg-white/4 text-white backdrop-blur lg:hidden"
                  aria-label="Open navigation"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="border-l border-gold/14 bg-navy/96 px-0 text-white"
            >
              <SheetHeader className="border-b border-gold/12 px-6 pb-6">
                <SheetTitle className="font-heading text-3xl text-white">GAFF</SheetTitle>
                <SheetDescription className="text-sand/65">
                  {messages.nav.languageLabel}
                </SheetDescription>
              </SheetHeader>
              <div className="px-6 py-6">
                <div className="mb-6 flex rounded-full border border-gold/20 bg-white/4 p-1 backdrop-blur">
                  <button
                    type="button"
                    onClick={() => setLang("en")}
                    className={cn(
                      "flex-1 rounded-full px-3 py-2 text-xs font-semibold tracking-[0.18em] text-sand/70 transition",
                      lang === "en" && "bg-gold text-navy"
                    )}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang("es")}
                    className={cn(
                      "flex-1 rounded-full px-3 py-2 text-xs font-semibold tracking-[0.18em] text-sand/70 transition",
                      lang === "es" && "bg-gold text-navy"
                    )}
                  >
                    ES
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  {navigationAnchors.map((item) => (
                    <a
                      key={item.href}
                      href={isHomePage ? item.href : `/${item.href}`}
                      className="rounded-2xl px-4 py-3 text-sm font-medium text-sand/84 hover:bg-white/6 hover:text-white"
                    >
                      {messages.nav.links[item.key]}
                    </a>
                  ))}
                  <Link
                    href="/blog"
                    className="rounded-2xl px-4 py-3 text-sm font-medium text-sand/84 hover:bg-white/6 hover:text-white"
                  >
                    {messages.nav.links.blog}
                  </Link>
                </div>
                <Button
                  render={<a href={primaryCtaHref} />}
                  size="lg"
                  className="mt-6 w-full rounded-full bg-gold text-sm font-semibold text-navy hover:bg-gold/90"
                >
                  {messages.nav.primaryCta}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  )
}
