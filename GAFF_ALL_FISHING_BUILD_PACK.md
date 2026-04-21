# GAFF ALL FISHING — Los Cabos
## Build Pack Completo del Proyecto
### Dominio: gaffallfishingloscabos.com

---

> **Tipo de documento:** Instrucciones de construcción (Build Pack)  
> **Cliente:** GAFF All Fishing  
> **Desarrollador:** AUREON Digital Agency  
> **Fecha:** Abril 2026  
> **Versión:** 1.0

---

## ÍNDICE

1. [Visión General del Proyecto](#1-visión-general-del-proyecto)
2. [Arquitectura Técnica Global](#2-arquitectura-técnica-global)
3. [Etapa 1 — Landing Page](#3-etapa-1--landing-page)
4. [Etapa 2 — Agentes de IA](#4-etapa-2--agentes-de-ia)
5. [Etapa 3 — Integraciones](#5-etapa-3--integraciones)
6. [Infraestructura y DevOps](#6-infraestructura-y-devops)
7. [Base de Datos y Esquemas](#7-base-de-datos-y-esquemas)
8. [Seguridad y Autenticación](#8-seguridad-y-autenticación)
9. [Roadmap y Cronograma](#9-roadmap-y-cronograma)
10. [Variables de Entorno](#10-variables-de-entorno)
11. [Comandos de Desarrollo](#11-comandos-de-desarrollo)

---

## 1. Visión General del Proyecto

GAFF All Fishing es una marca de pesca deportiva basada en Los Cabos, B.C.S., México. El objetivo es construir una plataforma digital completa que supere a la competencia directa (piscessportfishing.com) tanto en diseño como en funcionalidad, incorporando inteligencia artificial en cada punto de contacto con el cliente.

### Objetivos Estratégicos

- **Mercado objetivo primario:** Turistas americanos (USA) que buscan experiencias de pesca deportiva en Los Cabos.
- **Idioma principal:** Inglés (con soporte bilingüe EN/ES).
- **Diferenciador clave:** Automatización total del ciclo de vida del cliente — desde el descubrimiento (SEO/Redes), pasando por el booking, hasta el seguimiento post-viaje — impulsado por agentes de IA.
- **Referencia competitiva:** piscessportfishing.com — La landing de GAFF debe superar su experiencia con animaciones premium, sistema de agenda en tiempo real, chatbot inteligente, y sección de FAQ interactiva.

### Público Objetivo

| Segmento | Descripción | Canal Preferido |
|---|---|---|
| Turista USA (25-55) | Busca pesca deportiva como experiencia vacacional | Google, Instagram, TripAdvisor |
| Grupos/Corporativos | Eventos de pesca para equipos o celebraciones | Referrals, WhatsApp |
| Pescadores Experimentados | Buscan especies específicas y capitanes expertos | Fishing reports, foros |
| Familias | Experiencia familiar-friendly en el mar | Facebook, Google Maps |

---

## 2. Arquitectura Técnica Global

### Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vercel)                        │
│  Next.js 15 + TypeScript + Tailwind CSS + Framer Motion         │
│  shadcn/ui + 21st.dev Components + Radix UI                    │
├─────────────────────────────────────────────────────────────────┤
│                        BACKEND (Vercel)                         │
│  Next.js API Routes + Server Actions                            │
│  tRPC (opcional) para type-safety end-to-end                    │
├─────────────────────────────────────────────────────────────────┤
│                    BASE DE DATOS (Neon)                          │
│  PostgreSQL Serverless + Drizzle ORM                            │
├─────────────────────────────────────────────────────────────────┤
│                     AGENTES DE IA                                │
│  OpenAI GPT-4o (LLM principal)                                  │
│  OpenClaw (Bot WhatsApp + Web Chat)                             │
│  Botpress (Flujos conversacionales + embebido en web)           │
├─────────────────────────────────────────────────────────────────┤
│                     INTEGRACIONES                                │
│  Stripe (Pagos) · Meta APIs (IG/FB/TikTok) · TripAdvisor       │
│  WhatsApp Business API · Resend (Email) · Vercel Analytics      │
│  Cloudinary (Media) · Google Analytics 4 · Google Search Console│
└─────────────────────────────────────────────────────────────────┘
```

### Diagrama de Flujo del Proyecto

```
Usuario (USA)
    │
    ├── Google Search (SEO optimizado para USA) ──► Landing Page
    ├── Instagram / TikTok / Facebook ──────────► Landing Page
    ├── TripAdvisor ────────────────────────────► Landing Page
    └── WhatsApp (directo) ─────────────────────► Bot OpenClaw
                                                       │
                    Landing Page ◄─────────────────────┘
                        │
           ┌────────────┼────────────────┐
           │            │                │
       Chatbot      Booking           FAQ
       (Botpress)   (Agenda)        Interactivo
           │            │                │
           └────────┬───┘                │
                    │                    │
              Lead capturado ◄───────────┘
                    │
           ┌────────┼────────────────┐
           │        │                │
     Agente de   Agente de      Stripe
     Seguimiento  Clientes      (Pago)
           │        │                │
           └────────┼────────────────┘
                    │
              Admin Panel
              (Dashboard)
```

---

## 3. Etapa 1 — Landing Page

### 3.1 Inicialización del Proyecto

```bash
# Crear proyecto Next.js
npx create-next-app@latest gaff-all-fishing --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd gaff-all-fishing

# Instalar dependencias core
npm install framer-motion @radix-ui/react-dialog @radix-ui/react-accordion @radix-ui/react-tabs @radix-ui/react-navigation-menu @radix-ui/react-scroll-area @radix-ui/react-tooltip

# UI Components
npx shadcn@latest init
npx shadcn@latest add button card dialog sheet accordion tabs calendar badge separator scroll-area tooltip

# 21st.dev Components (instalar según necesidad)
# Ejemplo: npx shadcn@latest add "https://21st.dev/r/{author}/{component}"

# Utilidades
npm install clsx tailwind-merge class-variance-authority lucide-react
npm install date-fns react-hook-form zod @hookform/resolvers
npm install embla-carousel-react embla-carousel-autoplay

# Animaciones y UX
npm install lenis @studio-freight/lenis  # Smooth scroll
npm install sharp  # Optimización de imágenes

# Base de datos y ORM
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# Pagos
npm install stripe @stripe/stripe-js

# Email
npm install resend
```

### 3.2 Estructura de Carpetas

```
src/
├── app/
│   ├── layout.tsx                  # Layout global con metadata SEO
│   ├── page.tsx                    # Landing page principal
│   ├── globals.css                 # Estilos globales + variables CSS
│   ├── api/
│   │   ├── booking/route.ts        # API de reservaciones
│   │   ├── contact/route.ts        # API de contacto
│   │   ├── leads/route.ts          # API de captura de leads
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts   # Crear sesión de pago
│   │   │   └── webhook/route.ts    # Webhook de Stripe
│   │   └── chat/route.ts           # API proxy para chatbot
│   ├── admin/
│   │   ├── layout.tsx              # Layout del admin (protegido)
│   │   ├── page.tsx                # Dashboard principal
│   │   ├── leads/page.tsx          # Gestión de leads
│   │   ├── clients/page.tsx        # Gestión de clientes
│   │   ├── bookings/page.tsx       # Gestión de agenda/bookings
│   │   ├── agents/page.tsx         # Panel de agentes IA
│   │   └── marketing/page.tsx      # Panel de marketing
│   ├── booking/
│   │   ├── page.tsx                # Página de reservación
│   │   └── confirmation/page.tsx   # Confirmación de booking
│   └── (legal)/
│       ├── privacy/page.tsx
│       └── terms/page.tsx
├── components/
│   ├── landing/
│   │   ├── HeroSection.tsx         # Hero con video de fondo
│   │   ├── Navbar.tsx              # Navegación principal
│   │   ├── FleetShowcase.tsx       # Showcase de embarcaciones
│   │   ├── BoatCard.tsx            # Card individual de embarcación
│   │   ├── FishingSeasons.tsx      # Temporadas de pesca
│   │   ├── SpeciesGrid.tsx         # Grid de especies
│   │   ├── BookingCalendar.tsx     # Calendario de disponibilidad ✨ NUEVO
│   │   ├── BoatStatusAgenda.tsx    # Agenda/status de embarcaciones ✨ NUEVO
│   │   ├── TestimonialsCarousel.tsx# Carrusel de testimonios
│   │   ├── FAQAccordion.tsx        # FAQ interactivo ✨ NUEVO
│   │   ├── CTASection.tsx          # Call to action
│   │   ├── FishingReports.tsx      # Reportes de pesca recientes
│   │   ├── CrewSection.tsx         # Sección del equipo/capitanes
│   │   ├── ConservationBanner.tsx  # Banner de conservación
│   │   ├── GalleryMasonry.tsx      # Galería de fotos tipo masonry
│   │   ├── StatsCounter.tsx        # Contadores animados
│   │   └── Footer.tsx              # Footer con contacto y redes
│   ├── chat/
│   │   ├── ChatWidget.tsx          # Widget de chat embebido
│   │   └── ChatBubble.tsx          # Burbuja flotante
│   ├── booking/
│   │   ├── BookingForm.tsx         # Formulario de reservación
│   │   ├── DatePicker.tsx          # Selector de fecha
│   │   ├── BoatSelector.tsx        # Selector de embarcación
│   │   └── PaymentForm.tsx         # Formulario de pago Stripe
│   ├── ui/                         # shadcn/ui + 21st.dev components
│   └── shared/
│       ├── SectionHeading.tsx
│       ├── AnimatedCounter.tsx
│       ├── ParallaxImage.tsx
│       └── ScrollReveal.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts                # Conexión a Neon
│   │   ├── schema.ts               # Esquema Drizzle
│   │   └── migrations/             # Migraciones
│   ├── stripe.ts                   # Config de Stripe
│   ├── resend.ts                   # Config de email
│   ├── utils.ts                    # Utilidades (cn, formatters)
│   └── constants.ts                # Constantes (boats, species, etc.)
├── hooks/
│   ├── useScrollAnimation.ts
│   ├── useInView.ts
│   └── useMediaQuery.ts
└── types/
    ├── booking.ts
    ├── lead.ts
    └── boat.ts
```

### 3.3 Secciones de la Landing Page

La landing page será una single-page application con secciones que se despliegan con scroll. Cada sección usa Framer Motion para animaciones de entrada y transiciones premium.

#### Sección 1: Hero (Above the Fold)

```
┌────────────────────────────────────────────────────┐
│  [Video de fondo: pesca deportiva en Los Cabos]    │
│                                                    │
│  ═══ Navegación transparente ═══                   │
│  Logo  |  Fleet  |  Seasons  |  FAQ  |  Book Now  │
│                                                    │
│         GAFF ALL FISHING                           │
│      Los Cabos Sport Fishing                       │
│                                                    │
│  "The Ultimate Deep Sea Adventure Awaits"          │
│                                                    │
│  [ BOOK YOUR TRIP ]    [ WATCH VIDEO ]             │
│                                                    │
│  ▼ Scroll indicator animado                        │
└────────────────────────────────────────────────────┘
```

**Implementación técnica:**
- Video MP4 optimizado como fondo (< 5MB, lazy load).
- Navbar transparente que se vuelve sólida al hacer scroll (usa `useScrollAnimation`).
- Texto con animación `staggerChildren` de Framer Motion.
- Botón "Book Now" con efecto `whileHover` scale + glow.
- Parallax sutil en el video con `useTransform` de Framer Motion.

#### Sección 2: Fleet / Embarcaciones

```
┌────────────────────────────────────────────────────┐
│              OUR FLEET                             │
│    "Choose Your Perfect Vessel"                    │
│                                                    │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │ STD  │  │ MID  │  │ LRG  │  │ LUX  │          │
│  │ $XXX │  │ $XXX │  │ $XXX │  │ $XXX │          │
│  │      │  │      │  │      │  │      │          │
│  │[Book]│  │[Book]│  │[Book]│  │[Book]│          │
│  └──────┘  └──────┘  └──────┘  └──────┘          │
│                                                    │
│  [ COMPARE ALL VESSELS ]                           │
└────────────────────────────────────────────────────┘
```

**Implementación técnica:**
- Cards con hover 3D (`rotateX`, `rotateY` con `useMotionValue`).
- Carousel para mobile con `embla-carousel-react`.
- Cada card muestra: imagen, nombre, capacidad, precio desde, features.
- Animación de entrada con `staggerChildren` al entrar en viewport.

#### Sección 3: Agenda / Status de Embarcaciones ✨ NUEVO (Diferenciador)

```
┌────────────────────────────────────────────────────┐
│           REAL-TIME BOAT AVAILABILITY              │
│    "Plan Your Trip with Confidence"                │
│                                                    │
│   ◄  April 2026  ►                                │
│  ┌───┬───┬───┬───┬───┬───┬───┐                    │
│  │ S │ M │ T │ W │ T │ F │ S │                    │
│  ├───┼───┼───┼───┼───┼───┼───┤                    │
│  │   │   │ 1 │ 2 │ 3 │ 4 │ 5 │                    │
│  │   │   │ 🟢│ 🟢│ 🟡│ 🔴│ 🟢│  ← Status por día │
│  └───┴───┴───┴───┴───┴───┴───┘                    │
│                                                    │
│  🟢 Available  🟡 Limited  🔴 Fully Booked        │
│                                                    │
│  Filter by boat:  [All] [Standard] [Midsize] ...  │
└────────────────────────────────────────────────────┘
```

**Implementación técnica:**
- Componente `BookingCalendar` usando `shadcn/ui Calendar` + estado custom.
- Datos de disponibilidad servidos desde API (`/api/booking/availability`).
- Filtros por tipo de embarcación.
- Click en día disponible → abre modal de booking con esa fecha pre-seleccionada.
- Actualización en tiempo real (polling cada 60s o WebSocket si se justifica).
- Indicadores de color con animación `pulse` para "Limited".

#### Sección 4: Fishing Seasons / Especies

```
┌────────────────────────────────────────────────────┐
│           WHAT'S BITING RIGHT NOW                  │
│                                                    │
│  [Peak Season Chart — SVG animado]                 │
│                                                    │
│  Marlin ████████████░░░░░░░░░░░░  Peak: Jun-Nov   │
│  Tuna   ░░░░████████████░░░░░░░░  Peak: May-Dec   │
│  Dorado ░░░░░░████████░░░░░░░░░░  Peak: Jun-Oct   │
│  Wahoo  ░░░░░░░░████████░░░░░░░░  Peak: Jul-Nov   │
│                                                    │
│  Mes actual highlighted automáticamente            │
└────────────────────────────────────────────────────┘
```

**Implementación técnica:**
- Chart SVG custom con barras animadas (Framer Motion `layout` animations).
- Highlight automático del mes actual.
- Grid de especies con imágenes, peso récord, y mejor temporada.
- Hover en cada especie muestra tooltip con info detallada.

#### Sección 5: Testimonios y Social Proof

- Carrusel de reviews de TripAdvisor (embebido o screenshots).
- Contadores animados: "+2,000 trips", "4.9★ Rating", "Since 20XX".
- Logos de certificaciones y premios.

#### Sección 6: FAQ Interactivo ✨ NUEVO (Diferenciador)

```
┌────────────────────────────────────────────────────┐
│         FREQUENTLY ASKED QUESTIONS                 │
│                                                    │
│  🔍 [Search questions...]                          │
│                                                    │
│  ┌─ General ─┬─ Booking ─┬─ On The Boat ─┐       │
│                                                    │
│  ▶ What should I bring on my fishing trip?         │
│  ▼ How far in advance should I book?               │
│    We recommend booking at least 2-3 weeks...      │
│  ▶ Do you provide fishing licenses?                │
│  ▶ What happens if the weather is bad?             │
│  ▶ Can children join the trip?                     │
│                                                    │
│  💬 Can't find your answer?                        │
│     [ CHAT WITH US ]  ← Abre chatbot              │
└────────────────────────────────────────────────────┘
```

**Implementación técnica:**
- Componente `Accordion` de shadcn/ui con `Tabs` para categorías.
- Barra de búsqueda con filtro en tiempo real (client-side).
- Animaciones `AnimatePresence` de Framer Motion para abrir/cerrar.
- Botón "Chat with us" conecta con el ChatWidget de Botpress.
- FAQ data en archivo JSON para fácil mantenimiento y consumo por el chatbot.

#### Sección 7: Crew / Capitanes

- Cards del equipo con foto, nombre, años de experiencia, especialidad.
- Hover muestra badge de certificaciones.

#### Sección 8: Conservation & Care

- Banner con video corto de catch-and-release.
- Badges de organizaciones (IGFA, GrayFishTag, etc.).

#### Sección 9: CTA Final + Footer

- CTA con fondo de imagen panorámica.
- Footer con mapa de ubicación, teléfono, email, redes sociales.
- Links legales (Privacy Policy, Terms of Service).

### 3.4 Directrices de Diseño

#### Paleta de Colores Sugerida

```css
:root {
  --color-navy:      #0A1628;     /* Fondo principal, navbar */
  --color-ocean:     #1B4965;     /* Secciones alternas */
  --color-teal:      #62B6CB;     /* Acentos, CTAs secundarios */
  --color-gold:      #D4A843;     /* CTAs principales, highlights */
  --color-sand:      #F5F0E8;     /* Fondos claros */
  --color-white:     #FFFFFF;     /* Texto sobre dark */
  --color-coral:     #E07A5F;     /* Alerts, badges "hot" */
}
```

#### Tipografía

```css
/* Headings - Fuente display con carácter */
--font-heading: 'Plus Jakarta Sans', sans-serif;  /* o 'Outfit' */

/* Body - Legible y moderno */
--font-body: 'Inter', sans-serif;

/* Accent - Para precios y números */
--font-accent: 'JetBrains Mono', monospace;
```

#### Principios de Animación (Framer Motion)

```typescript
// Configuración global de animaciones
export const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

export const scaleOnHover = {
  whileHover: { scale: 1.03, transition: { duration: 0.3 } },
  whileTap: { scale: 0.98 }
};

// Smooth scroll config (Lenis)
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  smoothWheel: true,
});
```

### 3.5 SEO (Enfocado a USA)

#### Metadata Base (layout.tsx)

```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://gaffallfishingloscabos.com'),
  title: {
    default: 'GAFF All Fishing Los Cabos | Sport Fishing Charters in Cabo San Lucas',
    template: '%s | GAFF All Fishing Los Cabos'
  },
  description: 'Book the best sport fishing charters in Cabo San Lucas. Deep sea fishing for Marlin, Tuna, Dorado & more. Premium boats, expert captains, unforgettable experiences.',
  keywords: [
    'cabo san lucas fishing',
    'sport fishing los cabos',
    'deep sea fishing cabo',
    'cabo fishing charters',
    'marlin fishing cabo san lucas',
    'best fishing charter cabo',
    'cabo fishing trips',
    'los cabos fishing boats',
    'cabo sportfishing',
    'fishing cabo mexico'
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gaffallfishingloscabos.com',
    siteName: 'GAFF All Fishing Los Cabos',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: 'https://gaffallfishingloscabos.com' },
  robots: { index: true, follow: true },
};
```

#### Schema.org (JSON-LD)

```typescript
// Incluir en layout.tsx o page.tsx
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TouristAttraction',
  name: 'GAFF All Fishing Los Cabos',
  description: 'Premier sport fishing charters in Cabo San Lucas, Mexico',
  url: 'https://gaffallfishingloscabos.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Cabo San Lucas',
    addressRegion: 'Baja California Sur',
    addressCountry: 'MX',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 22.8905, longitude: -109.9167 },
  priceRange: '$$-$$$$',
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '250' },
  sameAs: [
    'https://instagram.com/gaffallfishing',
    'https://facebook.com/gaffallfishing',
    'https://tiktok.com/@gaffallfishing',
    'https://tripadvisor.com/gaffallfishing',
  ],
};
```

### 3.6 Performance Targets

| Métrica | Target | Herramienta |
|---|---|---|
| Lighthouse Performance | > 90 | Lighthouse CI |
| LCP (Largest Contentful Paint) | < 2.5s | Web Vitals |
| FID (First Input Delay) | < 100ms | Web Vitals |
| CLS (Cumulative Layout Shift) | < 0.1 | Web Vitals |
| Time to Interactive | < 3.5s | Lighthouse |
| Bundle Size (JS) | < 200KB gzipped | `next build` |

---

## 4. Etapa 2 — Agentes de IA

### 4.1 Arquitectura de Agentes

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL (Dashboard)                    │
│   Gestión centralizada de agentes, leads, clientes,          │
│   agenda, marketing, y analíticas                            │
└──────────┬──────────────────────────────────────────────────┘
           │
    ┌──────┼──────────────────────────────────────────┐
    │      │            ORQUESTADOR                    │
    │      │     (API Routes + Event Bus)              │
    │      │                                           │
    │  ┌───┴────┐  ┌────────┐  ┌────────┐  ┌───────┐ │
    │  │ Bot    │  │ Lead   │  │ Client │  │ SEO   │ │
    │  │ Agent  │  │ Agent  │  │ Agent  │  │ Agent │ │
    │  └───┬────┘  └───┬────┘  └───┬────┘  └───┬───┘ │
    │      │           │           │            │     │
    │  ┌───┴────┐  ┌───┴────┐     │     ┌──────┴───┐ │
    │  │ Mktg   │  │ Review │     │     │ Analytics│ │
    │  │ Agent  │  │ Agent  │     │     │ Agent    │ │
    │  └────────┘  └────────┘     │     └──────────┘ │
    └─────────────────────────────┼───────────────────┘
                                  │
                           ┌──────┴───────┐
                           │  Neon DB     │
                           │  (PostgreSQL)│
                           └──────────────┘
```

### 4.2 Agente 1: Bot de Booking & FAQ (Web + WhatsApp)

**Propósito:** Atender a clientes en la página web y WhatsApp para resolver preguntas y completar reservaciones.

#### Estrategia de Implementación — Enfoque Híbrido

Se recomienda un enfoque híbrido usando **Botpress** para el widget web y flujos conversacionales, combinado con **OpenClaw** para la integración con WhatsApp:

| Componente | Herramienta | Justificación |
|---|---|---|
| Widget de chat web (embebido en landing) | **Botpress Cloud** | Visual flow builder, widget personalizable, knowledge base nativa, fácil de embeber con snippet JS. Free tier generoso. |
| WhatsApp conversacional | **OpenClaw** | Open source, self-hosted, integración nativa con WhatsApp via Baileys (sin costo por mensaje), sesiones persistentes, skills system extensible. |
| Motor de IA | **OpenAI GPT-4o** | Ambas plataformas soportan GPT-4o como backend LLM. |
| Sincronización | **Neon DB compartida** | Ambos canales escriben leads y bookings en la misma base de datos. |

> **Nota sobre OpenClaw:** OpenClaw es ideal para WhatsApp porque usa el protocolo Baileys (WhatsApp Web), lo cual elimina costos por mensaje del Business API de Meta. Sin embargo, requiere un servidor siempre activo y un número de teléfono dedicado. Para producción con alto volumen, considerar migrar a WhatsApp Business API oficial (vía Twilio o 360Dialog) en una fase posterior.

#### Alternativa evaluada y descartada parcialmente:

**OpenClaw para todo (web + WhatsApp):** OpenClaw tiene WebChat, pero su widget web es menos personalizable que Botpress para una landing premium. Se recomienda Botpress para el canal web por la calidad del widget y la facilidad de embebido.

#### Knowledge Base del Bot

```yaml
# knowledge-base.yaml — Alimenta tanto a Botpress como a OpenClaw
topics:
  booking:
    - "Boats are available from 6AM to 2PM (half day) or 6AM to 4PM (full day)"
    - "Standard boats start at $XXX USD, Midsize at $XXX, Large at $XXX, Luxury at $XXX"
    - "Booking requires 50% deposit via Stripe. Balance due day of trip."
    - "Free cancellation up to 48 hours before departure"
  
  species:
    - "Marlin season: June through November (peak: October)"
    - "Tuna season: May through December"
    - "Dorado season: June through October"
    - "Wahoo season: July through November"
    - "Roosterfish: Year-round, best March through November"
  
  logistics:
    - "All boats depart from Cabo San Lucas Marina"
    - "Fishing license included in charter price"
    - "Bait, tackle, and ice included"
    - "Bring sunscreen, hat, sunglasses, and comfortable shoes"
    - "We recommend motion sickness medication if sensitive"
  
  conservation:
    - "Catch and release policy for Marlin and Sailfish"
    - "Certified by GrayFishTag Research and IGFA"
```

#### Flujo Conversacional del Bot

```
INICIO
  │
  ├── "I want to book" ──► Preguntar fecha → Preguntar grupo → Mostrar disponibilidad
  │                          → Seleccionar barco → Recopilar datos → Crear lead → 
  │                          Enviar link de pago Stripe → Confirmar booking
  │
  ├── "What's available on [fecha]?" ──► Consultar DB → Mostrar barcos disponibles
  │
  ├── "How much does it cost?" ──► Mostrar precios por categoría
  │
  ├── "What fish are biting?" ──► Consultar temporada actual → Recomendar
  │
  ├── "I need to cancel/modify" ──► Buscar booking → Aplicar política → Confirmar
  │
  └── [Cualquier otra pregunta] ──► Knowledge base RAG → Responder o escalar a humano
```

#### Configuración de Embebido (Botpress en la Landing)

```typescript
// components/chat/ChatWidget.tsx
'use client';
import { useEffect } from 'react';

export function ChatWidget() {
  useEffect(() => {
    // Cargar Botpress webchat widget
    const script1 = document.createElement('script');
    script1.src = 'https://cdn.botpress.cloud/webchat/v2.3/inject.js';
    script1.async = true;
    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = 'https://files.bpcontent.cloud/YOUR_BOT_ID/webchat/v2.3/config.js';
    script2.async = true;
    document.body.appendChild(script2);

    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, []);

  return null; // El widget se renderiza automáticamente
}
```

#### Configuración de OpenClaw para WhatsApp

```jsonc
// ~/.openclaw/openclaw.json
{
  "name": "GAFF All Fishing Bot",
  "agents": [
    {
      "id": "gaff-booking",
      "model": "gpt-4o",
      "provider": "openai",
      "skills": ["booking", "faq", "lead-capture"],
      "soul": "You are the GAFF All Fishing booking assistant. You help customers book sport fishing trips in Cabo San Lucas. Be friendly, professional, and knowledgeable about fishing in Los Cabos. Always try to guide the conversation toward a booking. Respond in English by default, but switch to Spanish if the customer writes in Spanish."
    }
  ],
  "channels": {
    "whatsapp": {
      "dmPolicy": "open",
      "allowFrom": [],
      "ackReaction": {
        "emoji": "🎣",
        "direct": true,
        "group": "never"
      }
    }
  },
  "gateway": {
    "port": 3100
  }
}
```

### 4.3 Agente 2: Seguimiento de Leads

**Propósito:** Gestionar el pipeline de leads, automatizar follow-ups, y actualizar estados.

#### Funcionalidades

```
Lead capturado (web/WhatsApp/redes)
    │
    ├── Clasificación automática (Hot/Warm/Cold basado en señales)
    │   - Hot: Solicitó precios + seleccionó fecha
    │   - Warm: Hizo preguntas específicas
    │   - Cold: Solo visitó, dejó email
    │
    ├── Secuencia de follow-up automático
    │   - T+1h:  Email de bienvenida con info de flota
    │   - T+24h: WhatsApp "¿Tienes preguntas sobre tu viaje?"
    │   - T+72h: Email con oferta especial (si no convirtió)
    │   - T+7d:  Último follow-up antes de marcar como "nurture"
    │
    ├── Actualización de estado en DB
    │   - new → contacted → qualified → booked → completed → follow-up
    │
    └── Notificación al admin cuando un lead caliente no ha sido contactado
```

#### Implementación

```typescript
// lib/agents/lead-agent.ts
import { OpenAI } from 'openai';
import { db } from '@/lib/db';
import { leads, leadActivities } from '@/lib/db/schema';

export class LeadAgent {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async classifyLead(leadData: LeadInput): Promise<'hot' | 'warm' | 'cold'> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a lead scoring agent for a sport fishing charter company.
            Classify the lead as HOT, WARM, or COLD based on:
            - HOT: Asked about specific dates, prices, or availability. Ready to book.
            - WARM: Showed interest, asked questions, but no booking intent yet.
            - COLD: Minimal engagement, just browsing or left contact info.
            Respond with only one word: HOT, WARM, or COLD.`
        },
        {
          role: 'user',
          content: JSON.stringify(leadData)
        }
      ],
      max_tokens: 10,
    });

    const classification = response.choices[0].message.content?.trim().toLowerCase();
    return (classification as 'hot' | 'warm' | 'cold') || 'cold';
  }

  async scheduleFollowUp(leadId: string, classification: string) {
    const sequences = {
      hot:  [{ delay: '1h', channel: 'email' }, { delay: '4h', channel: 'whatsapp' }],
      warm: [{ delay: '24h', channel: 'email' }, { delay: '72h', channel: 'whatsapp' }],
      cold: [{ delay: '48h', channel: 'email' }, { delay: '7d', channel: 'email' }],
    };
    // Implementar con cron jobs o Vercel Cron
  }

  async generateFollowUpMessage(lead: Lead, touchpoint: number): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Generate a personalized follow-up message for a sport fishing lead.
            Tone: Friendly, not pushy. Include a specific call to action.
            Keep it under 100 words. This is touchpoint #${touchpoint}.`
        },
        {
          role: 'user',
          content: `Lead info: ${JSON.stringify(lead)}`
        }
      ],
      max_tokens: 200,
    });

    return response.choices[0].message.content || '';
  }
}
```

### 4.4 Agente 3: Clientes (CRM + Promociones)

**Propósito:** Gestionar la base de datos de clientes existentes, enviar promociones personalizadas basadas en historial y publicaciones recientes.

#### Funcionalidades

```
Cliente registrado (post-booking completado)
    │
    ├── Perfil enriquecido
    │   - Historial de trips (fechas, barcos, especies capturadas)
    │   - Preferencias (tipo de pesca, tamaño de grupo, presupuesto)
    │   - Fechas de viaje recurrentes (ej: "viene cada enero")
    │   - Origen (ciudad USA, canal de adquisición)
    │
    ├── Campañas automáticas
    │   - Aniversario de trip: "It's been 1 year since your Marlin catch!"
    │   - Seasonal: "Tuna season is here! Book your favorite boat."
    │   - Referral: "Bring a friend and get 10% off"
    │   - Re-engagement: Clientes inactivos +6 meses
    │
    ├── Segmentación inteligente
    │   - Por especie favorita
    │   - Por gasto promedio
    │   - Por frecuencia de visita
    │   - Por canal de comunicación preferido
    │
    └── Sync con publicaciones de redes sociales
        - Cuando se publica una foto de Marlin → notificar a clientes que pescaron Marlin
        - Cuando hay oferta especial → enviar a segmento relevante
