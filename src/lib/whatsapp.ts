function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  // Mexico: +52 followed by 10 digits → WhatsApp requires +521XXXXXXXXXX
  if (digits.startsWith("52") && digits.length === 12) {
    return `+521${digits.slice(2)}`
  }
  // US/Canada: already correct
  return `+${digits}`
}

export async function sendWhatsAppMessage(to: string, message: string): Promise<void> {
  const baseUrl = process.env.OPENCLAW_URL?.trim()
  const token = process.env.OPENCLAW_WEBHOOK_SECRET?.trim()

  if (!baseUrl) return

  const normalizedTo = normalizeWhatsAppNumber(to)

  await fetch(`${baseUrl}/gaff/notify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token ?? ""}`,
    },
    body: JSON.stringify({ to: normalizedTo, message }),
  })
}
