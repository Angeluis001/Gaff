import Link from "next/link"
import { eq } from "drizzle-orm"

import { Button } from "@/components/ui/button"
import { BookingConfirmationTracker } from "@/components/booking/BookingConfirmationTracker"
import { db } from "@/lib/db"
import { bookings, boats, leads } from "@/lib/db/schema"

function notConfigured() {
  return (
    <main className="landing-shell min-h-screen px-4 py-28 sm:px-6">
      <div className="glass-panel mx-auto max-w-3xl rounded-[2rem] px-8 py-10 text-center">
        <p className="section-kicker">Confirmation</p>
        <h1 className="section-title mt-4">Booking confirmation is waiting on env setup</h1>
        <p className="section-copy mt-4">
          Stripe and database credentials need to be configured before the confirmation
          page can resolve live booking data.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            render={<Link href="/" />}
            className="rounded-full bg-gold px-6 text-navy hover:bg-gold/90"
          >
            Go Home
          </Button>
          <Button
            render={<Link href="/#availability" />}
            variant="outline"
            className="rounded-full border-gold/20 bg-white/4 px-6 text-white hover:bg-white/8"
          >
            Check Availability
          </Button>
        </div>
      </div>
    </main>
  )
}

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  if (!process.env.DATABASE_URL) {
    return notConfigured()
  }

  const resolvedSearchParams = await searchParams
  const sessionId =
    typeof resolvedSearchParams.session_id === "string"
      ? resolvedSearchParams.session_id
      : undefined

  if (!sessionId) {
    return notConfigured()
  }

  const [booking] = await db
    .select({
      id: bookings.id,
      date: bookings.date,
      tripType: bookings.tripType,
      guests: bookings.guests,
      depositAmount: bookings.depositAmount,
      status: bookings.status,
      boatName: boats.name,
      firstName: leads.firstName,
      lastName: leads.lastName,
    })
    .from(bookings)
    .innerJoin(boats, eq(bookings.boatId, boats.id))
    .leftJoin(leads, eq(bookings.leadId, leads.id))
    .where(eq(bookings.stripeSessionId, sessionId))

  return (
    <main className="landing-shell min-h-screen px-4 py-28 sm:px-6">
      <div className="glass-panel mx-auto max-w-3xl rounded-[2rem] px-8 py-10">
        <p className="section-kicker">Booking confirmed</p>
        <h1 className="section-title mt-4">
          {booking
            ? `See you in Cabo, ${booking.firstName ?? "angler"}`
            : "Your payment was received"}
        </h1>
        <p className="section-copy mt-4">
          {booking
            ? "Your deposit is confirmed and your boat has been reserved."
            : "We could not resolve the booking record for this Stripe session yet."}
        </p>

        {booking ? (
          <div className="mt-8 rounded-[1.5rem] border border-gold/10 bg-white/3 p-6 text-sand/82">
            <BookingConfirmationTracker bookingId={booking.id} sessionId={sessionId} />
            <p>
              <span className="font-semibold text-white">Boat:</span> {booking.boatName}
            </p>
            <p>
              <span className="font-semibold text-white">Date:</span>{" "}
              {booking.date.toISOString().slice(0, 10)}
            </p>
            <p>
              <span className="font-semibold text-white">Trip type:</span>{" "}
              {booking.tripType.replace("_", " ")}
            </p>
            <p>
              <span className="font-semibold text-white">Guests:</span> {booking.guests}
            </p>
            <p>
              <span className="font-semibold text-white">Deposit paid:</span> $
              {booking.depositAmount ?? "0.00"}
            </p>
            <p>
              <span className="font-semibold text-white">Status:</span> {booking.status}
            </p>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            render={<Link href="/" />}
            className="rounded-full bg-gold px-6 text-navy hover:bg-gold/90"
          >
            Back to Home
          </Button>
          <Button
            render={<Link href="/#availability" />}
            variant="outline"
            className="rounded-full border-gold/20 bg-white/4 px-6 text-white hover:bg-white/8"
          >
            Review Availability
          </Button>
        </div>
      </div>
    </main>
  )
}
