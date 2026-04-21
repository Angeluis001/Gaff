type PostTripReviewRequestEmailProps = {
  customerName: string
  boatName: string
  tripDate: string
}

export function PostTripReviewRequestEmail({
  customerName,
  boatName,
  tripDate,
}: PostTripReviewRequestEmailProps) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#0A1628",
        color: "#F5F0E8",
        padding: "32px",
      }}
    >
      <h1 style={{ color: "#D4A843", fontSize: "28px" }}>How was your trip?</h1>
      <p>Hi {customerName},</p>
      <p>
        Thanks for fishing with GAFF on {tripDate}. We would appreciate a quick review of
        your experience on {boatName}.
      </p>
      <p>
        Your feedback helps future anglers choose the right charter and helps our crew keep
        improving the experience.
      </p>
      <p>
        We will keep following up with helpful trip memories and future availability.
      </p>
    </div>
  )
}

