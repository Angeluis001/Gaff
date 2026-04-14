type BookingConfirmationEmailProps = {
  customerName: string
  boatName: string
  tripDate: string
  tripType: string
  guestCount: number
  depositAmount: string
}

export function BookingConfirmationEmail({
  customerName,
  boatName,
  tripDate,
  tripType,
  guestCount,
  depositAmount,
}: BookingConfirmationEmailProps) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#0A1628",
        color: "#F5F0E8",
        padding: "32px",
      }}
    >
      <h1 style={{ color: "#D4A843", fontSize: "28px" }}>Booking confirmed</h1>
      <p>Hi {customerName},</p>
      <p>
        Your GAFF booking is confirmed. We have received your 50% deposit and saved
        your trip details below.
      </p>
      <ul>
        <li>Boat: {boatName}</li>
        <li>Date: {tripDate}</li>
        <li>Trip type: {tripType}</li>
        <li>Guests: {guestCount}</li>
        <li>Deposit paid: ${depositAmount}</li>
      </ul>
      <p>
        We will follow up with trip details and any final coordination before your
        departure.
      </p>
    </div>
  )
}
