import { CONTACT_EMAIL, CONTACT_PHONE, SITE_NAME, SITE_URL } from "@/lib/constants"

import { getChatFaqExport } from "./faq"

type SeasonEntry = { peak: string; best: string; monthsInSeason: number[] }

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
  seasons: {
    note: string
    currentMonth: number
    species: Record<string, SeasonEntry>
    inSeasonNow: string[]
  }
  usageNotes: string[]
  bookingFlow: {
    intakeFields: string[]
    reservationOutcome: string
    fallbackAction: string
  }
  faq: ReturnType<typeof getChatFaqExport>
}

const SPECIES: Record<string, SeasonEntry> = {
  "Blue Marlin":        { peak: "Jun–Nov", best: "October",         monthsInSeason: [6,7,8,9,10,11] },
  "Yellowfin Tuna":     { peak: "May–Dec", best: "Late summer",     monthsInSeason: [5,6,7,8,9,10,11,12] },
  "Dorado (Mahi-Mahi)": { peak: "Jun–Oct", best: "July–September",  monthsInSeason: [6,7,8,9,10] },
  "Wahoo":              { peak: "Jul–Nov", best: "All season",       monthsInSeason: [7,8,9,10,11] },
  "Roosterfish":        { peak: "May–Aug", best: "Coastal inshore",  monthsInSeason: [5,6,7,8] },
}

export function getChatKnowledgeExport(): ChatKnowledgeExport {
  const currentMonth = new Date().getMonth() + 1 // 1–12
  const inSeasonNow = Object.entries(SPECIES)
    .filter(([, s]) => s.monthsInSeason.includes(currentMonth))
    .map(([name]) => name)

  return {
    version: "2",
    updatedAt: new Date().toISOString().slice(0, 10),
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
    seasons: {
      note: "Cabo San Lucas has great fishing year-round. These are peak windows — off-peak species are still catchable.",
      currentMonth,
      species: SPECIES,
      inSeasonNow,
    },
    usageNotes: [
      "Answer fishing season and species questions directly using the 'seasons' field above — this IS official GAFF knowledge.",
      "Use the FAQ for general questions about the business, boats, and policies.",
      "Use booking availability before confirming a date or boat.",
      "Use the reservation endpoint once the guest has all required details.",
      "Only hand off to the GAFF crew for: cancellations of paid bookings, urgent complaints, or when the guest explicitly requests a human.",
      "Never say you cannot answer season, fish, or pricing questions — all that data is in this knowledge export.",
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