```

#### Implementación

```typescript
// lib/agents/client-agent.ts
export class ClientAgent {
  async generatePromotion(
    client: Client,
    trigger: 'anniversary' | 'seasonal' | 'referral' | 'reengagement' | 'post_sync'
  ): Promise<PromotionMessage> {
    // Usa OpenAI para generar mensaje personalizado
    // basado en historial del cliente y el trigger
  }

  async matchClientsToPost(post: SocialPost): Promise<Client[]> {
    // Analizar contenido del post (especie, tipo de experiencia)
    // Retornar clientes con preferencias matching
  }

  async sendBulkPromotion(
    clients: Client[],
    message: PromotionMessage,
    channels: ('email' | 'whatsapp' | 'sms')[]
  ): Promise<void> {
    // Enviar por los canales preferidos de cada cliente
    // Respetar opt-out preferences
    // Registrar en activity log
  }
}
```

### 4.5 Agente 4: SEO (en lugar de "CEO")

> **Nota:** Se interpreta "CEO" como **SEO** basado en el contexto de la solicitud (optimización de contenido para mercado USA).

**Propósito:** Generar y optimizar contenido SEO orientado al mercado americano para posicionar en Google.com.

#### Funcionalidades

```
Agente SEO
    │
    ├── Generación de contenido
    │   - Blog posts semanales sobre pesca en Cabo (en inglés)
    │   - Fishing reports automatizados post-trip
    │   - Landing pages por especie (marlin-fishing-cabo, tuna-fishing-cabo)
    │   - Landing pages por temporada
    │
    ├── Keyword research automatizado
    │   - Monitorear keywords objetivo
    │   - Sugerir nuevos keywords basados en tendencias
    │   - Analizar keywords de competencia (piscessportfishing.com)
    │
    ├── Optimización técnica
    │   - Generar meta descriptions optimizadas
    │   - Sugerir internal linking
    │   - Generar schema markup para nuevas páginas
    │   - Monitorear Core Web Vitals
    │
    ├── Local SEO
    │   - Optimizar Google Business Profile
    │   - Generar respuestas a reviews
    │   - Mantener NAP consistency (Name, Address, Phone)
    │
    └── Reportes
        - Ranking semanal de keywords objetivo
        - Tráfico orgánico por página
        - Comparativa vs. competencia
