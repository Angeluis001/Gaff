# Phase 2: Landing Page - Research

**Researched:** 2026-04-13
**Domain:** Next.js 15 App Router landing page — animation, media, SEO, analytics, performance
**Confidence:** HIGH (stack verified against npm registry; patterns verified against installed source)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** 10 sections in order: Hero → Fleet → Availability Calendar → Fishing Seasons → Testimonials → FAQ → Crew → Conservation → Final CTA → Footer
- **D-02:** Each section lives in `src/components/landing/` as its own file
- **D-03:** Availability calendar reads from a static/mock availability state in Phase 2. Clicking opens a modal placeholder.
- **D-04:** Framer Motion for all animations (staggerChildren on hero headline, AnimatePresence on FAQ accordion, animated stats counters)
- **D-05:** Lenis smooth scroll configured globally in `src/app/layout.tsx`
- **D-06:** Fleet cards use CSS perspective/transform for 3D hover on desktop; embla-carousel on mobile
- **D-07:** Cloudinary for all images and videos — Next.js Image component with Cloudinary loader, auto-format WebP, quality auto
- **D-08:** Hero video must be < 5MB; use Cloudinary video transformation to enforce
- **D-09:** Placeholder Cloudinary assets acceptable in Phase 2
- **D-10:** English default; Spanish via toggle (not a separate route). State managed with React context or simple useState in layout.
- **D-11:** No i18n library — simple key/value translation object in `src/lib/translations.ts`
- **D-12:** Next.js Metadata API for all meta tags — no third-party SEO library
- **D-13:** Schema.org JSON-LD type `TouristAttraction` + `LocalBusiness` in `src/app/layout.tsx`
- **D-14:** sitemap.xml via `src/app/sitemap.ts`
- **D-15:** robots.txt via `src/app/robots.ts`
- **D-16:** GA4 via `@next/third-parties/google`
- **D-17:** Meta Pixel + TikTok Pixel via Next.js Script with `strategy="afterInteractive"`
- **D-18:** Events: `pageview` (auto), `booking_started` (calendar date click), `lead_captured` (Phase 3+)
- **D-19:** JS bundle < 200KB gzipped — dynamic imports for heavy sections
- **D-20:** All images use `next/image` with `priority` above-fold, `loading="lazy"` below

### Claude's Discretion

- Exact color palette and typography (build pack specifies dark navy + gold)
- Fishing Seasons chart implementation (SVG animated bars — Recharts or hand-rolled SVG)
- FAQ tab layout details
- Footer Google Maps embed implementation

### Deferred Ideas (OUT OF SCOPE)

- Booking modal form logic — Phase 3
- Real availability data from Neon — Phase 3
- Botpress widget embed — Phase 5
- Real boat/crew photos from client — added via Cloudinary any time
- Full next-intl i18n framework
- Cookie consent banner for pixels
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LAND-01 | Hero section: < 5MB video, Framer Motion staggerChildren headline, Book Now + Watch Video CTAs, transparent-to-solid navbar | Sections 1, 2, 3, 10 |
| LAND-02 | Fleet: 4 boat category cards, 3D hover, embla mobile carousel, price display, Book CTA | Sections 4, 5 |
| LAND-03 | Availability calendar: day-level status colors (green/amber/red), per-boat filtering, click-to-book modal placeholder | Section 6 |
| LAND-04 | Fishing seasons chart: SVG animated bars per species, current month highlighted, tooltip | Section 7 |
| LAND-05 | Testimonials carousel, animated stat counters (trips/rating/years), certification logos | Sections 4, 8 |
| LAND-06 | FAQ: tabbed categories, real-time client-side search, AnimatePresence accordion, Chat CTA | Sections 2, 9 |
| LAND-07 | Crew section: photo cards, experience, specialty, certification badges on hover | Sections 2, 5 |
| LAND-08 | Conservation section: catch-and-release video, IGFA + GrayFishTag badges | Section 3 |
| LAND-09 | Final CTA: panoramic background image, booking prompt | Sections 2, 5 |
| LAND-10 | Footer: Google Maps embed, phone, email, social links, legal links | Section 11 |
| PERF-01 | Lighthouse Performance > 90 | Section 10 |
| PERF-02 | LCP < 2.5s, FID < 100ms, CLS < 0.1 | Section 10 |
| PERF-03 | JS bundle < 200KB gzipped | Section 10 |
| PERF-04 | Lenis smooth scroll configured globally | Section 3 |
| SEO-01 | SEO metadata via Next.js Metadata API | Section 12 |
| SEO-02 | Schema.org JSON-LD TouristAttraction in layout | Section 12 |
| SEO-03 | Canonical URLs, robots meta, sitemap.xml | Section 12 |
| SEO-04 | Bilingual EN/ES toggle | Section 13 |
| INTG-03 | Cloudinary for all media: auto-format WebP, quality auto | Section 3 |
| INTG-06 | GA4 + Meta Pixel + TikTok Pixel installed, events firing | Section 14 |
</phase_requirements>

---

## Summary

Phase 2 builds a premium single-page landing experience on an already-scaffolded Next.js 15 + React 19 foundation. The critical dependency discovery is that **none of the Phase 2 animation/scroll/media libraries are installed** — framer-motion, lenis, embla-carousel-react, next-cloudinary, and @next/third-parties are all absent from package.json. Installation is the first task.

All five missing libraries are React 19 compatible as of their current latest versions. The most nuanced integration is Lenis in App Router: it requires a `"use client"` wrapper component and a `useEffect`-based RAF loop to cooperate with Next.js's server rendering. Framer Motion v12 (latest) is fully React 19 compatible and continues to use the same `motion.div` + `AnimatePresence` API — no breaking changes to the patterns the build pack specifies.

The availability calendar is a Phase 2-specific architectural decision: the existing shadcn `calendar.tsx` wraps `react-day-picker` v9 (already installed at v9.14.0) and is the right base. It needs custom day rendering to show green/amber/red status dots via the `components.Day` prop — no replacement needed. The fishing seasons chart should be hand-rolled SVG with Framer Motion `motion.rect` animations: Recharts is not installed, weighs ~100KB, and a static 5-species chart does not justify the bundle cost.

**Primary recommendation:** Install 5 missing packages first, then build sections in the order defined in the ROADMAP plans: (1) Hero + Fleet + Conservation in plan 02-01, (2) remaining 7 sections in plan 02-02, (3) SEO + analytics + optimization pass in plan 02-03.

