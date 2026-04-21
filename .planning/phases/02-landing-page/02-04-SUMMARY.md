---
plan: "02-04"
status: completed
updated: 2026-04-14
---

## Summary

Wave 4 added env-guarded analytics and Botpress launcher infrastructure, and the landing route now builds successfully in production mode. `AnalyticsScripts` mounts GA4 plus after-interactive pixel shells, `BotpressWidgetBridge` listens for `gaff:open-chat`, and `trackBookingStarted` bridges the availability event into the analytics helpers. The deployed Vercel preview renders correctly in manual browser review, which clears the phase to continue while deeper functionality checks are scheduled as follow-up.

## Key Files

- `src/components/AnalyticsScripts.tsx`
- `src/components/BotpressWidgetBridge.tsx`
- `src/lib/analytics.ts`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `.env.example`

## Automated Verification

- `npm run type-check` ✅
- `npm run lint` ✅
- `npm run build` ✅

## Build Evidence

- Landing route build output: `Size 220 kB`, `First Load JS 350 kB`
- Shared JS reported by build: `145 kB`
- Build completed successfully after replacing the unsupported `useEffectEvent` usage in the navbar scroll logic

## Manual Verification Status

- Vercel preview deploy renders correctly in browser review
- Lighthouse Performance > 90: deferred
- LCP < 2.5s: deferred
- CLS < 0.1: deferred
- INP < 200ms: deferred
- Browser verification of GA4 / Meta / TikTok firing when IDs are present: deferred
- Browser verification that FAQ `Chat with us` opens the Botpress widget when config is present: deferred

## Notes

- The build still prints non-blocking Upstash Redis env warnings from pre-existing project code outside the landing-page path.
- Phase is clear to continue, but release hardening should include the deferred performance and browser-event checks before final production polish.
