export type ChatFaqItem = {
  question: string
  answer: string
}

export type ChatFaqCategory = {
  id: string
  label: string
  items: ChatFaqItem[]
}

export type ChatFaqSection = {
  eyebrow: string
  title: string
  subtitle: string
  searchPlaceholder: string
  chatCta: string
  categories: ChatFaqCategory[]
}

export type ChatFaqLanguage = "en" | "es"

export type ChatFaqCatalog = Record<ChatFaqLanguage, ChatFaqSection>

export type ChatFaqExport = {
  version: string
  updatedAt: string
  languages: ChatFaqCatalog
}

export const chatFaqCatalog: ChatFaqCatalog = {
  en: {
    eyebrow: "FAQ",
    title: "Answer the big questions before they become objections",
    subtitle:
      "This is the canonical answer source for WhatsApp and chat replies, plus the booking handoff for closing reservations.",
    searchPlaceholder: "Search questions...",
    chatCta: "Chat with us",
    categories: [
      {
        id: "general",
        label: "General",
        items: [
          {
            question: "What should I bring on my trip?",
            answer:
              "Bring sun protection, comfortable clothes, and any personal essentials. The crew handles the fishing setup and trip coordination.",
          },
          {
            question: "Can I message you on WhatsApp?",
            answer:
              "Yes. WhatsApp is the fastest way to ask questions, check availability, and start a reservation.",
          },
        ],
      },
      {
        id: "booking",
        label: "Booking",
        items: [
          {
            question: "How far in advance should I book?",
            answer: "Prime dates move quickly, so booking two to three weeks ahead is best.",
          },
          {
            question: "How do I close a reservation?",
            answer:
              "Once the date, boat, trip type, guest count, and contact details are confirmed, the reservation can be created and the deposit checkout link is sent.",
          },
          {
            question: "What details are needed to reserve?",
            answer:
              "Date, boat preference, trip type, guest count, first and last name, email, phone number, and any special requests.",
          },
        ],
      },
      {
        id: "on-the-boat",
        label: "On The Boat",
        items: [
          {
            question: "Can children join the trip?",
            answer: "Yes. We can recommend the best boat class and duration for families.",
          },
          {
            question: "What happens after I reserve?",
            answer:
              "The boat date is held, the deposit checkout is completed, and the crew follows up with the trip details.",
          },
        ],
      },
    ],
  },
  es: {
    eyebrow: "FAQ",
    title: "Responde las preguntas antes de que se vuelvan objeciones",
    subtitle:
      "Esta es la fuente canonica para respuestas por WhatsApp y chat, ademas del cierre de reservaciones.",
    searchPlaceholder: "Buscar preguntas...",
    chatCta: "Chatea con nosotros",
    categories: [
      {
        id: "general",
        label: "General",
        items: [
          {
            question: "Que debo llevar al viaje?",
            answer:
              "Lleva proteccion solar, ropa comoda y tus esenciales personales. La tripulacion se encarga del equipo de pesca y la coordinacion del viaje.",
          },
          {
            question: "Puedo escribir por WhatsApp?",
            answer:
              "Si. WhatsApp es la forma mas rapida de hacer preguntas, revisar disponibilidad y empezar una reservacion.",
          },
        ],
      },
      {
        id: "booking",
        label: "Reservacion",
        items: [
          {
            question: "Con cuanta anticipacion debo reservar?",
            answer: "Las mejores fechas se ocupan rapido, asi que lo ideal es reservar con 2 a 3 semanas.",
          },
          {
            question: "Como cierro una reservacion?",
            answer:
              "Cuando ya tenemos fecha, barco, tipo de viaje, numero de personas y datos de contacto, se crea la reservacion y se comparte el enlace de pago del deposito.",
          },
          {
            question: "Que datos necesito para reservar?",
            answer:
              "Fecha, barco preferido, tipo de viaje, numero de personas, nombre y apellido, email, telefono y cualquier solicitud especial.",
          },
        ],
      },
      {
        id: "on-the-boat",
        label: "A Bordo",
        items: [
          {
            question: "Pueden ir ninos?",
            answer: "Si. Podemos sugerir la categoria y duracion ideal para familias.",
          },
          {
            question: "Que pasa despues de reservar?",
            answer:
              "Se aparta el barco, se completa el pago del deposito y la tripulacion comparte los detalles del viaje.",
          },
        ],
      },
    ],
  },
}

export function getChatFaq(language: ChatFaqLanguage = "en") {
  return chatFaqCatalog[language]
}

export function getChatFaqExport(): ChatFaqExport {
  return {
    version: "1",
    updatedAt: "2026-04-16",
    languages: chatFaqCatalog,
  }
}