---

## Critical Finding: Missing Dependencies

The `package.json` does NOT contain these libraries referenced in CONTEXT.md decisions:

| Library | Decision | Status |
|---------|----------|--------|
| `framer-motion` | D-04 (all animations) | NOT INSTALLED |
| `lenis` | D-05 (smooth scroll) | NOT INSTALLED |
| `embla-carousel-react` | D-06 (fleet mobile carousel) | NOT INSTALLED |
| `embla-carousel-autoplay` | D-06 (carousel autoplay) | NOT INSTALLED |
| `next-cloudinary` | D-07 (Cloudinary loader) | NOT INSTALLED |
| `@next/third-parties` | D-16 (GA4) | NOT INSTALLED |

**These must be installed before any section implementation task begins.**

```bash
npm install framer-motion lenis embla-carousel-react embla-carousel-autoplay next-cloudinary @next/third-parties
```

---

## Standard Stack

### Core (verified against npm registry 2026-04-13)

| Library | Latest Version | Install Status | Purpose |
|---------|---------------|----------------|---------|
| `framer-motion` | 12.38.0 | NEEDS INSTALL | All animations: staggerChildren, AnimatePresence, motion.div, whileHover, useInView |
| `lenis` | 1.3.21 | NEEDS INSTALL | Global smooth scroll in layout |
| `embla-carousel-react` | 8.6.0 | NEEDS INSTALL | Fleet mobile carousel |
| `embla-carousel-autoplay` | 8.6.0 | NEEDS INSTALL | Testimonials carousel autoplay |
| `next-cloudinary` | 6.17.5 | NEEDS INSTALL | `CldImage` and `CldVideoPlayer` with auto-format/quality |
| `@next/third-parties` | 16.2.3 | NEEDS INSTALL | `GoogleAnalytics` component for GA4 |
| `react-day-picker` | 9.14.0 | ALREADY INSTALLED | Base for availability calendar (used by shadcn calendar.tsx) |
| `date-fns` | 4.1.0 | ALREADY INSTALLED | Date utilities for calendar |
| `lucide-react` | 1.8.0 | ALREADY INSTALLED | Icons throughout sections |

### shadcn Components (already installed in `src/components/ui/`)

| Component | File | Phase 2 Use |
|-----------|------|-------------|
| `accordion.tsx` | `src/components/ui/accordion.tsx` | FAQ accordion base (wrap with AnimatePresence) |
| `badge.tsx` | `src/components/ui/badge.tsx` | Crew certification badges |
| `button.tsx` | `src/components/ui/button.tsx` | All CTAs: Book Now, Watch Video, Chat with us |
| `calendar.tsx` | `src/components/ui/calendar.tsx` | Availability calendar base (extend with custom day renderer) |
| `card.tsx` | `src/components/ui/card.tsx` | Fleet boat cards, crew cards |
| `dialog.tsx` | `src/components/ui/dialog.tsx` | Booking modal shell (Phase 3 fills it) |
| `tabs.tsx` | `src/components/ui/tabs.tsx` | FAQ category tabs |
| `tooltip.tsx` | `src/components/ui/tooltip.tsx` | Fishing seasons chart tooltips |
| `sheet.tsx` | `src/components/ui/sheet.tsx` | Mobile nav drawer |
| `scroll-area.tsx` | `src/components/ui/scroll-area.tsx` | Scrollable content areas |
| `separator.tsx` | `src/components/ui/separator.tsx` | Section dividers |

### What NOT to Install

| Problem | Do NOT Install | Use Instead |
|---------|---------------|-------------|
| Fishing seasons chart | Recharts (~100KB gzipped) | Hand-rolled SVG + Framer Motion motion.rect |
| Smooth scroll | `@studio-freight/lenis` (old fork) | `lenis` (official, same author, actively maintained) |
| Google Fonts | `@fontsource/*` packages | `next/font/google` (zero layout shift, already in layout.tsx) |
| Motion animations | `motion` npm package | `framer-motion` (same package, same version, build pack specifies framer-motion) |
| i18n | `next-intl`, `react-i18next` | Simple key/value object in `src/lib/translations.ts` (D-11) |

---

## Section 1: Framer Motion in Next.js 15 App Router

[VERIFIED: npm registry — framer-motion@12.38.0 peerDependencies: react ^18 || ^19]

### Server Component Compatibility

`motion.div` and all Framer Motion components are client-only. Any component that uses them MUST have `"use client"` at the top. The pattern for Next.js App Router:

- Server components (layout.tsx, page.tsx) remain server components
- Animated section components each have their own `"use client"` directive
- Do NOT put `"use client"` in layout.tsx — it forces the entire layout to the client

```typescript
// src/components/landing/HeroSection.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
// ...
```

### staggerChildren Pattern for Hero Headline

```typescript
// Source: framer-motion docs pattern (VERIFIED usage in npm package)
"use client";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function HeroSection() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants}>GAFF ALL FISHING</motion.h1>
      <motion.p variants={itemVariants}>Los Cabos' Premier Sport Fishing Experience</motion.p>
      <motion.div variants={itemVariants}>{/* CTAs */}</motion.div>
    </motion.div>
  );
}
```

### AnimatePresence for FAQ Accordion

The shadcn `Accordion` component uses Radix UI primitives internally. The correct pattern is to wrap the shadcn Accordion content with Framer Motion `AnimatePresence` + `motion.div` **inside** the AccordionContent, not wrapping the whole Accordion component:

```typescript
"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

// AccordionContent renders conditionally — use forceMount to keep DOM present
// then animate opacity/height with motion.div inside
export function FAQSection() {
  const [openItem, setOpenItem] = React.useState<string>("");

  return (
    <Accordion type="single" collapsible value={openItem} onValueChange={setOpenItem}>
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent forceMount>
            <AnimatePresence initial={false}>
              {openItem === faq.id && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <p className="pb-4">{faq.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
```

**WARNING:** Do not use `overflow: hidden` on the AccordionContent wrapper — Radix already manages display:none. The `forceMount` prop keeps the DOM node present so AnimatePresence can animate exit.

### useInView for Scroll-Triggered Animations

Framer Motion's `useInView` hook is the correct approach for scroll-triggered animations (stat counters, section entrances). Do NOT use `IntersectionObserver` manually — it creates the same result with more code.

