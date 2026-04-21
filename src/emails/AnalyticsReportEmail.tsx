type Highlight = {
  label: string
  value: string
}

type Alert = {
  title: string
  detail: string
}

type AnalyticsReportEmailProps = {
  title: string
  period: string
  summary: string
  highlights: Highlight[]
  alerts?: Alert[]
}

export function AnalyticsReportEmail({ title, period, summary, highlights, alerts = [] }: AnalyticsReportEmailProps) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#0A1628",
        color: "#F5F0E8",
        padding: "32px",
      }}
    >
      <h1 style={{ color: "#D4A843", fontSize: "28px", marginBottom: "8px" }}>{title}</h1>
      <p style={{ marginTop: 0, color: "#D6DFEA" }}>{period}</p>
      <p>{summary}</p>

      <div style={{ marginTop: "24px" }}>
        <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>Highlights</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {highlights.map((item) => (
              <tr key={item.label}>
                <td style={{ padding: "8px 0", color: "#A8BCD2" }}>{item.label}</td>
                <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 700 }}>{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {alerts.length > 0 ? (
        <div style={{ marginTop: "24px" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>Alerts</h2>
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            {alerts.map((alert) => (
              <li key={alert.title} style={{ marginBottom: "10px" }}>
                <strong>{alert.title}:</strong> {alert.detail}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