```

#### Target Keywords (USA Market)

```
Primary Keywords (High Volume):
- "cabo san lucas fishing"
- "sport fishing cabo"
- "cabo fishing charters"
- "deep sea fishing cabo san lucas"
- "fishing in cabo mexico"

Long-tail Keywords:
- "best time to fish in cabo san lucas"
- "cabo marlin fishing season"
- "private fishing charter cabo san lucas"
- "family fishing trip cabo"
- "cabo fishing prices 2026"
- "catch and release fishing cabo"

Location-based:
- "fishing near me cabo" (para turistas ya en Cabo)
- "marina cabo san lucas fishing"
- "best fishing boats cabo san lucas"
```

### 4.6 Agente 5: Marketing (Redes Sociales)

**Propósito:** Gestionar la presencia en redes sociales, generar contenido, programar publicaciones, y analizar rendimiento.

#### Plataformas y Estrategia

| Plataforma | Tipo de Contenido | Frecuencia | Objetivo |
|---|---|---|---|
| Instagram | Fotos/Reels de catches, behind-the-scenes, sunset shots | 5-7/semana | Brand awareness, engagement |
| TikTok | Videos cortos de acción, tips de pesca, humor de bote | 3-5/semana | Alcance viral, audiencia joven |
| Facebook | Posts informativos, eventos, compartir reviews | 3-4/semana | Comunidad, grupos de pesca |
| TripAdvisor | Responder reviews, actualizar listado, fotos | Reactivo | Reputación, conversión |

#### Funcionalidades

```
Agente de Marketing
    │
    ├── Generación de contenido
    │   - Captions para Instagram/TikTok con hashtags optimizados
    │   - Copy para ads de Meta (A/B testing automático)
    │   - Scripts para Reels/TikToks basados en trending sounds
    │
    ├── Programación
    │   - Calendario de contenido semanal auto-generado
    │   - Publicación automática (vía Meta APIs)
    │   - Horarios optimizados para audiencia USA (EST/CST/PST)
    │
    ├── Engagement
    │   - Responder comentarios automáticamente (con filtros)
    │   - Responder DMs de Instagram (leads → Bot Agent)
    │   - Generar respuestas a reviews en TripAdvisor
    │
    ├── Análisis
    │   - Engagement rate por post
    │   - Best performing content types
    │   - Audience demographics
    │   - Competitor benchmarking
    │
    └── Ads Management
        - Crear campañas de Meta Ads
        - Audiencias: US travelers, fishing enthusiasts, Cabo visitors
        - Retargeting: visitantes del sitio que no convirtieron
        - Lookalike audiences basados en clientes existentes
