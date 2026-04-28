export type AvailabilityStatus = "available" | "limited" | "booked"
export type BoatCategory = "standard" | "midsize" | "large" | "luxury"

export type LandingBoat = {
  slug: BoatCategory
  name: "Standard" | "Midsize" | "Large" | "Luxury"
  cloudinaryPublicId: string
  capacity: string
  rateLabel: string
}

export type LandingAvailabilityEntry = {
  date: string
  boat: BoatCategory
  status: AvailabilityStatus
}

export const landingBoats: LandingBoat[] = [
  {
    slug: "standard",
    name: "Standard",
    cloudinaryPublicId: "gaff/landing/fleet-standard",
    capacity: "Up to 4 guests",
    rateLabel: "From $550",
  },
  {
    slug: "midsize",
    name: "Midsize",
    cloudinaryPublicId: "gaff/landing/fleet-midsize",
    capacity: "Up to 6 guests",
    rateLabel: "From $850",
  },
  {
    slug: "large",
    name: "Large",
    cloudinaryPublicId: "gaff/landing/fleet-large",
    capacity: "Up to 8 guests",
    rateLabel: "From $1,250",
  },
  {
    slug: "luxury",
    name: "Luxury",
    cloudinaryPublicId: "gaff/landing/fleet-luxury",
    capacity: "Up to 10 guests",
    rateLabel: "From $1,950",
  },
]

export const testimonialMedia = [
  {
    guest: "Chris M.",
    location: "Austin, Texas",
    quote:
      "The crew got us on fish early and kept the day feeling polished from start to finish.",
    highlightPhrases: ["on fish early", "polished"],
    trip: "Luxury Marlin Charter",
    imageUrl: "https://res.cloudinary.com/dtqelgtco/image/upload/v1777348735/Review_One_mbgbgc.png",
  },
  {
    guest: "Alyssa R.",
    location: "Phoenix, Arizona",
    quote:
      "Everything felt elevated, organized, and genuinely premium without losing the fun.",
    highlightPhrases: ["elevated", "genuinely premium"],
    trip: "Large Offshore Run",
    imageUrl: "https://res.cloudinary.com/dtqelgtco/image/upload/v1777348735/Review_3_duzoum.png",
  },
  {
    guest: "Daniel P.",
    location: "San Diego, California",
    quote:
      "The release footage, the crew energy, and the boat quality all felt first-class.",
    highlightPhrases: ["crew energy", "first-class"],
    trip: "Midsize Dorado Day",
    imageUrl: "https://res.cloudinary.com/dtqelgtco/image/upload/v1777348735/Review_two_deu5qh.png",
  },
]

export const certificationLogos = [
  {
    name: "IGFA",
    cloudinaryPublicId: "gaff/landing/logo-igfa",
  },
  {
    name: "GrayFishTag",
    cloudinaryPublicId: "gaff/landing/logo-grayfishtag",
  },
  {
    name: "TripAdvisor Travelers' Choice",
    cloudinaryPublicId: "gaff/landing/logo-tripadvisor",
  },
]

export const crewProfiles = [
  {
    name: "Captain Luis",
    role: "Lead Captain",
    experience: "16 years",
    specialty: "Blue marlin and tuna strategy",
    certifications: ["IGFA Best Practices", "GrayFishTag Release"],
    cloudinaryPublicId: "gaff/landing/crew-luis",
  },
  {
    name: "Captain Memo",
    role: "Offshore Captain",
    experience: "13 years",
    specialty: "Family-friendly mixed species days",
    certifications: ["CPR", "Tournament Deck Ops"],
    cloudinaryPublicId: "gaff/landing/crew-memo",
  },
  {
    name: "Mate Sergio",
    role: "Deck Lead",
    experience: "11 years",
    specialty: "Bait prep and guest coaching",
    certifications: ["Safety Briefing Lead", "Catch & Release"],
    cloudinaryPublicId: "gaff/landing/crew-sergio",
  },
]

export const ctaMedia = {
  cloudinaryPublicId: "gaff/landing/final-cta-marina",
}

export const footerSocialLinks = [
  { label: "Instagram", href: "https://instagram.com/gaffallfishing" },
  { label: "Facebook", href: "https://facebook.com/gaffallfishing" },
  { label: "TikTok", href: "https://tiktok.com/@gaffallfishing" },
]

function buildStatus(dayOffset: number, boatIndex: number): AvailabilityStatus {
  const signal = (dayOffset * 5 + boatIndex * 3) % 10

  if (signal >= 8) {
    return "booked"
  }

  if (signal >= 5) {
    return "limited"
  }

  return "available"
}

export function createLandingAvailability(reference = new Date()) {
  const start = new Date(reference)
  start.setHours(0, 0, 0, 0)

  const availability: LandingAvailabilityEntry[] = []

  for (let dayOffset = 0; dayOffset < 45; dayOffset += 1) {
    const date = new Date(start)
    date.setDate(start.getDate() + dayOffset)
    const dateKey = date.toISOString().slice(0, 10)

    landingBoats.forEach((boat, boatIndex) => {
      availability.push({
        date: dateKey,
        boat: boat.slug,
        status: buildStatus(dayOffset, boatIndex),
      })
    })
  }

  return availability
}

export function getLandingAvailabilityPayload() {
  return {
    updatedAt: new Date().toISOString(),
    boats: landingBoats,
    availability: createLandingAvailability(),
  }
}