```typescript
"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function StatCounter({ value, label }: { value: string; label: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6 }}
    >
      <span>{value}</span>
      <span>{label}</span>
    </motion.div>
  );
}
```

### 3D Hover on Fleet Cards

```typescript
"use client";
import { motion, useMotionValue, useTransform } from "framer-motion";

export function BoatCard({ boat }: { boat: Boat }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [8, -8]);
  const rotateY = useTransform(x, [-100, 100], [-8, 8]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000"
    >
      {/* card content */}
    </motion.div>
  );
}
```

Add `perspective: 1000px` via Tailwind arbitrary value `[perspective:1000px]` on a parent wrapper.

---

## Section 2: Lenis Smooth Scroll in Next.js 15 App Router

[VERIFIED: npm registry — lenis@1.3.21]

### Critical: Lenis Requires "use client" Wrapper

Lenis uses `requestAnimationFrame` and `window` — both browser-only APIs. It CANNOT be initialized in a server component. The correct pattern for App Router is a dedicated `SmoothScroll` client component that wraps children in layout.tsx:

```typescript
// src/components/SmoothScroll.tsx
"use client";
import Lenis from "lenis";
import { useEffect } from "react";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

```typescript
// src/app/layout.tsx — remains a SERVER component
import { SmoothScroll } from "@/components/SmoothScroll";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
```

### Does Lenis Conflict with Framer Motion Scroll?

[ASSUMED] Lenis and Framer Motion scroll utilities (useScroll, useTransform) can conflict because Lenis intercepts native scroll events and re-emits them via its own RAF loop. Framer Motion's `useScroll` by default listens to the native scroll event. To make them coexist, pass the Lenis instance's scroll position to Framer Motion via a `useMotionValue` that updates in the Lenis RAF callback. For Phase 2, the simpler approach is: use Lenis for global smooth scrolling, and use Framer Motion `useInView` (not `useScroll`) for all scroll-triggered animations. This avoids the conflict entirely and is the recommended pattern for this project.

**Do NOT use Framer Motion's `useScroll` hook for parallax or scroll-driven animations in Phase 2** — use `useInView` with `once: true` for entrance animations, and CSS for the navbar transparency transition.

### Navbar Transparent-to-Solid Transition

Use a simple `useEffect` with a scroll event listener for the navbar state — not Framer Motion's `useScroll` (to avoid Lenis conflict):

```typescript
"use client";
import { useEffect, useState } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 z-50 w-full transition-all duration-300",
      scrolled
        ? "bg-navy/95 backdrop-blur-md shadow-lg"
        : "bg-transparent"
    )}>
      {/* nav content */}
    </nav>
  );
}
```

---

## Section 3: Cloudinary Next.js Integration

[VERIFIED: npm registry — next-cloudinary@6.17.5, peerDependencies: next ^12-15, react ^17-19]

### Use `next-cloudinary` (Not a Custom Loader)

`next-cloudinary` provides `CldImage` and `CldVideoPlayer` components that wrap `next/image` with Cloudinary-specific transformation props. This is the correct approach per D-07.

```typescript
// src/lib/cloudinary.ts
// No additional config needed beyond env vars.
// next-cloudinary reads NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME automatically.
```

Required env vars (add to `.env.local`):
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### CldImage for All Section Images

```typescript
// src/components/landing/FleetSection.tsx
"use client"; // required if using client hooks; can be server component if no interactivity
import { CldImage } from "next-cloudinary";

export function FleetSection() {
  return (
    <CldImage
      src="gaff/boats/standard-31ft"  // Cloudinary public_id (no extension)
      width={800}
      height={600}
      alt="Standard fishing boat, 31ft, up to 4 guests"
      format="auto"         // auto WebP/AVIF
      quality="auto"        // Cloudinary quality auto
      sizes="(max-width: 768px) 100vw, 50vw"
      priority             // for above-fold images
    />
  );
}
```

**Key difference from next/image:** `src` takes a Cloudinary `public_id` (not a URL), and `format="auto"` + `quality="auto"` are Cloudinary-specific props that trigger server-side transformation. The resulting URL is like: `https://res.cloudinary.com/{cloud}/image/upload/f_auto,q_auto/{public_id}`.

### Hero Video Under 5MB via Cloudinary Transformation

Use Cloudinary's video transformation parameters directly in the URL, not CldVideoPlayer for the hero background (CldVideoPlayer adds player chrome; hero background needs a raw `<video>` tag):

```typescript
// src/components/landing/HeroSection.tsx
// Hero background video — raw HTML5 video with Cloudinary transformation URL
const HERO_VIDEO_URL = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/q_auto:low,w_1280,vc_h264/${HERO_VIDEO_PUBLIC_ID}.mp4`;

export function HeroSection() {
  return (
    <div className="relative h-screen overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        // preload="none" for mobile to prevent blocking LCP
        preload="none"
      >
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </video>
      {/* overlay and content */}
    </div>
  );
}
```

**Cloudinary transformation params that enforce < 5MB:**
- `q_auto:low` — aggressive quality reduction
- `w_1280` — cap width at 1280px
- `vc_h264` — H.264 codec (broad browser support)
- `br_2m` — optional: cap bitrate at 2Mbps

For the conservation section catch-and-release video, use `CldVideoPlayer` with `autoPlay={false}` and `controls`.

### next.config.ts: Add Cloudinary Domain

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
```

---

## Section 4: embla-carousel-react

[VERIFIED: npm registry — embla-carousel-react@8.6.0, peerDependencies: react ^16.8.0 || ^17 || ^18 || ^19]

React 19 is fully supported. Version 8.6.0 is the current latest and is compatible with the project's React 19.1.0.

### Fleet Mobile Carousel Setup

```typescript
// src/components/landing/FleetSection.tsx
"use client";
import useEmblaCarousel from "embla-carousel-react";

export function FleetCarousel({ boats }: { boats: Boat[] }) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  });

  return (
    <div className="overflow-hidden md:hidden" ref={emblaRef}>
      <div className="flex">
        {boats.map((boat) => (
          <div key={boat.id} className="min-w-0 flex-[0_0_85%] mr-4">
            <BoatCard boat={boat} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

The desktop fleet grid (4 cards in a row with 3D hover) should be a separate component visible only on `md:grid` and hidden on mobile with `md:hidden` on the carousel.

### Testimonials Carousel with Autoplay

```typescript
"use client";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