```

### 4.7 Agente 6: Reviews & Reputación ✨ AGENTE ADICIONAL

**Propósito:** Monitorear y gestionar la reputación online en todas las plataformas.

#### Funcionalidades

```
Agente de Reviews
    │
    ├── Monitoreo
    │   - Nuevas reviews en TripAdvisor, Google, Yelp
    │   - Menciones en redes sociales
    │   - Alertas de reviews negativas (prioridad alta)
    │
    ├── Respuestas automáticas
    │   - Generar respuesta personalizada a cada review
    │   - Reviews positivas: Agradecer + invitar a regresar
    │   - Reviews negativas: Disculpa + solución + follow-up privado
    │   - Requiere aprobación humana antes de publicar
    │
    └── Solicitud de reviews
        - Email post-trip solicitando review (T+24h después del trip)
        - Link directo a TripAdvisor/Google
        - Incentivar con descuento en próximo trip
```

### 4.8 Agente 7: Analytics & Reporting ✨ AGENTE ADICIONAL

**Propósito:** Consolidar datos de todos los agentes y generar reportes ejecutivos.

#### Funcionalidades

```
Agente de Analytics
    │
    ├── Dashboard en tiempo real
    │   - Bookings del día/semana/mes
    │   - Revenue (total, por barco, por canal)
    │   - Leads en pipeline (por estado)
    │   - Occupancy rate de la flota
    │
    ├── Reportes automáticos
    │   - Reporte diario: bookings, leads, revenue
    │   - Reporte semanal: performance de marketing, SEO rankings
    │   - Reporte mensual: P&L, comparativa mes anterior
    │
    └── Alertas inteligentes
        - "Boat X has been empty for 3 days"
        - "Lead conversion rate dropped 20% this week"
        - "Review score dropped below 4.5"
