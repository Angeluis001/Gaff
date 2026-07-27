import { chatFaqCatalog } from "@/lib/chat/faq"

export type Language = "en" | "es"

type StatItem = {
  label: string
  value: string
}

type FleetBoat = {
  name: string
  tagline: string
  capacity: string
  priceFrom: string
  length: string
  cloudinaryPublicId: string
  features: string[]
}

type SeasonSpecies = {
  name: string
  peak: string
  window: string
  months: number[]
}

type TestimonialItem = {
  quote: string
  guest: string
  trip: string
  badge: string
}

type FaqCategory = {
  id: string
  label: string
  items: Array<{
    question: string
    answer: string
  }>
}

type CrewMember = {
  name: string
  role: string
  experience: string
  specialty: string
  certifications: string[]
}

export type LandingTranslationMap = {
  nav: {
    brand: string
    links: {
      fleet: string
      gallery: string
      availability: string
      seasons: string
      faq: string
      crew: string
      conservation: string
      blog: string
    }
    primaryCta: string
    languageLabel: string
  }
  hero: {
    eyebrow: string
    title: string
    subtitle: string
    primaryCta: string
    secondaryCta: string
    availabilityHint: string
    stats: StatItem[]
  }
  fleet: {
    eyebrow: string
    title: string
    subtitle: string
    compareCta: string
    bookLabel: string
    boats: FleetBoat[]
  }
  availability: {
    eyebrow: string
    title: string
    subtitle: string
    available: string
    limited: string
    booked: string
    filters: string[]
    modalCta: string
  }
  seasons: {
    eyebrow: string
    title: string
    subtitle: string
    species: SeasonSpecies[]
  }
  testimonials: {
    eyebrow: string
    title: string
    subtitle: string
    stats: StatItem[]
    items: TestimonialItem[]
  }
  faq: {
    eyebrow: string
    title: string
    subtitle: string
    searchPlaceholder: string
    chatCta: string
    categories: FaqCategory[]
  }
  crew: {
    eyebrow: string
    title: string
    subtitle: string
    members: CrewMember[]
  }
  conservation: {
    eyebrow: string
    title: string
    subtitle: string
    manifesto: string
    badges: string[]
  }
  cta: {
    eyebrow: string
    title: string
    subtitle: string
    primaryCta: string
    secondaryCta: string
  }
  footer: {
    summary: string
    contactTitle: string
    legalTitle: string
    socialTitle: string
    privacy: string
    terms: string
  }
  booking: {
    eyebrow: string
    title: string
    subtitle: string
    steps: {
      trip: string
      boat: string
      details: string
    }
    stepOf: string
    dateLabel: string
    guestsLabel: string
    tripTypeLabel: string
    tripTypes: {
      half_day: string
      full_day: string
    }
    tripTypeHints: {
      half_day: string
      full_day: string
    }
    calendarLegend: {
      available: string
      limited: string
      booked: string
    }
    continue: string
    back: string
    chooseBoat: string
    noBoats: string
    capacityLabel: string
    guests: string
    selectedBoat: string
    selectedDate: string
    totalLabel: string
    depositLabel: string
    balanceLabel: string
    depositNote: string
    firstName: string
    lastName: string
    email: string
    phone: string
    specialRequests: string
    specialRequestsPlaceholder: string
    summaryTitle: string
    payCta: string
    payingCta: string
    loading: string
    trustLine: string
  }
}

