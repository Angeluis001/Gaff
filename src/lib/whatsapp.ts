function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "")

  // Already fully-formed Mexican mobile: +521XXXXXXXXXX (13 digits)
  if (digits.startsWith("521") && digits.length === 13) return `+${digits}`

  // Mexican with country code but missing mobile 1: +52XXXXXXXXXX (12 digits)
  if (digits.startsWith("52") && digits.length === 12) return `+521${digits.slice(2)}`

  // US/Canada with country code: +1XXXXXXXXXX (11 digits starting with 1)
  if (digits.startsWith("1") && digits.length === 11) return `+${digits}`

  // Bare 10-digit number — Mexican local (no country code).
  // US tourists reach us via WhatsApp so their numbers always arrive with +1 already.
  // Mexican locals often omit the country code when filling forms.
  if (digits.length === 10) return `+521${digits}`

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
