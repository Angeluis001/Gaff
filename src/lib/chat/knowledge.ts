import { CONTACT_EMAIL, CONTACT_PHONE, SITE_NAME, SITE_URL } from "@/lib/constants"

import { getChatFaqExport } from "./faq"

export type ChatKnowledgeExport = {
  version: string
  updatedAt: string
  sourceOfTruth: {
    faq: string
    bookingAvailability: string
    bookingReservation: string
  }
  business: {
    name: string
    website: string
    email: string
    phone: string
  }
  usageNotes: string[]
  bookingFlow: {
    intakeFields: string[]
    reservationOutcome: string
    fallbackAction: string
  }
  faq: ReturnType<typeof getChatFaqExport>
}

export function getChatKnowledgeExport(): ChatKnowledgeExport {
  return {
    version: "1",
    updatedAt: "2026-04-16",
    sourceOfTruth: {
      faq: `${SITE_URL}/api/chat/faq`,
      bookingAvailability: `${SITE_URL}/api/booking/availability`,
      bookingReservation: `${SITE_URL}/api/chat/reservation`,
    },
    business: {
      name: SITE_NAME,
      website: SITE_URL,
      email: CONTACT_EMAIL,
      phone: CONTACT_PHONE,
    },
    usageNotes: [
      "Use the FAQ endpoint as the canonical answer source for general questions.",
      "Use booking availability before promising a date or boat.",
      "Use the reservation endpoint once the guest has enough details to hold the trip and send the checkout link.",
      "If a question cannot be answered from the knowledge source, offer a handoff to the GAFF crew rather than guessing.",
    ],
    bookingFlow: {
      intakeFields: [
        "date",
        "boatId",
        "tripType",
        "guestCount",
        "firstName",
        "lastName",
        "email",
        "phone",
        "specialRequests",
      ],
      reservationOutcome:
        "Create a pending booking, reserve the boat date, and return a Stripe checkout URL for the deposit.",
      fallbackAction:
        "Ask for the missing booking fields and point the guest to the GAFF reservation flow.",
    },
    faq: getChatFaqExport(),
  }
}