export function TestimonialsCarousel() {
  const [emblaRef] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );
  // ...
}
```

---

## Section 5: Availability Calendar (LAND-03)

[VERIFIED: src/components/ui/calendar.tsx — uses react-day-picker v9 DayPicker with custom components prop]
[VERIFIED: npm registry — react-day-picker@9.14.0, peerDependencies: react >=16.8.0]

### Use the Existing shadcn Calendar — Do NOT Replace It

The existing `calendar.tsx` wraps `react-day-picker@9` with custom classNames and the `components` prop. This is the correct base for the availability calendar. Add per-day status coloring via the `modifiers` and `modifiersClassNames` props of DayPicker, which the shadcn wrapper passes through via `...props`.

### Custom Day Status Pattern (react-day-picker v9)

```typescript
// src/components/landing/AvailabilityCalendar.tsx
"use client";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

// Phase 2: static mock data. Phase 3 replaces with API.
const mockAvailability: Record<string, "available" | "limited" | "booked"> = {
  "2026-04-15": "available",
  "2026-04-16": "limited",
  "2026-04-17": "booked",
  // ...
};

export function AvailabilityCalendar() {
  const [selected, setSelected] = useState<Date | undefined>();

  const availableDays = Object.entries(mockAvailability)
    .filter(([, status]) => status === "available")
    .map(([date]) => new Date(date));

  const limitedDays = Object.entries(mockAvailability)
    .filter(([, status]) => status === "limited")
    .map(([date]) => new Date(date));

  const bookedDays = Object.entries(mockAvailability)
    .filter(([, status]) => status === "booked")
    .map(([date]) => new Date(date));

  return (
    <Calendar
      mode="single"
      selected={selected}
      onSelect={(date) => {
        setSelected(date);
        if (date) {
          // Fire GA4 event (D-18: booking_started)
          // Open modal placeholder (Phase 3 fills with form)
        }
      }}
      modifiers={{
        available: availableDays,
        limited: limitedDays,
        booked: bookedDays,
      }}
      modifiersClassNames={{
        available: "rdp-day-available",
        limited: "rdp-day-limited",
        booked: "rdp-day-booked",
      }}
      disabled={bookedDays}
      fromDate={new Date()}  // disable past dates
    />
  );
}
```

Add CSS to `globals.css`:
```css
/* Availability calendar status colors */
.rdp-day-available { @apply bg-green-500/20 text-green-700 font-semibold; }
.rdp-day-limited  { @apply bg-amber-500/20 text-amber-700 font-semibold animate-pulse; }
.rdp-day-booked   { @apply bg-red-500/20 text-red-600 line-through opacity-60; }
```

**Important:** react-day-picker v9 uses CSS module classes like `rdp-day-*` — verify class names against installed version. The shadcn calendar.tsx already uses `getDefaultClassNames()` which provides the base class map. Custom modifiers prepend to the base classes.

---

## Section 6: Fishing Seasons Chart (LAND-04)

**Recommendation: Hand-rolled SVG with Framer Motion `motion.rect`**

Recharts (3.8.1 latest) weighs approximately 100KB gzipped. For a static 5-species monthly availability chart with simple bar animation, this is not justified. Hand-rolled SVG is ~0KB additional bundle cost.

```typescript
// src/components/landing/FishingSeasonsChart.tsx
"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CURRENT_MONTH = new Date().getMonth(); // 0-indexed

const SPECIES_DATA = [
  {
    name: "Marlin",
    // 1 = peak season, 0.5 = available, 0 = off season
    months: [0, 0, 0, 0.3, 0.5, 1, 1, 1, 1, 1, 0.7, 0.3],
    color: "#D4A843", // gold
  },
  {
    name: "Tuna",
    months: [0, 0, 0, 0.3, 1, 1, 1, 1, 1, 1, 1, 0.5],
    color: "#62B6CB", // teal
  },
  {
    name: "Dorado",
    months: [0, 0, 0, 0, 0.3, 1, 1, 1, 1, 0.7, 0.3, 0],
    color: "#4CAF50",
  },
  {
    name: "Wahoo",
    months: [0, 0, 0, 0, 0, 0.3, 1, 1, 1, 1, 0.7, 0.3],
    color: "#9C27B0",
  },
  {
    name: "Roosterfish",
    months: [0.3, 0.5, 0.7, 1, 1, 1, 1, 1, 1, 1, 0.7, 0.5],
    color: "#E07A5F", // coral
  },
];

const BAR_HEIGHT = 24;
const BAR_GAP = 8;
const LABEL_WIDTH = 90;
const CHART_WIDTH = 600;
const COL_WIDTH = (CHART_WIDTH - LABEL_WIDTH) / 12;

export function FishingSeasonsChart() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${SPECIES_DATA.length * (BAR_HEIGHT + BAR_GAP) + 40}`}
        className="w-full min-w-[400px]"
        aria-label="Fishing seasons chart"
      >
        {/* Month headers */}
        {MONTHS.map((month, i) => (
          <text
            key={month}
            x={LABEL_WIDTH + i * COL_WIDTH + COL_WIDTH / 2}
            y={16}
            textAnchor="middle"
            fontSize={10}
            fill={i === CURRENT_MONTH ? "#D4A843" : "#94a3b8"}
            fontWeight={i === CURRENT_MONTH ? "bold" : "normal"}
          >
            {month}
          </text>
        ))}

        {/* Current month highlight column */}
        <rect
          x={LABEL_WIDTH + CURRENT_MONTH * COL_WIDTH}
          y={24}
          width={COL_WIDTH}
          height={SPECIES_DATA.length * (BAR_HEIGHT + BAR_GAP)}
          fill="#D4A843"
          opacity={0.1}
          rx={2}
        />

        {/* Species rows */}
        {SPECIES_DATA.map((species, rowIndex) => {
          const y = 30 + rowIndex * (BAR_HEIGHT + BAR_GAP);
          return (
            <g key={species.name}>
              <text x={0} y={y + BAR_HEIGHT / 2 + 4} fontSize={12} fill="#e2e8f0">
                {species.name}
              </text>
              {species.months.map((intensity, monthIndex) => (
                <motion.rect
                  key={monthIndex}
                  x={LABEL_WIDTH + monthIndex * COL_WIDTH + 2}
                  y={y}
                  width={COL_WIDTH - 4}
                  height={BAR_HEIGHT}
                  rx={4}
                  fill={species.color}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={isInView ? { opacity: intensity === 0 ? 0.1 : intensity, scaleX: 1 } : {}}
                  transition={{ duration: 0.6, delay: rowIndex * 0.1 + monthIndex * 0.02 }}
                  style={{ transformOrigin: `${LABEL_WIDTH + monthIndex * COL_WIDTH}px ${y}px` }}
                />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
```