```

### 4.9 Panel de Administración (Dashboard)

**Acceso:** Solo con usuario y contraseña (NextAuth.js con credentials provider).

#### Páginas del Dashboard

```
/admin
├── /dashboard          → KPIs, gráficas de revenue, bookings, leads
├── /leads              → Tabla de leads con filtros, búsqueda, acciones
│   └── /leads/[id]     → Detalle de lead, timeline de interacciones
├── /clients            → Tabla de clientes, historial, segmentación
│   └── /clients/[id]   → Perfil de cliente, trips, preferencias
├── /bookings           → Calendario de bookings, status por embarcación
│   └── /bookings/[id]  → Detalle de booking, pagos, notas
├── /fleet              → Gestión de embarcaciones, disponibilidad, mantenimiento
├── /agents             → Estado de cada agente IA, logs, configuración
├── /marketing
│   ├── /calendar       → Calendario de contenido
│   ├── /posts          → Posts generados, programados, publicados
│   ├── /ads            → Campañas de Meta Ads
│   └── /analytics      → Métricas de redes sociales
├── /seo
│   ├── /keywords       → Rankings y tracking
│   ├── /content        → Blog posts generados
│   └── /reports        → Reportes de performance
├── /reviews            → Reviews por plataforma, respuestas pendientes
└── /settings           → Configuración general, usuarios, integraciones
```

#### Autenticación

```typescript
// lib/auth.ts — NextAuth.js config
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Verificar contra tabla admin_users en Neon DB
        const user = await db.query.adminUsers.findFirst({
          where: eq(adminUsers.email, credentials.email),
        });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  pages: { signIn: '/admin/login' },
  session: { strategy: 'jwt' },
});
```

---

## 5. Etapa 3 — Integraciones

### 5.1 Mapa de Integraciones

```
┌──────────────────────────────────────────────────────────────┐
│                    GAFF ALL FISHING PLATFORM                  │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│  REDES   │   AI     │  COMMS   │  PAGOS   │  ANALYTICS      │
│  SOCIALES│          │          │          │                 │
├──────────┼──────────┼──────────┼──────────┼─────────────────┤
│Instagram │ OpenAI   │ OpenClaw │ Stripe   │ GA4             │
│ (Meta    │ GPT-4o   │ (WhatsApp│ (Pagos   │ (Tráfico web)   │
│  Graph   │          │  Bot)    │  online) │                 │
│  API)    │          │          │          │ Vercel          │
│          │          │ Botpress │ Stripe   │ Analytics       │
│TikTok    │          │ (Web     │ Connect  │ (Performance)   │
│ (TikTok  │          │  Chat)   │ (Payouts)│                 │
│  for     │          │          │          │ Google Search   │
│  Business│          │ Resend   │          │ Console         │
│  API)    │          │ (Email   │          │ (SEO)           │
│          │          │  transac-│          │                 │
│Facebook  │          │  cional) │          │ Meta Pixel      │
│ (Meta    │          │          │          │ (Ads tracking)  │
│  Graph   │          │ Twilio   │          │                 │
│  API)    │          │ (SMS     │          │ TikTok Pixel    │
│          │          │  backup) │          │                 │
│TripAdvisor│         │          │          │ Hotjar          │
│ (Content │          │          │          │ (Heatmaps)      │
│  API)    │          │          │          │                 │
├──────────┼──────────┼──────────┼──────────┼─────────────────┤
│  MEDIA   │  INFRA   │  CRM     │  MAPS    │  SECURITY       │
├──────────┼──────────┼──────────┼──────────┼─────────────────┤
│Cloudinary│ Vercel   │ Neon DB  │ Google   │ NextAuth.js     │
│ (Imágenes│ (Hosting │ (CRM     │ Maps     │ (Auth)          │
│  y video)│  + Edge) │  Data)   │ Platform │                 │
│          │          │          │ (Mapas)  │ Upstash         │
│          │ Neon     │          │          │ (Rate limiting) │
│          │ (DB)     │          │          │                 │
│          │          │          │          │ Sentry          │
│          │ Upstash  │          │          │ (Error tracking)│
│          │ (Redis/  │          │          │                 │
│          │  Cron)   │          │          │                 │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
```

### 5.2 Detalle de Cada Integración

#### 5.2.1 OpenAI (Motor de IA Principal)

```typescript
// lib/openai.ts
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Modelo principal para todos los agentes
export const DEFAULT_MODEL = 'gpt-4o';

