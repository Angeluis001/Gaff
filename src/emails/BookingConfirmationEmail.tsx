type BookingConfirmationEmailProps = {
  customerName: string
  boatName: string
  tripDate: string
  tripType: string
  guestCount: number
  depositAmount: string
  balanceAmount?: string
}

export function BookingConfirmationEmail({
  customerName,
  boatName,
  tripDate,
  tripType,
  guestCount,
  depositAmount,
  balanceAmount,
}: BookingConfirmationEmailProps) {
  const tripLabel = tripType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())

  return (
    <div style={{ backgroundColor: "#f4f4f5", padding: "40px 16px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <div style={{ maxWidth: "580px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          backgroundColor: "#0a1628",
          borderRadius: "16px 16px 0 0",
          padding: "32px 40px",
          textAlign: "center" as const,
        }}>
          <p style={{ margin: "0 0 4px", color: "#d4a843", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const }}>
            GAFF ALL FISHING LOS CABOS
          </p>
          <h1 style={{ margin: "8px 0 0", color: "#ffffff", fontSize: "26px", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Your Charter is Confirmed
          </h1>
          <p style={{ margin: "10px 0 0", color: "#94a3b8", fontSize: "15px" }}>
            Deposit received — see you on the water!
          </p>
        </div>

        {/* Green confirmation banner */}
        <div style={{ backgroundColor: "#166534", padding: "14px 40px", textAlign: "center" as const }}>
          <p style={{ margin: 0, color: "#dcfce7", fontSize: "14px", fontWeight: 600 }}>
            ✅ &nbsp;Deposit of <strong style={{ color: "#ffffff" }}>${depositAmount}</strong> successfully received
          </p>
        </div>

        {/* Body */}
        <div style={{ backgroundColor: "#ffffff", padding: "36px 40px" }}>
          <p style={{ margin: "0 0 24px", color: "#374151", fontSize: "15px", lineHeight: "1.6" }}>
            Hi <strong>{customerName}</strong>, your GAFF fishing charter is locked in. Here are your trip details:
          </p>

          {/* Trip details card */}
          <div style={{ backgroundColor: "#f8fafc", borderRadius: "12px", padding: "24px", border: "1px solid #e2e8f0", marginBottom: "24px" }}>
            {([
              { icon: "🚤", label: "Vessel", value: boatName },
              { icon: "📅", label: "Date", value: tripDate },
              { icon: "⏱", label: "Trip Type", value: tripLabel },
              { icon: "👥", label: "Guests", value: `${guestCount} ${guestCount === 1 ? "person" : "people"}` },
              { icon: "💰", label: "Deposit Paid", value: `$${depositAmount}` },
              ...(balanceAmount ? [{ icon: "🧾", label: "Balance Due Day-of", value: `$${balanceAmount}` }] : []),
            ] as { icon: string; label: string; value: string }[]).map((row, i, arr) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: i < arr.length - 1 ? "1px solid #e9ecef" : "none",
              }}>
                <span style={{ color: "#64748b", fontSize: "13px" }}>{row.icon} &nbsp;{row.label}</span>
                <span style={{ color: "#0f172a", fontSize: "14px", fontWeight: 600 }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Meeting point callout */}
          <div style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fcd34d",
            borderLeft: "4px solid #d4a843",
            borderRadius: "8px",
            padding: "16px 20px",
            marginBottom: "28px",
          }}>
            <p style={{ margin: "0 0 4px", color: "#92400e", fontSize: "12px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>
              📍 Meeting Point
            </p>
            <p style={{ margin: "4px 0 0", color: "#78350f", fontSize: "14px", lineHeight: "1.5" }}>
              <strong>Cabo San Lucas Marina</strong> — arrive by <strong>6:15 AM</strong>.<br />
              Departure at <strong>6:30 AM sharp</strong>. Included: captain, mate, tackle, fishing license, ice &amp; water.
            </p>
          </div>

          <p style={{ margin: "0 0 0", color: "#64748b", fontSize: "14px", lineHeight: "1.6" }}>
            We will send you a reminder with final details <strong>48 hours before your trip</strong>. Questions? Just reply to this email — our crew is ready to help.
          </p>

          {/* CTA */}
          <div style={{ textAlign: "center" as const, marginTop: "28px" }}>
            <a
              href="https://gaffallfishingloscabos.com"
              style={{
                display: "inline-block",
                backgroundColor: "#d4a843",
                color: "#0a1628",
                padding: "14px 32px",
                borderRadius: "50px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              Visit GAFF All Fishing →
            </a>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          backgroundColor: "#0a1628",
          borderRadius: "0 0 16px 16px",
          padding: "24px 40px",
          textAlign: "center" as const,
        }}>
          <p style={{ margin: "0 0 6px", color: "#d4a843", fontSize: "13px", fontWeight: 700 }}>GAFF All Fishing Los Cabos</p>
          <p style={{ margin: "0 0 12px", color: "#64748b", fontSize: "12px", lineHeight: "1.6" }}>
            Cabo San Lucas Marina · Baja California Sur, México<br />
            bookings@gaffallfishingloscabos.com · +52 624 100 0381
          </p>
          <p style={{ margin: 0, color: "#334155", fontSize: "11px" }}>
            © {new Date().getFullYear()} GAFF All Fishing. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  )
}
