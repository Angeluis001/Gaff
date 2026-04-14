import type { ReactElement } from "react"

import { Resend } from "resend"

import { CONTACT_EMAIL, SITE_NAME } from "@/lib/constants"

let resendClient: Resend | null = null

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.")
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }

  return resendClient
}

export async function sendBookingConfirmationEmail({
  to,
  subject,
  react,
}: {
  to: string
  subject: string
  react: ReactElement
}) {
  return getResendClient().emails.send({
    from: `${SITE_NAME} <${CONTACT_EMAIL}>`,
    to,
    subject,
    react,
  })
}