// Modelo económico para tareas simples (clasificación, extracción)
export const FAST_MODEL = 'gpt-4o-mini';
```

**Uso por agente:**
- Bot Agent: GPT-4o para conversaciones naturales.
- Lead Agent: GPT-4o-mini para clasificación, GPT-4o para mensajes personalizados.
- Client Agent: GPT-4o para promociones personalizadas.
- SEO Agent: GPT-4o para generación de contenido largo.
- Marketing Agent: GPT-4o para copy creativo, GPT-4o-mini para hashtags.
- Review Agent: GPT-4o para respuestas a reviews.

**Costo estimado mensual:** $50-150 USD dependiendo del volumen.

#### 5.2.2 OpenClaw (WhatsApp Bot)

**Requisitos de infraestructura:**
- VPS o máquina dedicada (puede correr en el mismo servidor o en un servicio separado).
- Node.js 20+ runtime.
- Número de WhatsApp dedicado para el negocio.
- Almacenamiento local para sesiones y transcripciones.

**Opción de deployment:**
- **Opción A (recomendada para inicio):** Correr en un Droplet de DigitalOcean ($6/mes) o Railway ($5/mes).
- **Opción B (producción avanzada):** Migrar a WhatsApp Business API oficial (Meta) para mayor estabilidad y compliance.

```bash
# Instalación de OpenClaw
npm install -g openclaw

# Configuración inicial
openclaw onboard

# Agregar canal WhatsApp
openclaw channels add --channel whatsapp

# Login (escanear QR con teléfono)
openclaw channels login --channel whatsapp

# Iniciar gateway
openclaw gateway start
```

**Skills personalizadas para GAFF:**

```
~/.openclaw/skills/
├── booking/
│   └── SKILL.md        # Instrucciones para crear bookings
├── faq/
│   └── SKILL.md        # Base de conocimiento de FAQ
├── lead-capture/
│   └── SKILL.md        # Captura de datos de leads
└── availability/
    └── SKILL.md        # Consulta de disponibilidad en Neon DB
```

#### 5.2.3 Botpress (Web Chat)

```bash
# Configuración en Botpress Cloud (cloud.botpress.com)
# 1. Crear bot nuevo
# 2. Configurar knowledge base con FAQ data
# 3. Crear flujos de booking
# 4. Personalizar widget (colores GAFF)
# 5. Obtener snippet de embebido

# Widget customization
{
  "botId": "YOUR_BOT_ID",
  "clientId": "YOUR_CLIENT_ID",
  "stylesheet": "https://gaffallfishingloscabos.com/chatbot-theme.css",
  "showPoweredBy": false,
  "enableTranscriptDownload": false,
  "composerPlaceholder": "Ask about fishing trips...",
  "botConversationDescription": "GAFF All Fishing Assistant"
}
```

#### 5.2.4 Stripe (Pagos Online)

```typescript
// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Crear sesión de checkout para booking
export async function createBookingCheckout(booking: BookingData) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${booking.boatName} - ${booking.tripType} Trip`,
            description: `${booking.date} | ${booking.guests} guests | Cabo San Lucas`,
            images: [booking.boatImage],
          },
          unit_amount: booking.depositAmount * 100, // En centavos
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_URL}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/booking?cancelled=true`,
    metadata: {
      bookingId: booking.id,
      boatId: booking.boatId,
      date: booking.date,
      leadId: booking.leadId,
    },
  });

  return session;
}
```

**Stripe Connect (opcional):** Para split payments entre GAFF y capitanes independientes.

#### 5.2.5 Meta APIs (Instagram, Facebook)

```typescript
// lib/meta.ts
const META_API_URL = 'https://graph.facebook.com/v21.0';

export class MetaAPI {
  private accessToken: string;
  private igAccountId: string;

  constructor() {
    this.accessToken = process.env.META_ACCESS_TOKEN!;
    this.igAccountId = process.env.INSTAGRAM_ACCOUNT_ID!;
  }

  // Publicar en Instagram
  async publishToInstagram(imageUrl: string, caption: string) {
    // Step 1: Create media container
    const container = await fetch(
      `${META_API_URL}/${this.igAccountId}/media`,
      {
        method: 'POST',
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption,
          access_token: this.accessToken,
        }),
      }
    );
    const { id: containerId } = await container.json();

    // Step 2: Publish
    await fetch(
      `${META_API_URL}/${this.igAccountId}/media_publish`,
      {
        method: 'POST',
        body: JSON.stringify({
          creation_id: containerId,
          access_token: this.accessToken,
        }),
      }
    );
  }

  // Obtener insights
  async getInsights(period: 'day' | 'week' | 'month') {
    // Implementar según Meta Graph API documentation
  }
}
```

#### 5.2.6 TikTok for Business API

```typescript
// lib/tiktok.ts
export class TikTokAPI {
  // Publicación de videos
  // Analytics de alcance
  // TikTok Pixel para tracking de conversiones
}
```

#### 5.2.7 TripAdvisor Content API

```typescript
// lib/tripadvisor.ts
export class TripAdvisorAPI {
  // Obtener reviews recientes
  // Monitorear rating
  // (Nota: TripAdvisor API es limitada; considerar web scraping como backup)
}
```

#### 5.2.8 Resend (Email Transaccional)

```typescript
// lib/resend.ts
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

// Templates de email
export async function sendBookingConfirmation(booking: Booking) {
  await resend.emails.send({
    from: 'GAFF All Fishing <bookings@gaffallfishingloscabos.com>',
    to: booking.email,
    subject: `Booking Confirmed! ${booking.boatName} on ${booking.date}`,
    react: BookingConfirmationEmail({ booking }),
  });
}