---

## Section 7: Bilingual Toggle (No i18n Library)

[Decision D-10, D-11 — no library, simple translation object]

### Pattern: React Context + Translation Object

```typescript
// src/lib/translations.ts
export type Language = "en" | "es";

export const translations = {
  en: {
    hero: {
      headline: "Los Cabos' Premier Sport Fishing Experience",
      subheadline: "The Ultimate Deep Sea Adventure Awaits",
      bookNow: "Book Your Trip",
      watchVideo: "Watch Video",
    },
    fleet: {
      title: "Our Fleet",
      subtitle: "Choose Your Perfect Vessel",
    },
    // ... all section strings
  },
  es: {
    hero: {
      headline: "La Premier Experiencia de Pesca Deportiva en Los Cabos",
      subheadline: "La Aventura en Alta Mar Te Espera",
      bookNow: "Reserva Tu Viaje",
      watchVideo: "Ver Video",
    },
    // ES strings — stub initially, fill in Phase 2
  },
} satisfies Record<Language, typeof translations["en"]>;
```

```typescript
// src/contexts/LanguageContext.tsx
"use client";
import { createContext, useContext, useState } from "react";
import type { Language } from "@/lib/translations";

const LanguageContext = createContext<{
  lang: Language;
  setLang: (l: Language) => void;
}>({ lang: "en", setLang: () => {} });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
```

```typescript
// Usage in any section:
"use client";
import { useLang } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";

export function HeroSection() {
  const { lang } = useLang();
  const t = translations[lang].hero;
  return <h1>{t.headline}</h1>;
}
```

Add `<LanguageProvider>` to `SmoothScroll.tsx` or create a separate `Providers.tsx` client component that wraps both. Do NOT put providers directly in `layout.tsx` body — keep layout.tsx as a server component.

### Language Toggle Button in Navbar

```typescript
"use client";
import { useLang } from "@/contexts/LanguageContext";

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "es" : "en")}
      className="text-sm font-medium"
      aria-label="Toggle language"
    >
      {lang === "en" ? "ES" : "EN"}
    </button>
  );
}
```

---

## Section 8: Analytics — GA4, Meta Pixel, TikTok Pixel

[VERIFIED: npm registry — @next/third-parties@16.2.3, exports: ./google only]

### GA4 via @next/third-parties

```typescript
// src/app/layout.tsx (server component — GoogleAnalytics is internally a client component)
import { GoogleAnalytics } from "@next/third-parties/google";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SmoothScroll>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </SmoothScroll>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />
      </body>
    </html>
  );
}
```

**`@next/third-parties/google` GoogleAnalytics component:**
- Internally uses `strategy="afterInteractive"` — does not block LCP [VERIFIED: package exports confirmed]
- Automatically handles the gtag script loading
- `gaId` prop takes the `G-XXXXXXXXXX` measurement ID

### Firing Custom Events (D-18: booking_started)

`@next/third-parties` exposes a `sendGAEvent` helper for custom events:

```typescript
"use client";
import { sendGAEvent } from "@next/third-parties/google";

// In AvailabilityCalendar.tsx, when date is selected:
function handleDateSelect(date: Date) {
  sendGAEvent("event", "booking_started", {
    date: date.toISOString().split("T")[0],
  });
}
```

### Meta Pixel via Next.js Script

```typescript
// src/app/layout.tsx — add alongside GoogleAnalytics
import Script from "next/script";

// In the layout body:
<Script
  id="meta-pixel"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
      fbq('track', 'PageView');
    `,
  }}
/>
```

### TikTok Pixel via Next.js Script

```typescript
<Script
  id="tiktok-pixel"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
        ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
        ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
        for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
        ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
        ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
        var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;
        var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load('${process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID}');
        ttq.page();
      }(window, document, 'ttq');
    `,
  }}
/>
```

**Performance note:** Both Meta and TikTok pixels use `strategy="afterInteractive"` which defers loading until after hydration. This means they do NOT block LCP — confirmed pattern for meeting PERF-01/PERF-02. [ASSUMED — based on Next.js Script strategy documentation, not tested in this session]

---

## Section 9: Schema.org JSON-LD in Next.js 15

[VERIFIED: build pack §3.5 specifies TouristAttraction type]

### Pattern: Inline script in layout.tsx (Server Component)

The best pattern for Next.js 15 App Router is a `<script type="application/ld+json">` tag directly in the server-rendered layout. No client component needed — JSON-LD is pure HTML:

```typescript
// src/app/layout.tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TouristAttraction",
      name: "GAFF All Fishing Los Cabos",
      description: "Premier sport fishing charters in Cabo San Lucas, Mexico",
      url: "https://gaffallfishingloscabos.com",
      telephone: "+52-624-XXX-XXXX",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Cabo San Lucas Marina",
        addressLocality: "Cabo San Lucas",
        addressRegion: "Baja California Sur",
        addressCountry: "MX",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 22.8905,
        longitude: -109.9167,
      },
      image: "https://gaffallfishingloscabos.com/og-image.jpg",
      priceRange: "$$-$$$$",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "500",
        bestRating: "5",
      },
      sameAs: [
        "https://instagram.com/gaffallfishing",
        "https://facebook.com/gaffallfishing",
        "https://tripadvisor.com/gaffallfishing",
      ],
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://gaffallfishingloscabos.com/#business",
      name: "GAFF All Fishing Los Cabos",
      url: "https://gaffallfishingloscabos.com",
      telephone: "+52-624-XXX-XXXX",
      priceRange: "$$-$$$$",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Cabo San Lucas",
        addressRegion: "Baja California Sur",
        addressCountry: "MX",
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        opens: "06:00",
        closes: "18:00",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>...</body>
    </html>
  );
}
```

Using `@graph` array allows combining TouristAttraction and LocalBusiness in a single script tag — this is the Schema.org recommended multi-type pattern.

---

## Section 10: Performance and Bundle Size

[VERIFIED: package.json — Next.js 15.5.15 with Turbopack enabled in dev AND build scripts]

### CRITICAL: Turbopack Does NOT Support @next/bundle-analyzer

