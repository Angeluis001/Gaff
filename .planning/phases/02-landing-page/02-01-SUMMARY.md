---
plan: "02-01"
status: completed
updated: 2026-04-14
---

## Summary

Wave 1 replaced the starter homepage with a branded landing foundation. The root layout now mounts `SmoothScroll` and `LanguageProvider`, the landing visual system lives in `src/app/globals.css`, and the first real sections are implemented in `Navbar`, `HeroSection`, `FleetSection`, and `ConservationSection`.

## Key Files

- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/app/page.tsx`
- `src/components/SmoothScroll.tsx`
- `src/contexts/LanguageContext.tsx`
- `src/lib/translations.ts`
- `src/components/landing/Navbar.tsx`
- `src/components/landing/HeroSection.tsx`
- `src/components/landing/FleetSection.tsx`
- `src/components/landing/ConservationSection.tsx`

## Verification

- `npm run type-check` ✅
- `npm run lint` ✅

## Notes

- Hero media now prefers Cloudinary and falls back to a poster treatment if the video budget cannot be confirmed.
- The translation scaffold covers all landing sections so downstream plans can consume a stable copy contract.