export async function sendLeadFollowUp(lead: Lead, message: string) {
  await resend.emails.send({
    from: 'GAFF All Fishing <hello@gaffallfishingloscabos.com>',
    to: lead.email,
    subject: 'Your Cabo Fishing Adventure Awaits!',
    react: LeadFollowUpEmail({ lead, message }),
  });
}
```

#### 5.2.9 Cloudinary (Media Management)

```typescript
// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Optimización automática de imágenes para la landing
// Transformaciones: resize, format auto (webp), quality auto
```

#### 5.2.10 Integraciones Adicionales Recomendadas

| Servicio | Propósito | Costo Estimado |
|---|---|---|
| **Google Maps Platform** | Mapa embebido de marina, direcciones | ~$5/mes |
| **Google Analytics 4** | Tracking de tráfico y conversiones | Gratis |
| **Google Search Console** | Monitoreo de SEO y indexación | Gratis |
| **Meta Pixel** | Tracking de conversiones de ads | Gratis |
| **TikTok Pixel** | Tracking de conversiones de TikTok ads | Gratis |
| **Sentry** | Error tracking y performance monitoring | Gratis (tier básico) |
| **Upstash** | Redis serverless (rate limiting, caching, cron) | ~$10/mes |
| **Hotjar** | Heatmaps y session recordings | Gratis (tier básico) |
| **Vercel Analytics** | Web analytics y Speed Insights | Incluido en Vercel |

---

## 6. Infraestructura y DevOps

### 6.1 Servicios en la Nube

```
┌────────────────────────────────────────────────────────┐
│                    PRODUCCIÓN                           │
│                                                        │
│  Vercel (Pro Plan - $20/mes)                           │
│  ├── Next.js App (Landing + Admin + API Routes)        │
│  ├── Edge Functions (para bot proxy)                   │
│  ├── Vercel Cron (para scheduled agent tasks)          │
│  ├── Vercel Analytics (incluido)                       │
│  └── Dominio: gaffallfishingloscabos.com              │
│                                                        │
│  Neon (Pro Plan - $19/mes)                             │
│  ├── PostgreSQL Serverless                             │
│  ├── Branching para dev/staging                        │
│  └── Connection pooling incluido                       │
│                                                        │
│  Railway / DigitalOcean ($6-12/mes)                    │
│  └── OpenClaw Gateway (WhatsApp Bot)                   │
│                                                        │
│  Botpress Cloud (Free / $15-89/mes según volumen)      │
│  └── Web Chat Bot                                      │
│                                                        │
│  Cloudinary (Free tier → $89/mes si crece)             │
│  └── Media storage y optimización                      │
│                                                        │
│  Upstash ($10/mes)                                     │
│  └── Redis (caching, rate limiting, queues)            │
│                                                        │
│  Resend ($20/mes)                                      │
│  └── Email transaccional                               │
│                                                        │
│  Stripe (2.9% + $0.30 por transacción)                │
│  └── Procesamiento de pagos                            │
│                                                        │
│  OpenAI API ($50-150/mes estimado)                     │
│  └── GPT-4o para todos los agentes                     │
│                                                        │
│  ──────────────────────────────────────                │
│  COSTO MENSUAL ESTIMADO: $140-350 USD + comisiones     │
│  (sin contar Meta Ads budget)                          │
└────────────────────────────────────────────────────────┘
```

### 6.2 DNS y Dominio

```
gaffallfishingloscabos.com
├── @ (root)        → Vercel (Landing Page)
├── www             → Redirect to root
├── admin           → Vercel (Dashboard - mismo deploy, ruta protegida)
├── api             → Vercel (API Routes)
├── mail            → Resend (SPF, DKIM, DMARC records)
└── _vercel         → Vercel DNS verification
```

### 6.3 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml (si se usa GitHub Actions además de Vercel)
# Vercel maneja el deploy automático en push a main
# GitHub Actions para:
#   - Lint y type-check
#   - Tests unitarios
#   - Database migrations (Drizzle)
#   - Validación de variables de entorno
```

```bash
# Vercel environments
main branch    → Production (gaffallfishingloscabos.com)
develop branch → Preview (dev-gaff.vercel.app)
PR branches    → Preview per-PR
```

---

## 7. Base de Datos y Esquemas

### 7.1 Esquema Principal (Drizzle ORM)

```typescript
// lib/db/schema.ts
import { pgTable, text, timestamp, integer, boolean, decimal,
         pgEnum, uuid, jsonb, serial } from 'drizzle-orm/pg-core';

// ═══ ENUMS ═══
export const leadStatusEnum = pgEnum('lead_status', [
  'new', 'contacted', 'qualified', 'proposal_sent',
  'booked', 'completed', 'lost', 'nurture'
]);

export const leadSourceEnum = pgEnum('lead_source', [
  'website', 'whatsapp', 'instagram', 'facebook',
  'tiktok', 'tripadvisor', 'referral', 'google', 'other'
]);

export const bookingStatusEnum = pgEnum('booking_status', [
  'pending', 'deposit_paid', 'confirmed', 'in_progress',
  'completed', 'cancelled', 'refunded', 'no_show'
]);

export const boatCategoryEnum = pgEnum('boat_category', [
  'standard', 'midsize', 'large', 'luxury'
]);

export const tripTypeEnum = pgEnum('trip_type', [
  'half_day', 'full_day', 'overnight'
]);

// ═══ BOATS (Embarcaciones) ═══
export const boats = pgTable('boats', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  category: boatCategoryEnum('category').notNull(),
  capacity: integer('capacity').notNull(),
  length: text('length'),  // ej: "31ft"
  description: text('description'),
  features: jsonb('features').$type<string[]>(),
  images: jsonb('images').$type<string[]>(),
  priceHalfDay: decimal('price_half_day', { precision: 10, scale: 2 }),
  priceFullDay: decimal('price_full_day', { precision: 10, scale: 2 }),
  captainName: text('captain_name'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ═══ LEADS ═══
export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  email: text('email'),
  phone: text('phone'),
  whatsappNumber: text('whatsapp_number'),
  source: leadSourceEnum('source').notNull(),
  status: leadStatusEnum('status').default('new'),
  classification: text('classification'),  // hot, warm, cold
  preferredDate: timestamp('preferred_date'),
  preferredBoatCategory: boatCategoryEnum('preferred_boat_category'),
  groupSize: integer('group_size'),
  notes: text('notes'),
  metadata: jsonb('metadata'),  // datos adicionales del formulario/bot
  assignedTo: uuid('assigned_to'),
  convertedToClientId: uuid('converted_to_client_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ═══ CLIENTS ═══
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  whatsappNumber: text('whatsapp_number'),
  city: text('city'),
  state: text('state'),
  country: text('country').default('US'),
  preferredSpecies: jsonb('preferred_species').$type<string[]>(),
  preferredBoatCategory: boatCategoryEnum('preferred_boat_category'),
  totalTrips: integer('total_trips').default(0),
  totalSpend: decimal('total_spend', { precision: 10, scale: 2 }).default('0'),
  lastTripDate: timestamp('last_trip_date'),
  communicationPreference: text('communication_preference').default('email'),
  optInMarketing: boolean('opt_in_marketing').default(true),
  notes: text('notes'),
  tags: jsonb('tags').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ═══ BOOKINGS ═══
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').references(() => clients.id),
  leadId: uuid('lead_id').references(() => leads.id),
  boatId: uuid('boat_id').references(() => boats.id).notNull(),
  date: timestamp('date').notNull(),
  tripType: tripTypeEnum('trip_type').notNull(),
  guests: integer('guests').notNull(),
  status: bookingStatusEnum('status').default('pending'),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  depositAmount: decimal('deposit_amount', { precision: 10, scale: 2 }),
  depositPaidAt: timestamp('deposit_paid_at'),
  balanceDueAmount: decimal('balance_due_amount', { precision: 10, scale: 2 }),
  balancePaidAt: timestamp('balance_paid_at'),
  stripeSessionId: text('stripe_session_id'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  specialRequests: text('special_requests'),
  internalNotes: text('internal_notes'),
  cancellationReason: text('cancellation_reason'),
  fishCaught: jsonb('fish_caught').$type<{species: string, weight?: string, released: boolean}[]>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ═══ BOAT AVAILABILITY ═══
export const boatAvailability = pgTable('boat_availability', {
  id: serial('id').primaryKey(),
  boatId: uuid('boat_id').references(() => boats.id).notNull(),
  date: timestamp('date').notNull(),
  isAvailable: boolean('is_available').default(true),
  reason: text('reason'),  // 'booked', 'maintenance', 'weather', 'custom'
  bookingId: uuid('booking_id').references(() => bookings.id),
});

// ═══ LEAD ACTIVITIES (Timeline) ═══
export const leadActivities = pgTable('lead_activities', {
  id: serial('id').primaryKey(),
  leadId: uuid('lead_id').references(() => leads.id).notNull(),
  type: text('type').notNull(),  // 'email_sent', 'whatsapp_sent', 'status_change', 'note', 'call'
  description: text('description').notNull(),
  metadata: jsonb('metadata'),
  agentId: text('agent_id'),  // Qué agente realizó la acción
  createdAt: timestamp('created_at').defaultNow(),
});

// ═══ MARKETING POSTS ═══
export const marketingPosts = pgTable('marketing_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  platform: text('platform').notNull(),  // instagram, tiktok, facebook
  content: text('content').notNull(),
  mediaUrls: jsonb('media_urls').$type<string[]>(),
  hashtags: jsonb('hashtags').$type<string[]>(),
  status: text('status').default('draft'),  // draft, scheduled, published, failed
  scheduledAt: timestamp('scheduled_at'),
  publishedAt: timestamp('published_at'),
  platformPostId: text('platform_post_id'),
  engagement: jsonb('engagement').$type<{likes: number, comments: number, shares: number, reach: number}>(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ═══ REVIEWS ═══
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  platform: text('platform').notNull(),  // tripadvisor, google, yelp
  platformReviewId: text('platform_review_id'),
  authorName: text('author_name'),
  rating: integer('rating'),
  content: text('content'),
  responseContent: text('response_content'),
  responseStatus: text('response_status').default('pending'),  // pending, approved, published
  bookingId: uuid('booking_id').references(() => bookings.id),
  reviewDate: timestamp('review_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ═══ ADMIN USERS ═══
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').default('admin'),  // admin, manager, viewer
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ═══ AGENT LOGS ═══
export const agentLogs = pgTable('agent_logs', {
  id: serial('id').primaryKey(),
  agentName: text('agent_name').notNull(),
  action: text('action').notNull(),
  input: jsonb('input'),
  output: jsonb('output'),
  tokensUsed: integer('tokens_used'),
  costUsd: decimal('cost_usd', { precision: 10, scale: 6 }),
  durationMs: integer('duration_ms'),
  success: boolean('success').default(true),
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ═══ SEO CONTENT ═══
export const seoContent = pgTable('seo_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(),  // blog_post, fishing_report, landing_page
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  metaDescription: text('meta_description'),
  keywords: jsonb('keywords').$type<string[]>(),
  status: text('status').default('draft'),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ═══ FAQ ═══
export const faqItems = pgTable('faq_items', {
  id: serial('id').primaryKey(),
  category: text('category').notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### 7.2 Migraciones

```bash
# Generar migración
npx drizzle-kit generate

