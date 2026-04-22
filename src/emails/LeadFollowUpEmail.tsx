type LeadFollowUpEmailProps = {
  firstName: string
  message: string
}

export function LeadFollowUpEmail({ firstName, message }: LeadFollowUpEmailProps) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#0A1628",
        color: "#F5F0E8",
        padding: "32px",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ color: "#D4A843", fontSize: "24px", marginBottom: "8px" }}>
        GAFF All Fishing — Los Cabos
      </h1>
      <p>Hi {firstName},</p>
      <p style={{ lineHeight: "1.6", color: "#D0C9B8" }}>{message}</p>
      <hr style={{ borderColor: "#ffffff20", margin: "24px 0" }} />
      <p style={{ fontSize: "13px", color: "#7A7A7A" }}>
        GAFF All Fishing · Cabo San Lucas Marina, Dock F · gaffallfishingloscabos.com
      </p>
      <p style={{ fontSize: "12px", color: "#555" }}>
        You received this because you requested information about a fishing charter.
      </p>
    </div>
  )
}