export const translations: Record<Language, LandingTranslationMap> = {
  en: {
    nav: {
      brand: "GAFF All Fishing",
      links: {
        fleet: "Fleet",
        gallery: "Gallery",
        availability: "Availability",
        seasons: "Seasons",
        faq: "FAQ",
        crew: "Crew",
        conservation: "Conservation",
        blog: "Blog",
      },
      primaryCta: "Book Now",
      languageLabel: "Language",
    },
    hero: {
      eyebrow: "Los Cabos Sport Fishing",
      title: "Los Cabos' Premier Sport Fishing Experience",
      subtitle:
        "Luxury charters, elite captains, and conservation-minded adventures designed for anglers who want the best water time in Cabo San Lucas.",
      primaryCta: "Book Now",
      secondaryCta: "Watch Video",
      availabilityHint: "Read-only live availability arrives in the next section.",
      stats: [
        { value: "500+", label: "Trips" },
        { value: "4.9", label: "Rating" },
        { value: "15+", label: "Years" },
      ],
    },
    fleet: {
      eyebrow: "Our Fleet",
      title: "Choose the vessel that fits your perfect day offshore",
      subtitle:
        "From agile half-day charters to luxury offshore experiences, every GAFF category is tuned for comfort, action, and experienced crews.",
      compareCta: "Compare all vessels",
      bookLabel: "Book this boat",
      boats: [
        {
          name: "Standard",
          tagline: "Fast action for focused groups",
          capacity: "Up to 4 guests",
          priceFrom: "From $550",
          length: "26 ft",
          cloudinaryPublicId: "gaff/landing/fleet-standard",
          features: ["Half-day ready", "Live bait support", "Fast marina exit"],
        },
        {
          name: "Midsize",
          tagline: "Balanced comfort and range",
          capacity: "Up to 6 guests",
          priceFrom: "From $850",
          length: "31 ft",
          cloudinaryPublicId: "gaff/landing/fleet-midsize",
          features: ["Shade cabin", "Cruising stability", "Ideal for mixed groups"],
        },
        {
          name: "Large",
          tagline: "Blue-water confidence all day",
          capacity: "Up to 8 guests",
          priceFrom: "From $1,250",
          length: "38 ft",
          cloudinaryPublicId: "gaff/landing/fleet-large",
          features: [
            "Lunch included",
            "Soft drinks included",
            "Bait and ice included",
            "Fishing licenses not included",
          ],
        },
        {
          name: "Luxury",
          tagline: "Flagship comfort with elite finish",
          capacity: "Up to 10 guests",
          priceFrom: "From $1,950",
          length: "45 ft",
          cloudinaryPublicId: "gaff/landing/fleet-luxury",
          features: [
            "Lunch included",
            "Soft drinks included",
            "Bait and ice included",
            "Fishing licenses not included",
          ],
        },
      ],
    },
    availability: {
      eyebrow: "Availability",
      title: "Plan your trip with confidence",
      subtitle:
        "Check day-by-day boat status, narrow by category, and start the booking flow with your date preselected.",
      available: "Available",
      limited: "Limited",
      booked: "Booked",
      filters: ["All", "Standard", "Midsize", "Large", "Luxury"],
      modalCta: "Start booking",
    },
    seasons: {
      eyebrow: "Fishing Seasons",
      title: "See what is biting right now",
      subtitle:
        "Monthly species visibility helps first-time guests choose the right trip window before they ever talk to the crew.",
      species: [
        { name: "Marlin", peak: "Jun-Nov", window: "Peak in October", months: [6, 7, 8, 9, 10, 11] },
        { name: "Tuna", peak: "May-Dec", window: "Peak in late summer", months: [5, 6, 7, 8, 9, 10, 11, 12] },
        { name: "Dorado", peak: "Jun-Oct", window: "Best when the water warms", months: [6, 7, 8, 9, 10] },
        { name: "Wahoo", peak: "Jul-Nov", window: "Excellent speed bite", months: [7, 8, 9, 10, 11] },
        { name: "Roosterfish", peak: "May-Aug", window: "Coastal favorite", months: [5, 6, 7, 8] },
      ],
    },
    testimonials: {
      eyebrow: "Social Proof",
      title: "A reputation built trip after trip",
      subtitle:
        "Real stories from anglers who've fished the waters of Cabo San Lucas with our crew. Every review earned, every trip unforgettable.",
      stats: [
        { value: "500+", label: "Trips" },
        { value: "4.9", label: "Average Rating" },
        { value: "15+", label: "Years in Cabo" },
      ],
      items: [
        {
          quote:
            "The crew dialed in the bite fast and treated our whole family like repeat guests.",
          guest: "Chris M.",
          trip: "Luxury Marlin Trip",
          badge: "TripAdvisor",
        },
        {
          quote:
            "It felt premium from the marina to the release. Everything ran like clockwork.",
          guest: "Alyssa R.",
          trip: "Full-Day Offshore",
          badge: "Google Reviews",
        },
      ],
    },
    faq: chatFaqCatalog.en,
    crew: {
      eyebrow: "Crew",
      title: "Captains with local instinct and guest-first hospitality",
      subtitle:
        "Years on the water, deep local knowledge, and a genuine commitment to making every charter worth the trip from wherever you call home.",
      members: [
        {
          name: "Captain Luis",
          role: "Lead Captain",
          experience: "16 years",
          specialty: "Blue marlin and tuna runs",
          certifications: ["IGFA Best Practices", "GrayFishTag Release"],
        },
        {
          name: "Mate Sergio",
          role: "Deck Lead",
          experience: "11 years",
          specialty: "Bait prep and guest coaching",
          certifications: ["CPR", "Tournament deck ops"],
        },
      ],
    },
    conservation: {
      eyebrow: "Conservation & Care",
      title: "Chasing big fish without losing respect for the resource",
      subtitle:
        "GAFF balances premium sport-fishing with handling standards that protect the fishery and keep Los Cabos world-class for the next generation.",
      manifesto:
        "Catch-and-release for marlin and sailfish is part of the experience, not a footnote. We celebrate the fight, the release, and the memory with the same intensity.",
      badges: ["GrayFishTag", "IGFA", "Catch & Release"],
    },
    cta: {
      eyebrow: "Ready To Go",
      title: "Reserve your best day in Cabo",
      subtitle:
        "Availability moves fast during peak season. Lock in your date today and we'll handle everything from there.",
      primaryCta: "See availability",
      secondaryCta: "Contact the crew",
    },
    footer: {
      summary:
        "Premium Los Cabos charter experiences for visiting anglers who want confidence before they ever step on the dock.",
      contactTitle: "Contact",
      legalTitle: "Legal",
      socialTitle: "Social",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
    },
    booking: {
      eyebrow: "Book your charter",
      title: "Reserve your fishing trip",
      subtitle:
        "Choose your date, pick the right boat, and secure your spot with a 50% deposit online.",
      steps: {
        trip: "Trip",
        boat: "Boat",
        details: "Details",
      },
      stepOf: "Step {current} of {total}",
      dateLabel: "Trip date",
      guestsLabel: "Guests",
      tripTypeLabel: "Trip length",
      tripTypes: {
        half_day: "Half day",
        full_day: "Full day",
      },
      tripTypeHints: {
        half_day: "5–6 hours on the water",
        full_day: "8 hours on the water",
      },
      calendarLegend: {
        available: "Available",
        limited: "Limited",
        booked: "Unavailable",
      },
      continue: "Continue",
      back: "Back",
      chooseBoat: "Choose your boat",
      noBoats:
        "No boats available for this date and group size. Try another date or fewer guests.",
      capacityLabel: "Up to {count} guests",
      guests: "guests",
      selectedBoat: "Boat",
      selectedDate: "Date",
      totalLabel: "Trip total",
      depositLabel: "Deposit due now (50%)",
      balanceLabel: "Balance due day of trip",
      depositNote:
        "Your card is charged only the deposit. Balance is paid in Cabo before departure.",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      phone: "Phone / WhatsApp",
      specialRequests: "Special requests",
      specialRequestsPlaceholder: "Celebrations, experience level, target species…",
      summaryTitle: "Your trip summary",
      payCta: "Pay 50% deposit & reserve",
      payingCta: "Redirecting to secure checkout…",
      loading: "Loading live availability…",
      trustLine: "Secure payment via Stripe · Instant confirmation · Expert crew",
    },
  },
  es: {
    nav: {
      brand: "GAFF All Fishing",
      links: {
        fleet: "Flota",
        gallery: "Galería",
        availability: "Disponibilidad",
        seasons: "Temporadas",
        faq: "FAQ",
        crew: "Tripulacion",
        conservation: "Conservacion",
        blog: "Blog",
      },
      primaryCta: "Reservar",
      languageLabel: "Idioma",
    },
    hero: {
      eyebrow: "Pesca Deportiva en Los Cabos",
      title: "La experiencia premier de pesca deportiva en Los Cabos",
      subtitle:
        "Charters de lujo, capitanes de elite y aventuras con enfoque en conservacion para quienes buscan lo mejor en Cabo San Lucas.",
      primaryCta: "Reservar",
      secondaryCta: "Ver video",
      availabilityHint: "La disponibilidad en tiempo real llega en la siguiente seccion.",
      stats: [
        { value: "500+", label: "Viajes" },
        { value: "4.9", label: "Calificacion" },
        { value: "15+", label: "Anos" },
      ],
    },
    fleet: {
      eyebrow: "Nuestra Flota",
      title: "Elige la embarcacion ideal para tu dia perfecto",
      subtitle:
        "Desde salidas agiles de medio dia hasta experiencias offshore de lujo, cada categoria GAFF esta pensada para confort, accion y tripulacion experta.",
      compareCta: "Comparar embarcaciones",
      bookLabel: "Reservar esta embarcacion",
      boats: [
        {
          name: "Standard",
          tagline: "Accion rapida para grupos compactos",
          capacity: "Hasta 4 personas",
          priceFrom: "Desde $550",
          length: "26 pies",
          cloudinaryPublicId: "gaff/landing/fleet-standard",
          features: ["Lista para medio dia", "Soporte de carnada viva", "Salida rapida de marina"],
        },
        {
          name: "Midsize",
          tagline: "Balance ideal entre rango y confort",
          capacity: "Hasta 6 personas",
          priceFrom: "Desde $850",
          length: "31 pies",
          cloudinaryPublicId: "gaff/landing/fleet-midsize",
          features: ["Cabina con sombra", "Estabilidad superior", "Ideal para grupos mixtos"],
        },
        {
          name: "Large",
          tagline: "Confianza offshore todo el dia",
          capacity: "Hasta 8 personas",
          priceFrom: "Desde $1,250",
          length: "38 pies",
          cloudinaryPublicId: "gaff/landing/fleet-large",
          features: ["Rango de jornada completa", "Equipo premium", "Deck listo para torneo"],
        },
        {
          name: "Luxury",
          tagline: "Comodidad insignia con acabado VIP",
          capacity: "Hasta 10 personas",
          priceFrom: "Desde $1,950",
          length: "45 pies",
          cloudinaryPublicId: "gaff/landing/fleet-luxury",
          features: ["Salon interior", "Bano privado", "Hospitalidad VIP"],
        },
      ],
    },
    availability: {
      eyebrow: "Disponibilidad",
      title: "Planea tu viaje con confianza",
      subtitle:
        "Revisa el estado diario por embarcacion, filtra por categoria y comienza la reserva con tu fecha preseleccionada.",
      available: "Disponible",
      limited: "Limitado",
      booked: "Completo",
      filters: ["Todas", "Standard", "Midsize", "Large", "Luxury"],
      modalCta: "Iniciar reserva",
    },
    seasons: {
      eyebrow: "Temporadas",
      title: "Descubre que esta picando ahora",
      subtitle:
        "La visibilidad mensual de especies ayuda a los visitantes a elegir la mejor ventana antes de hablar con la tripulacion.",
      species: [
        { name: "Marlin", peak: "Jun-Nov", window: "Pico en octubre", months: [6, 7, 8, 9, 10, 11] },
        { name: "Atun", peak: "May-Dec", window: "Mejor a finales de verano", months: [5, 6, 7, 8, 9, 10, 11, 12] },
        { name: "Dorado", peak: "Jun-Oct", window: "Mejor con agua calida", months: [6, 7, 8, 9, 10] },
        { name: "Wahoo", peak: "Jul-Nov", window: "Gran temporada de velocidad", months: [7, 8, 9, 10, 11] },
        { name: "Roosterfish", peak: "May-Aug", window: "Favorito costero", months: [5, 6, 7, 8] },
      ],
    },
    testimonials: {
      eyebrow: "Prueba Social",
      title: "Una reputacion construida viaje tras viaje",
      subtitle:
        "Historias reales de anglers que han pescado en Los Cabos con nuestra tripulacion. Cada resena ganada, cada viaje inolvidable.",
      stats: [
        { value: "500+", label: "Viajes" },
        { value: "4.9", label: "Calificacion promedio" },
        { value: "15+", label: "Anos en Cabo" },
      ],
      items: [
        {
          quote:
            "La tripulacion encontro la actividad muy rapido y trato a nuestra familia como clientes frecuentes.",
          guest: "Chris M.",
          trip: "Viaje de Marlin en Luxury",
          badge: "TripAdvisor",
        },
        {
          quote:
            "Se sintio premium desde la marina hasta la liberacion. Todo funciono perfecto.",
          guest: "Alyssa R.",
          trip: "Salida Offshore de dia completo",
          badge: "Google Reviews",
        },
      ],
    },
    faq: chatFaqCatalog.es,
    crew: {
      eyebrow: "Tripulacion",
      title: "Capitanes con instinto local y hospitalidad real",
      subtitle:
        "Anos de experiencia en el agua, conocimiento local profundo y compromiso genuino de hacer de cada charter una experiencia memorable.",
      members: [
        {
          name: "Capitan Luis",
          role: "Capitan Principal",
          experience: "16 anos",
          specialty: "Blue marlin y atun",
          certifications: ["IGFA Best Practices", "GrayFishTag Release"],
        },
        {
          name: "Mate Sergio",
          role: "Jefe de cubierta",
          experience: "11 anos",
          specialty: "Carnada y coaching al cliente",
          certifications: ["CPR", "Operacion de torneo"],
        },
      ],
    },
    conservation: {
      eyebrow: "Conservacion y Cuidado",
      title: "Pelear peces grandes sin perder respeto por el recurso",
      subtitle:
        "GAFF combina pesca deportiva premium con practicas de manejo que protegen la pesqueria y el futuro de Los Cabos.",
      manifesto:
        "La captura y liberacion de marlin y pez vela es parte de la experiencia, no una nota al pie. Celebramos la pelea, la liberacion y el recuerdo con la misma intensidad.",
      badges: ["GrayFishTag", "IGFA", "Captura y Liberacion"],
    },
    cta: {
      eyebrow: "Listo Para Zarpar",
      title: "Reserva tu mejor dia en Cabo",
      subtitle:
        "La disponibilidad se llena rapido en temporada alta. Reserva tu fecha hoy y nosotros nos encargamos del resto.",
      primaryCta: "Ver disponibilidad",
      secondaryCta: "Contactar a la tripulacion",
    },
    footer: {
      summary:
        "Experiencias premium de charter en Los Cabos para visitantes que quieren confianza desde antes de llegar a la marina.",
      contactTitle: "Contacto",
      legalTitle: "Legal",
      socialTitle: "Social",
      privacy: "Aviso de Privacidad",
      terms: "Terminos de Servicio",
    },
    booking: {
      eyebrow: "Reserva tu charter",
      title: "Reserva tu viaje de pesca",
      subtitle:
        "Elige la fecha, escoge el barco ideal y asegura tu lugar con un depósito del 50% en línea.",
      steps: {
        trip: "Viaje",
        boat: "Barco",
        details: "Datos",
      },
      stepOf: "Paso {current} de {total}",
      dateLabel: "Fecha del viaje",
      guestsLabel: "Invitados",
      tripTypeLabel: "Duración",
      tripTypes: {
        half_day: "Medio día",
        full_day: "Día completo",
      },
      tripTypeHints: {
        half_day: "5–6 horas en el agua",
        full_day: "8 horas en el agua",
      },
      calendarLegend: {
        available: "Disponible",
        limited: "Limitado",
        booked: "No disponible",
      },
      continue: "Continuar",
      back: "Atrás",
      chooseBoat: "Elige tu barco",
      noBoats:
        "No hay barcos disponibles para esta fecha y tamaño de grupo. Prueba otra fecha o menos invitados.",
      capacityLabel: "Hasta {count} personas",
      guests: "invitados",
      selectedBoat: "Barco",
      selectedDate: "Fecha",
      totalLabel: "Total del viaje",
      depositLabel: "Depósito ahora (50%)",
      balanceLabel: "Saldo el día del viaje",
      depositNote:
        "Solo se cobra el depósito. El saldo se paga en Cabo antes de zarpar.",
      firstName: "Nombre",
      lastName: "Apellido",
      email: "Correo",
      phone: "Teléfono / WhatsApp",
      specialRequests: "Solicitudes especiales",
      specialRequestsPlaceholder: "Celebraciones, experiencia, especies objetivo…",
      summaryTitle: "Resumen de tu viaje",
      payCta: "Pagar depósito 50% y reservar",
      payingCta: "Redirigiendo al pago seguro…",
      loading: "Cargando disponibilidad en vivo…",
      trustLine: "Pago seguro con Stripe · Confirmación instantánea · Tripulación experta",
    },
  },
}