# Aplicar migración
npx drizzle-kit push

# Visualizar schema
npx drizzle-kit studio
```

---

## 8. Seguridad y Autenticación

### 8.1 Checklist de Seguridad

```
✅ Autenticación
   - NextAuth.js con JWT para el admin panel
   - Passwords hasheados con bcrypt (salt rounds: 12)
   - Session timeout: 24 horas
   - CSRF protection (NextAuth built-in)

✅ API Security
   - Rate limiting con Upstash Redis (@upstash/ratelimit)
   - API keys para endpoints críticos
   - Input validation con Zod en todos los endpoints
   - CORS configurado solo para dominios autorizados

✅ Pagos
   - Stripe Checkout (PCI DSS compliant — datos de tarjeta nunca tocan nuestro servidor)
   - Webhook signature verification
   - Idempotency keys para prevenir cobros duplicados

✅ Datos
   - Variables de entorno en Vercel (nunca hardcodeadas)
   - Encriptación en tránsito (HTTPS everywhere via Vercel)
   - Encriptación at rest (Neon PostgreSQL)
   - Backup automático (Neon built-in)

✅ Bot Security
   - OpenClaw: DM policy configurada (allowlist o pairing)
   - Botpress: Rate limiting en el widget
   - Sanitización de input del usuario antes de pasar al LLM

✅ Compliance
   - Privacy Policy (requerida para Meta APIs)
   - Terms of Service
   - Cookie consent banner (para GA4, Meta Pixel)
   - CCPA notice (audiencia USA de California)
```

---

## 9. Roadmap y Cronograma

### Estimación por Etapa

```
ETAPA 1: Landing Page                               Semanas 1-4
├── Semana 1: Setup proyecto, diseño, Hero + Nav          ████
├── Semana 2: Fleet, Seasons, Booking Calendar            ████
├── Semana 3: FAQ, Testimonios, Crew, Conservation        ████
└── Semana 4: SEO, Performance, Testing, Deploy           ████

ETAPA 2: Agentes de IA                              Semanas 5-10
├── Semana 5: Bot Agent (Botpress web chat)               ████
├── Semana 6: Bot Agent (OpenClaw WhatsApp)               ████
├── Semana 7: Lead Agent + Client Agent                   ████
├── Semana 8: SEO Agent + Marketing Agent                 ████
├── Semana 9: Review Agent + Analytics Agent              ████
└── Semana 10: Admin Panel (Dashboard completo)           ████

ETAPA 3: Integraciones                              Semanas 11-14
├── Semana 11: Stripe + Resend + Cloudinary               ████
├── Semana 12: Meta APIs (IG/FB) + TikTok                 ████
├── Semana 13: GA4 + Pixels + Search Console              ████
└── Semana 14: Testing E2E, QA, Go-Live                   ████

TOTAL ESTIMADO: 14 semanas (3.5 meses)
```

### Milestones

| # | Milestone | Entregable | Semana |
|---|---|---|---|
| M1 | Landing Page Live | Landing publicada en Vercel con dominio | 4 |
| M2 | Chat Bot Operativo | Botpress en web + OpenClaw en WhatsApp | 6 |
| M3 | Booking System Live | Flujo completo: booking → pago Stripe → confirmación | 8 |
| M4 | Admin Panel v1 | Dashboard funcional con leads, clientes, bookings | 10 |
| M5 | Agentes Activos | Todos los agentes corriendo y reportando | 11 |
| M6 | Integraciones Completas | Redes, analytics, pagos, email | 13 |
| M7 | Go-Live | Plataforma completa en producción | 14 |

---

## 10. Variables de Entorno

```bash
# .env.local (NO commitear al repo)

# ═══ Database ═══
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/gaff?sslmode=require"

# ═══ Auth ═══
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://gaffallfishingloscabos.com"

# ═══ OpenAI ═══
OPENAI_API_KEY="sk-..."

# ═══ Stripe ═══
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ═══ Resend ═══
RESEND_API_KEY="re_..."

# ═══ Meta / Instagram / Facebook ═══
META_ACCESS_TOKEN="..."
INSTAGRAM_ACCOUNT_ID="..."
FACEBOOK_PAGE_ID="..."

# ═══ TikTok ═══
TIKTOK_ACCESS_TOKEN="..."

# ═══ Cloudinary ═══
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# ═══ Upstash Redis ═══
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# ═══ Google ═══
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_GOOGLE_MAPS_KEY="..."

# ═══ Botpress ═══
NEXT_PUBLIC_BOTPRESS_BOT_ID="..."
NEXT_PUBLIC_BOTPRESS_CLIENT_ID="..."

# ═══ Sentry ═══
SENTRY_DSN="https://..."

# ═══ App ═══
NEXT_PUBLIC_URL="https://gaffallfishingloscabos.com"
```

---

## 11. Comandos de Desarrollo

```bash
# ═══ Desarrollo Local ═══
npm run dev              # Iniciar Next.js en modo desarrollo
npm run build            # Build de producción
npm run start            # Iniciar build de producción
npm run lint             # Ejecutar ESLint
npm run type-check       # TypeScript type checking

# ═══ Base de Datos ═══
npx drizzle-kit generate # Generar migración
npx drizzle-kit push     # Aplicar migración a Neon
npx drizzle-kit studio   # Abrir Drizzle Studio (visualizar DB)
npx drizzle-kit drop     # Eliminar migración

# ═══ Stripe ═══
stripe listen --forward-to localhost:3000/api/stripe/webhook  # Webhook local

# ═══ OpenClaw ═══
openclaw gateway start   # Iniciar gateway de WhatsApp
openclaw status          # Ver estado de conexiones
openclaw channels login --channel whatsapp  # Re-conectar WhatsApp

# ═══ Deploy ═══
vercel                   # Deploy preview
vercel --prod            # Deploy producción
```

---

## Notas Finales

### Prioridades de Desarrollo

1. **Landing page impecable** — Es el primer contacto con el cliente. Debe ser visualmente superior a piscessportfishing.com.
2. **Booking flow sin fricción** — De la landing al pago en el menor número de clicks posible.
3. **Bot siempre disponible** — WhatsApp y web chat deben funcionar 24/7.
4. **SEO desde día 1** — Metadata, schema markup, y contenido optimizado desde el primer deploy.
5. **Admin panel funcional** — El equipo de GAFF debe poder gestionar todo sin tocar código.

### Decisiones Técnicas Clave

- **Next.js App Router** sobre Pages Router por mejor SEO, server components, y streaming.
- **Drizzle ORM** sobre Prisma por mejor performance con serverless (Neon) y type-safety más liviana.
- **Botpress + OpenClaw** sobre solución única porque cada canal tiene diferentes requerimientos de UX.
- **OpenAI GPT-4o** como LLM principal por la mejor relación calidad/precio para tareas multimodales.
- **Neon** sobre Supabase porque solo necesitamos PostgreSQL (no auth, storage, ni realtime de Supabase).

---

*Documento generado por AUREON Digital Agency — Abril 2026*