The project uses `next dev --turbopack` and `next build --turbopack`. The `@next/bundle-analyzer` package wraps webpack — it is **incompatible with Turbopack builds**. [ASSUMED — based on Next.js 15 Turbopack documentation as of August 2025 training knowledge; verify against Next.js 15 release notes]

**Alternative bundle inspection options:**
1. Remove `--turbopack` from the build script temporarily to run bundle analysis with webpack
2. Use `next build` (without --turbopack) + `ANALYZE=true npx @next/bundle-analyzer` for a one-off check
3. Use Vercel's built-in build output size report in the Vercel dashboard

**Recommendation:** Do not install @next/bundle-analyzer as a dev dependency during Phase 2. Use `next build` output (`.next/` folder size report) and Vercel's deployment insights to verify bundle size.

### Dynamic Import Strategy (D-19)

Use `next/dynamic` with `ssr: false` for heavy client-only sections. Heavy sections to dynamically import:

```typescript
// src/app/page.tsx (server component)
import dynamic from "next/dynamic";
import { HeroSection } from "@/components/landing/HeroSection"; // above fold — NOT dynamic
import { FleetSection } from "@/components/landing/FleetSection"; // above fold — NOT dynamic

// Below-fold sections: dynamically imported
const AvailabilityCalendar = dynamic(
  () => import("@/components/landing/AvailabilityCalendar").then((m) => m.AvailabilityCalendar),
  { ssr: false, loading: () => <div className="h-96 animate-pulse bg-navy/20 rounded-lg" /> }
);

const FAQSection = dynamic(
  () => import("@/components/landing/FAQSection").then((m) => m.FAQSection),
  { ssr: false }
);

const FishingSeasonsChart = dynamic(
  () => import("@/components/landing/FishingSeasonsChart").then((m) => m.FishingSeasonsChart),
  { ssr: false }
);
```

**Do NOT dynamically import:**
- HeroSection (above fold, LCP element)
- FleetSection (second section, near fold)
- Navbar (always visible)

### Framer Motion Bundle Optimization

Framer Motion v12 supports tree-shaking. Import only what you use:

```typescript
// Good — tree-shakeable imports
import { motion, AnimatePresence, useInView } from "framer-motion";

// Bad — imports the entire library
import * as Framer from "framer-motion";
```

Framer Motion v12 gzipped is approximately 30-40KB. With tree-shaking and only the used APIs imported, real-world impact is closer to 15-25KB. [ASSUMED — specific gzip sizes from training knowledge]

### LCP Optimization for Hero Image/Video

- Hero video: `preload="none"` on mobile (prevents blocking), `preload="metadata"` on desktop
- If no video available (placeholder phase), use a hero image with `priority` on `next/image`
- Overlay: CSS `background: linear-gradient(...)` — no image, no request
- Font: already using `next/font/google` (Geist) — zero layout shift

### next.config.ts Additions for Phase 2

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    formats: ["image/avif", "image/webp"], // enable AVIF for non-Cloudinary images
  },
  // Note: experimental.optimizePackageImports reduces bundle size for icon libraries
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
```

---

## Section 11: Footer Google Maps Embed

**Recommendation: Static `<iframe>` embed (not @vis.gl/react-google-maps)**

`@vis.gl/react-google-maps` is for interactive map experiences requiring the full Maps JS API (~100KB). For a footer location pin, a static `<iframe>` embed from Google Maps is:
- Zero additional JS bundle
- No API key required (uses Maps Embed API which is free up to usage limits)
- No CLS if given explicit width/height

```typescript
// src/components/landing/Footer.tsx
export function Footer() {
  return (
    <footer>
      {/* ... other footer content ... */}
      <div className="aspect-video w-full overflow-hidden rounded-lg">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3682.3!2d-109.9167!3d22.8905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDUzJzI1LjgiTiAxMDnCsDU0JzYwLjEiVw!5e0!3m2!1sen!2sus!4v1"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"  // lazy load — below fold
          referrerPolicy="no-referrer-when-downgrade"
          title="GAFF All Fishing Los Cabos — Cabo San Lucas Marina"
        />
      </div>
    </footer>
  );
}
```

---

## Section 12: SEO Metadata (Next.js Metadata API)

[VERIFIED: build pack §3.5 provides exact metadata values]

```typescript
// src/app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://gaffallfishingloscabos.com"),
  title: {
    default: "GAFF All Fishing Los Cabos | Sport Fishing Charters in Cabo San Lucas",
    template: "%s | GAFF All Fishing Los Cabos",
  },
  description: "Book the best sport fishing charters in Cabo San Lucas. Deep sea fishing for Marlin, Tuna, Dorado & more. Premium boats, expert captains, unforgettable experiences.",
  keywords: [
    "cabo san lucas fishing",
    "sport fishing los cabos",
    "deep sea fishing cabo",
    "cabo fishing charters",
    "marlin fishing cabo san lucas",
    "best fishing charter cabo",
    "cabo fishing trips",
    "los cabos fishing boats",
    "cabo sportfishing",
    "fishing cabo mexico",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gaffallfishingloscabos.com",
    siteName: "GAFF All Fishing Los Cabos",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "GAFF All Fishing Los Cabos" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@gaffallfishing",
  },
  alternates: {
    canonical: "https://gaffallfishingloscabos.com",
    languages: { "es": "https://gaffallfishingloscabos.com?lang=es" },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};
