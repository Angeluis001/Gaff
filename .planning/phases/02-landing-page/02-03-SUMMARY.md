---
plan: "02-03"
status: completed
updated: 2026-04-14
---

## Summary

Wave 3 completed the crawlable and legal surface. The root layout now exposes full metadata plus JSON-LD for `TouristAttraction` and `LocalBusiness`, `robots.ts` and `sitemap.ts` are in place, `/privacy-policy` and `/terms-of-service` resolve cleanly, and `public/og-image.jpg` exists for sharing cards.

## Key Files

- `src/app/layout.tsx`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/app/privacy-policy/page.tsx`
- `src/app/terms-of-service/page.tsx`
- `public/og-image.jpg`

## Verification

- `npm run type-check` ✅
- `npm run lint` ✅
- `Test-Path public/og-image.jpg` ✅

## Notes

- Metadata alternates map the Spanish toggle strategy to a query-based alternate.
- Manual rendered-source verification is still recommended on a deployed preview.
