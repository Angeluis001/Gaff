import { BookingForm } from "@/components/booking/BookingForm"

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = await searchParams
  const date = typeof resolvedSearchParams.date === "string" ? resolvedSearchParams.date : undefined
  const boat = typeof resolvedSearchParams.boat === "string" ? resolvedSearchParams.boat : undefined

  return (
    <main className="landing-shell min-h-screen px-4 py-28 sm:px-6">
      <BookingForm initialDate={date} initialBoat={boat} />
    </main>
  )
}
