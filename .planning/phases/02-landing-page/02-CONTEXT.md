# Phase 2: Landing Page - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Build all landing page sections (LAND-01 through LAND-10) for gaffallfishingloscabos.com: a premium, fast-loading English-primary landing page with a Spanish toggle for US tourists seeking sport-fishing charters in Los Cabos. Phase 2 must pass Lighthouse > 90, LCP < 2.5s, include full SEO metadata, and wire the marketing analytics needed on the landing page. The availability experience is read-only in this phase: users can inspect dates, choose a boat, and open a prefilled booking modal shell, but the real booking form, checkout, persistence, and booking-completed event remain Phase 3 work.

</domain>

<decisions>
## Implementation Decisions

### Sections
- **D-01:** 10 sections in order: Hero -> Fleet -> Availability Calendar -> Fishing Seasons -> Testimonials -> FAQ -> Crew -> Conservation -> Final CTA -> Footer
- **D-02:** Each section lives in `src/components/landing/` as its own file (for example `HeroSection.tsx`, `FleetSection.tsx`)
- **D-03:** Availability calendar (LAND-03) is a read-only, real-time-style experience in Phase 2. The UI fetches mock availability from a dedicated landing data source or route on load and refresh, clicking a date opens a modal placeholder that Phase 3 fills with the booking form, and no booking persistence happens yet.

### Animation and Scroll
- **D-04:** Framer Motion drives all animations (hero stagger, FAQ transitions, stat counters, section reveals)
- **D-05:** Lenis smooth scroll is configured globally in `src/app/layout.tsx` (PERF-04)
- **D-06:** Fleet cards use CSS perspective/transform for 3D hover on desktop and Embla on mobile

### Media
- **D-07:** Cloudinary is the canonical media source for landing assets. Use Cloudinary-backed `next/image` or `next-cloudinary` with auto-format WebP and quality auto transforms for every media-bearing landing section, not just the hero.
- **D-08:** Hero video must be < 5MB via Cloudinary transformation
- **D-09:** Placeholder Cloudinary assets are acceptable in Phase 2; the client can replace them later with real GAFF photos and video

### Bilingual Support
- **D-10:** English default with a Spanish toggle, not a separate route. State may live in React context or another lightweight client wrapper.
- **D-11:** No full i18n library in Phase 2. Use a simple translation object in `src/lib/translations.ts`.

### SEO
- **D-12:** Use the Next.js Metadata API for all meta tags
- **D-13:** Embed `TouristAttraction` and `LocalBusiness` JSON-LD in `src/app/layout.tsx`
- **D-14:** Implement `src/app/sitemap.ts`
- **D-15:** Implement `src/app/robots.ts`

### Analytics and Chat Launcher
- **D-16:** GA4 is installed via `@next/third-parties/google`
- **D-17:** Meta Pixel and TikTok Pixel load with `strategy="afterInteractive"` so they do not block LCP
- **D-18:** Phase 2 fires `pageview` and `booking_started`. `lead_captured` and `booking_completed` are Phase 3+ because the form and checkout do not exist yet.
- **D-19:** The FAQ `Chat with us` CTA must open the Botpress web widget when Botpress config is present. Full Botpress knowledge-base, lead capture, and automation work stays in Phase 5.

### Performance
- **D-20:** JavaScript bundle must stay under 200KB gzipped. Use dynamic imports for heavy below-fold sections, and lazy-load all non-critical media/scripts.

### Agent's Discretion
- Exact color palette and typography within the approved premium fishing-charter direction
- Fishing seasons chart implementation details (hand-rolled SVG is preferred over a large chart library)
- FAQ tab layout and search affordances
- Footer map embed implementation details (iframe preferred unless a lighter alternative is justified)

</decisions>

<specifics>
## Specific Ideas

- Build pack section 4 defines the hero headline: `Los Cabos' Premier Sport Fishing Experience`
- Build pack section 4 defines the four boat categories: Standard, Midsize, Large, Luxury
- Build pack section 4 defines the species for the seasons chart: Marlin, Tuna, Dorado, Wahoo, Roosterfish
- Approved stat counters: `500+ Trips`, `4.9 Rating`, `15+ Years`
- The navbar transitions from transparent to solid with backdrop blur after the hero scroll threshold
- Testimonials must include certification logos in addition to quotes and counters

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Landing page spec
- `c:\Users\angel\Downloads\GAFF_ALL_FISHING_BUILD_PACK_1.md` section 4 - landing page copy, layout, and interaction details
- `c:\Users\angel\Downloads\GAFF_ALL_FISHING_BUILD_PACK_1.md` section 5 - performance and SEO requirements
- `c:\Users\angel\Downloads\GAFF_ALL_FISHING_BUILD_PACK_1.md` section 6 - Cloudinary integration guidance

### Project requirements
- `.planning/REQUIREMENTS.md` - LAND-01 through LAND-10, PERF-01 through PERF-04, SEO-01 through SEO-04, INTG-03, INTG-06
- `.planning/ROADMAP.md` - Phase 2 success criteria

### Foundation outputs
- `src/components/ui/` - shadcn components already installed (button, card, dialog, sheet, accordion, tabs, calendar, badge, separator, scroll-area, tooltip)
- `src/lib/utils.ts` - `cn()` helper
- `src/lib/constants.ts` - site/contact constants

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/button.tsx` - CTA buttons
- `src/components/ui/card.tsx` - fleet, testimonial, and crew card base
- `src/components/ui/accordion.tsx` - FAQ base
- `src/components/ui/dialog.tsx` - booking modal shell
- `src/components/ui/tabs.tsx` - FAQ categories
- `src/components/ui/calendar.tsx` - landing availability base
- `src/components/ui/badge.tsx` - crew certifications and testimonial logos
- `src/components/ui/tooltip.tsx` - seasons chart tooltips

### Established Patterns
- Path alias `@/*` -> `src/*`
- All landing components belong in `src/components/landing/`
- Use `cn()` for class merging

### Integration Points
- Phase 3 swaps the read-only landing availability source for the real booking API and fills the modal with the booking form
- Phase 3 wires `lead_captured` and `booking_completed`
- Phase 5 expands the Botpress widget shell into the full chat and lead-capture workflow

</code_context>

<deferred>
## Deferred Ideas

- Booking modal form logic - Phase 3
- Real availability data from Neon - Phase 3
- Lead capture and booking completion analytics events - Phase 3
- Botpress knowledge-base automation and lead capture - Phase 5
- Real boat and crew media from the client - can be added later through Cloudinary
- Full next-intl style i18n framework - deferred
- Cookie consent banner for pixels - deferred to pre-launch

</deferred>

---

*Phase: 02-landing-page*
*Context gathered: 2026-04-13*
