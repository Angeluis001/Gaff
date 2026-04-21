---
plan: "03-01"
status: completed
updated: 2026-04-14
---

## Summary

Wave 1 replaced the landing placeholder with a real booking foundation. The repo now has a booking domain layer for validation, pricing, fleet sync, availability, and pending booking creation; a live `/api/booking/availability` route; a real `/api/booking` write path; and a public `/booking` page powered by a shared booking form.

## Key Files

- `src/lib/booking/validation.ts`
- `src/lib/booking/pricing.ts`
- `src/lib/booking/fleet-sync.ts`
- `src/lib/booking/availability.ts`
- `src/lib/booking/create-booking.ts`
- `src/app/api/booking/availability/route.ts`
- `src/app/api/booking/route.ts`
- `src/components/booking/BookingForm.tsx`
- `src/components/booking/DatePicker.tsx`
- `src/components/booking/BoatSelector.tsx`
- `src/app/booking/page.tsx`
- `src/components/landing/AvailabilityCalendarSection.tsx`

## Verification

- `npm run type-check` passed
- `npm run lint` passed
- `npm run build` passed

## Notes

- Booking routes return a clear `503` response when `DATABASE_URL` is not configured instead of crashing the app.
- Redis-backed rate limiting now degrades safely when Upstash credentials are absent.
- Fleet data is bootstrapped from the current landing catalog so Phase 3 can sell real boats without duplicating catalog definitions by hand.
