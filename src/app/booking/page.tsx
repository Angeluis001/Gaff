import { BookingForm } from "@/components/booking/BookingForm"
import { Footer } from "@/components/landing/Footer"
import { Navbar } from "@/components/landing/Navbar"

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = await searchParams
  const date = typeof resolvedSearchParams.date === "string" ? resolvedSearchParams.date : undefined
  const boat = typeof resolvedSearchParams.boat === "string" ? resolvedSearchParams.boat : undefined

  return (
    <div className="landing-shell public-theme-scope min-h-screen">
      <Navbar />
      <main className="px-4 py-28 sm:px-6">
        <BookingForm initialDate={date} initialBoat={boat} />
      </main>
      <Footer />
    </div>
  )
}