```

### sitemap.ts

```typescript
// src/app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://gaffallfishingloscabos.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://gaffallfishingloscabos.com/privacy",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "https://gaffallfishingloscabos.com/terms",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
```

### robots.ts

```typescript
// src/app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] },
    ],
    sitemap: "https://gaffallfishingloscabos.com/sitemap.xml",
  };
}
```

---

## Section 13: Color Palette and Typography (Claude's Discretion)

The build pack specifies these exact values. The planner should treat them as locked:

```css
/* src/app/globals.css — CSS custom properties */
:root {
  --color-navy:   #0A1628;  /* Primary background, navbar */
  --color-ocean:  #1B4965;  /* Alternate section backgrounds */
  --color-teal:   #62B6CB;  /* Secondary accents, icons */
  --color-gold:   #D4A843;  /* Primary CTAs, highlights, headings */
  --color-sand:   #F5F0E8;  /* Light section backgrounds */
  --color-white:  #FFFFFF;  /* Text on dark backgrounds */
  --color-coral:  #E07A5F;  /* Alerts, hot lead badges */
}
```

**Typography:**
- Heading font: `Plus Jakarta Sans` (from Google Fonts via `next/font/google`)
- Body font: Keep existing `Geist` (already installed, already in layout.tsx — do NOT replace)
- Accent/mono font: Keep existing `Geist Mono` for price displays

**Implementation:** Replace Geist heading variable with Plus Jakarta Sans for display headings only. Keep Geist for body text to avoid doubling font download.

```typescript
// src/app/layout.tsx
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
});
```

---

## Architecture Patterns

### Recommended Component Structure

```
src/
├── app/
│   ├── layout.tsx              # Server: metadata, JSON-LD, SmoothScroll, providers
│   ├── page.tsx                # Server: section assembly with dynamic imports
│   ├── sitemap.ts              # Server: Next.js sitemap
│   ├── robots.ts               # Server: Next.js robots
│   └── globals.css             # CSS variables, Tailwind base, rdp-day-* overrides
├── components/
│   ├── landing/
│   │   ├── Navbar.tsx          # "use client" — scroll state, language toggle
│   │   ├── HeroSection.tsx     # "use client" — Framer Motion, video
│   │   ├── FleetSection.tsx    # "use client" — 3D hover + embla carousel
│   │   ├── AvailabilityCalendar.tsx  # "use client" — shadcn Calendar + mock data
│   │   ├── FishingSeasonsChart.tsx   # "use client" — SVG + Framer Motion
│   │   ├── TestimonialsSection.tsx   # "use client" — embla carousel
│   │   ├── FAQSection.tsx      # "use client" — Tabs + AnimatePresence accordion
│   │   ├── CrewSection.tsx     # "use client" — hover badge animation
│   │   ├── ConservationSection.tsx   # "use client" — CldVideoPlayer
│   │   ├── CTASection.tsx      # "use client" — Framer Motion entrance
│   │   └── Footer.tsx          # Server component (no interactivity needed)
│   ├── SmoothScroll.tsx        # "use client" — Lenis init wrapper
│   └── Providers.tsx           # "use client" — LanguageProvider wrapper
├── contexts/
│   └── LanguageContext.tsx     # "use client" — React context for EN/ES
└── lib/
    ├── translations.ts         # Pure TS — translation key/value objects
    └── constants.ts            # SITE_URL, CONTACT_PHONE, etc. (already exists)
```

### Anti-Patterns to Avoid

- **Putting `"use client"` in layout.tsx:** Forces the entire layout subtree to the client, destroying RSC benefits. Use wrapper components instead.
- **Using Framer Motion's `useScroll` with Lenis:** They conflict. Use `useInView` for scroll-triggered animations.
- **Importing Cloudinary SDK (`cloudinary` package) on the client:** The `cloudinary` npm package is Node.js-only (no browser build). `next-cloudinary` is the correct browser-compatible wrapper.
- **Wrapping shadcn Accordion with AnimatePresence at the root level:** AnimatePresence must wrap conditionally-rendered elements. Wrap the content inside AccordionContent, not the Accordion component itself.
- **Using `useState` in layout.tsx for language toggle:** layout.tsx is a server component — it cannot have hooks. Language state lives in `LanguageContext.tsx` (client component).

---

## Don't Hand-Roll

| Problem | Do NOT Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Smooth scroll | Custom scroll interception | `lenis` | Handles iOS momentum, accessibility, keyboard nav |
| Image optimization with Cloudinary | Custom `next/image` loader | `next-cloudinary` CldImage | Handles srcset, format negotiation, blur placeholder |
| Carousel accessibility | Custom swipe detection | `embla-carousel-react` | Handles touch, keyboard, ARIA out of the box |
| Scroll-triggered animations | IntersectionObserver manually | `framer-motion` useInView | Already installed, consistent timing curve |
| Calendar date picking | Custom date grid | react-day-picker (already installed via shadcn) | Handles locale, disabled dates, keyboard nav, ARIA |
| GA4 script loading | `<script>` tag in layout | `@next/third-parties/google` GoogleAnalytics | Handles strategy, prevents duplicate script injection |

---

## Common Pitfalls

### Pitfall 1: `@next/third-parties` version mismatch with Next.js version

**What goes wrong:** `@next/third-parties@16.2.3` is the latest. The project runs Next.js `15.5.15`. The latest `@next/third-parties` version (16.x) tracks the Next.js 16 beta series. The `backport` dist-tag (`15.5.15`) is the correct version for Next.js 15.
**Why it happens:** The `latest` tag points to the Next.js 16 beta version of the package.
**How to avoid:** Install with the backport tag: `npm install @next/third-parties@backport` — this installs `15.5.15` which matches the project's Next.js version.
**Warning signs:** TypeScript errors on `GoogleAnalytics` props; runtime errors about missing features.

### Pitfall 2: Lenis RAF loop not cleaned up on hot reload

**What goes wrong:** Lenis creates a `requestAnimationFrame` loop. In development, Next.js hot reloads cause the `useEffect` cleanup to run — but if the RAF ID is not cancelled correctly, multiple loops accumulate and cause scroll stuttering.
**How to avoid:** Always store the `requestAnimationFrame` return value and `cancelAnimationFrame` it in the cleanup:
```typescript
const rafId = requestAnimationFrame(raf);
return () => {
  cancelAnimationFrame(rafId);
  lenis.destroy();
};
```

### Pitfall 3: react-day-picker v9 CSS class name changes from v8

**What goes wrong:** Older tutorials show `rdp-day_selected`, `rdp-day_disabled` (underscores). react-day-picker v9 uses hyphenated class names like `rdp-day-selected`, `rdp-day-disabled`. Custom modifierClassNames must use the v9 convention.
**Warning signs:** Status colors not applying; console warnings about unknown modifiers.

### Pitfall 4: next-cloudinary CldImage requires public_id, not a URL

**What goes wrong:** Developers pass a full `https://res.cloudinary.com/...` URL to `CldImage`'s `src` prop. CldImage expects only the public_id (e.g., `"gaff/boats/standard"`).
**How to avoid:** Store only public_ids in the boat data constants, not full URLs. Generate transformation URLs through CldImage props.

### Pitfall 5: Hero video blocks LCP on mobile

**What goes wrong:** A `<video>` tag with `preload="auto"` or `preload="metadata"` triggers a network request on page load even on mobile — on 4G this delays LCP beyond 2.5s.
**How to avoid:** Use `preload="none"` on mobile (media query check), or serve a hero image as the LCP element and load video only after user interaction on mobile.
**Warning signs:** Lighthouse LCP flagging the video element; PageSpeed Insights mobile score below 90.

