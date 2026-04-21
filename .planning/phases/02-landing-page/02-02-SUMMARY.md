---
plan: "02-02"
status: completed
updated: 2026-04-14
---

## Summary

Wave 2 filled in the landing page’s content-heavy sections. The page now has a read-only availability route and modal shell, a seasons chart, testimonials with certification media, a searchable FAQ with the `gaff:open-chat` contract, crew cards, the final CTA, and the footer with contact, social, map, and legal links.

## Key Files

- `src/lib/landing-data.ts`
- `src/app/api/landing/availability/route.ts`
- `src/components/landing/AvailabilityCalendarSection.tsx`
- `src/components/landing/FishingSeasonsSection.tsx`
- `src/components/landing/TestimonialsSection.tsx`
- `src/components/landing/FAQSection.tsx`
- `src/components/landing/CrewSection.tsx`
- `src/components/landing/CTASection.tsx`
- `src/components/landing/Footer.tsx`
- `src/app/page.tsx`

## Verification

- `npm run type-check` ✅
- `npm run lint` ✅

## Notes

- `gaff:booking-started` is emitted from the availability dialog shell.
- `gaff:open-chat` is emitted from the FAQ CTA and used later by the Botpress bridge.