### Pitfall 6: AnimatePresence exit animations require the element to stay mounted

**What goes wrong:** AnimatePresence exit animations only work when the child is removed from the DOM while AnimatePresence is rendering it. If the parent component unmounts before AnimatePresence can run the exit animation, the animation never fires.
**How to avoid:** Wrap AnimatePresence around conditional renders at the correct level. For shadcn Accordion, use `forceMount` on AccordionContent so the DOM node persists, then control visibility with the motion animation.

### Pitfall 7: Turbopack in `next build` breaks some PostCSS plugins

**What goes wrong:** The project's `package.json` uses `next build --turbopack`. Some PostCSS plugins (especially older ones) are not Turbopack-compatible.
**Current project PostCSS:** Uses `@tailwindcss/postcss` (Tailwind v4 PostCSS plugin) — this is Turbopack-compatible. [ASSUMED — verify if issues arise]

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@studio-freight/lenis` | `lenis` (official package) | 2023 — same maintainer moved to official package | Use `lenis`, not `@studio-freight/lenis` |
| Custom `next/image` loaders for Cloudinary | `next-cloudinary` CldImage | 2022 — now the standard | CldImage handles srcset, format, quality automatically |
| react-day-picker `rdp-day_*` CSS (v8) | `rdp-day-*` CSS (v9) | v9.0 release 2023 | All custom calendar CSS must use hyphens not underscores |
| Framer Motion `useAnimation` + `controls.start()` | `useInView` + `animate` prop | Framer Motion v10+ | Simpler, no imperative control needed for scroll triggers |
| `<Script>` tags for GA4 | `@next/third-parties/google` GoogleAnalytics | Next.js 14.x+ | Official Next.js component, handles strategy and deduplication |

---

## Environment Availability

All required external tools are Node.js-based (npm packages). No external services need to be running for Phase 2 implementation beyond the Vercel/Neon setup completed in Phase 1. Cloudinary credentials are required env vars but the project uses placeholder assets in Phase 2 (D-09), so the Cloudinary account needs to exist with a cloud name but does not need actual GAFF media uploaded.

| Dependency | Required By | Available | Notes |
|------------|------------|-----------|-------|
| `framer-motion` | LAND-01, 02, 04, 05, 06 | Needs install | React 19 compatible |
| `lenis` | PERF-04 | Needs install | Replace `@studio-freight/lenis` if it appears |
| `embla-carousel-react` | LAND-02, 05 | Needs install | React 19 compatible |
| `next-cloudinary` | INTG-03 | Needs install | Next.js 15 compatible |
| `@next/third-parties` | INTG-06 | Needs install | Install `@backport` tag for Next.js 15 |
| Cloudinary account | INTG-03 | Assumed exists | Need `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` |
| GA4 Measurement ID | INTG-06 | Client provides | Need `NEXT_PUBLIC_GA_MEASUREMENT_ID` |
| Meta Pixel ID | INTG-06 | Client provides | Need `NEXT_PUBLIC_META_PIXEL_ID` |
| TikTok Pixel ID | INTG-06 | Client provides | Need `NEXT_PUBLIC_TIKTOK_PIXEL_ID` |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Lenis + Framer Motion useScroll conflict; useInView is safe | Section 3 | If wrong: no conflict exists; could use useScroll for parallax effects |
| A2 | Meta Pixel + TikTok Pixel `afterInteractive` strategy does not block LCP | Section 8 | If wrong: LCP regression; may need to defer further or remove pixels from layout |
| A3 | Framer Motion gzipped bundle is ~15-25KB with tree-shaking | Section 10 | If wrong (larger): need additional dynamic import splitting |
| A4 | @next/bundle-analyzer is incompatible with Turbopack build | Section 10 | If wrong: can use ANALYZE=true in build without removing --turbopack |
| A5 | `@tailwindcss/postcss` (Tailwind v4 PostCSS) is Turbopack-compatible | Pitfall 7 | If wrong: build errors; need to remove --turbopack from build script |

---

## Open Questions

1. **Cloudinary credentials availability**
   - What we know: Phase 2 uses placeholder assets (D-09); real media added later
   - What's unclear: Is a Cloudinary account already created with GAFF's cloud name?
   - Recommendation: Use a generic placeholder cloud name for Phase 2 development; add env var to Vercel before first deployment

2. **GA4 / Pixel IDs**
   - What we know: All three pixels need to fire on the landing page (D-16, D-17)
   - What's unclear: Whether the client has these accounts set up
   - Recommendation: Use placeholder `G-XXXXXXXXXX` values in `.env.local`; wire real IDs before launch

3. **Stats counter real values**
   - Build pack mentions "500+ Trips" and "4.9 Rating" but CONTEXT specifics says "15+ Years"
   - Recommendation: Use build pack values verbatim as static copy; define in `src/lib/constants.ts`

---

## Sources

### Primary (HIGH confidence)
- `npm view [package] version/peerDependencies` — all version and compatibility data verified 2026-04-13 against npm registry
- `d:/GAFF/package.json` — installed dependency baseline
- `d:/GAFF/src/components/ui/calendar.tsx` — confirmed react-day-picker v9 DayPicker usage
- `c:/Users/angel/Downloads/GAFF_ALL_FISHING_BUILD_PACK_1.md` §3 — section specs, color palette, typography, animation config
- `d:/GAFF/.planning/phases/02-landing-page/02-CONTEXT.md` — all locked decisions D-01 through D-20

### Secondary (MEDIUM confidence)
- Build pack §3.5 — SEO metadata values (exact title, description, keywords)
- Build pack §3.4 — Color palette and typography (exact hex values)
- shadcn calendar.tsx source — confirmed `components` prop and `modifiers` pass-through

### Tertiary (LOW confidence — see Assumptions Log)
- Lenis + Framer Motion scroll conflict (A1) — from training knowledge
- Bundle size estimates for framer-motion (A3) — from training knowledge
- Turbopack + @next/bundle-analyzer incompatibility (A4) — from training knowledge as of August 2025

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified against npm registry
- Architecture: HIGH — patterns derived from installed source files and verified peer dependencies
- Pitfalls: MEDIUM — most verified from source code inspection; some from training knowledge

**Research date:** 2026-04-13
**Valid until:** 2026-05-13 (30 days — stable libraries with infrequent breaking changes)
