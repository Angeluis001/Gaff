# Phase 9: Upgrade Agentes — Integrar marketingskills — Research

**Investigado:** 2026-04-29
**Dominio:** Integración de skills de marketing en system prompts de agentes IA existentes (Next.js 15 + OpenAI GPT-4o/4o-mini)
**Confianza general:** HIGH — codebase completamente auditado, repositorio marketingskills inspeccionado directamente

---

## Resumen

Los 6 agentes de GAFF están implementados como funciones TypeScript que construyen system prompts como string literales inline y los envían directamente a la API de OpenAI. No hay ningún mecanismo de carga dinámica de contexto, ni archivos de prompt externos, ni base de datos de prompts. La integración de marketingskills se reduce a un problema concreto: **enriquecer los strings de system prompt en los archivos TypeScript correspondientes** con contenido destilado de los SKILL.md relevantes.

El repositorio `coreyhaines31/marketingskills` [VERIFIED: inspeccionado en github.com/coreyhaines31/marketingskills] contiene 54 skills organizadas como subdirectorios dentro de `/skills/`, cada uno con un `SKILL.md` principal. Las skills están diseñadas para ser inyectadas como contexto en el agente activo. Están concebidas para Claude Code (via `.agents/skills/`), pero su contenido es directamente aprovechable como texto en cualquier system prompt de OpenAI.

La integración más valiosa para GAFF es: (1) enriquecer los system prompts de los agentes con los frameworks de las skills seleccionadas, (2) crear el archivo `product-marketing-context.md` con contexto GAFF-específico como fuente canónica de positioning, y (3) aprovechar `programmatic-seo` para generar URLs de fishing reports con arquitectura de subfolder en lugar de slugs planos.

**Recomendación principal:** Instalar marketingskills como git submodule en `.agents/skills/marketingskills/`, crear `.agents/product-marketing-context.md` con contexto GAFF, y enriquecer los system prompts de cada agente con extractos destilados de los SKILL.md relevantes (no copiar el SKILL.md completo — destilar los frameworks aplicables a GAFF en 150-300 palabras por skill).

---

## Project Constraints (from CLAUDE.md)

- **Tech stack fijo:** Next.js 15 + TypeScript + Tailwind CSS + Drizzle ORM + Neon PostgreSQL — no negociable
- **LLM:** OpenAI GPT-4o como primary LLM; GPT-4o-mini para clasificación de alto volumen
- **Hosting:** Vercel (Pro) para la app Next.js
- **Cron:** Vercel Cron via Upstash para todas las tareas scheduled de agentes
- **Email:** Resend con dominio personalizado
- **WhatsApp:** OpenClaw gateway
- **No hay Claude Code runtime aquí** — los agentes son funciones TypeScript que llaman a OpenAI API directamente, no comandos Claude Code

---

## Mapa de agentes existentes

### Dónde vive el código de cada agente

| Agente | Archivo principal | System prompt location | Modelo usado |
|--------|-------------------|----------------------|--------------|
| Chat Agent (WhatsApp/web) | `src/lib/agents/chat-agent.ts` | `buildSystemPrompt()` y `buildWebSystemPrompt()` (inline strings) | `gpt-4o` (OPENCLAW_CHAT_MODEL) |
| Lead Agent (clasificación) | `src/lib/agents/lead-agent.ts` | Inline en `classifyLeadWithOpenAI()` (1 línea) | `gpt-4o-mini` (OPENAI_LEAD_MODEL) |
| Lead Follow-up (mensajes) | `src/lib/chat/follow-up.ts` | Strings hardcodeados en `FOLLOW_UP_SEQUENCE` constante | Sin LLM — mensajes estáticos |
| CRM / Client Agent | `src/lib/crm/campaigns.ts` | Sin LLM actual — solo persiste schedules en Redis | Sin LLM actual |
| Reviews Agent | `src/lib/reviews/sync.ts` | `fetchOpenAIDraft()` — system prompt inline 1 línea | `gpt-4o-mini` (OPENAI_REVIEW_MODEL) |
| SEO Agent | `src/lib/seo/generator.ts` | `SEO_SYSTEM_PROMPT` constante (11 líneas) | `gpt-4o-mini` hardcoded |
| Marketing Agent | `src/lib/social/engagement.ts` | Sin LLM — funciones determinísticas que leen DB | Sin LLM actual |
| Analytics Agent | `src/lib/analytics-agent.ts` | Sin LLM — cálculos determinísticos puros | Sin LLM actual |

[VERIFIED: lectura directa de todos los archivos listados]

### Hallazgo crítico: 3 agentes no tienen LLM

El CRM Agent (`campaigns.ts`), Marketing Agent (`engagement.ts`) y Analytics Agent (`analytics-agent.ts`) son funciones **puramente determinísticas** — no hacen llamadas a OpenAI. Integrar marketingskills en ellos requiere primero **agregar llamadas GPT** para las operaciones que se benefician de IA (generación de contenido de campañas, captions de marketing, análisis de anomalías). Esto es scope adicional que el planner debe considerar.

---

## Anatomía de los system prompts actuales

### Chat Agent — `buildSystemPrompt()` [VERIFIED]
- 18 líneas de sistema
- Cubre: rol, reglas de respuesta, resumen de flota, ubicación/horarios/inclusions
- Carencia: cero frameworks de psicología de compra, sin principios de urgencia/scarcity, sin técnicas de cierre para conversión a booking

### Lead Agent — `classifyLeadWithOpenAI()` [VERIFIED]
- 1 línea de system prompt: `"Classify GAFF fishing charter leads as hot, warm, or cold. Return valid JSON..."`
- Carencia: sin contexto de qué hace un lead HOT en sport fishing, sin señales de urgency específicas al dominio (temporada, disponibilidad), sin frameworks de buyer psychology

### Lead Follow-up — `FOLLOW_UP_SEQUENCE` [VERIFIED]
- Mensajes estáticos hardcodeados — **NO hay LLM**
- Hot: 2 pasos (email 1h + WhatsApp 4h)
- Warm: 2 pasos (email 24h + WhatsApp 72h)
- Cold: 5 pasos (email 48h, email 7d, WhatsApp 14d, WhatsApp 21d, email 30d)
- Mensajes funcionales pero genéricos — sin urgency, sin social proof, sin scarcity

### Reviews Agent — `fetchOpenAIDraft()` [VERIFIED]
- 1 línea system prompt: `"Write a short, professional review response for a fishing charter company. Be warm, specific, and concise."`
- Carencia: sin guidance sobre tono de marca GAFF, sin framework de manejo de reviews negativas, sin técnicas de recuperación de reputación

### SEO Agent — `SEO_SYSTEM_PROMPT` constante [VERIFIED]
- 4 líneas: rol + tono + keyword guidance
- Genera blog posts (800-1000w) y fishing reports (400-600w)
- Carencia: sin framework de programmatic SEO para URL architecture, sin ai-seo guidance para citabilidad en AI search, sin content strategy sistematizada

### Marketing Agent — `buildEngagementDrafts()` [VERIFIED]
- Sin LLM — genera draft strings hardcodeados genéricos
- Carencia total: sin hook frameworks, sin caption formulas, sin content calendar logic con IA

---

## Estructura del repositorio marketingskills

[VERIFIED: github.com/coreyhaines31/marketingskills — inspeccionado 2026-04-29]

```
marketingskills/
├── skills/                  ← 54 subdirectorios, uno por skill
│   ├── {skill-name}/
│   │   ├── SKILL.md         ← Archivo principal (<500 líneas) — ESTE se inyecta
│   │   ├── evals/           ← Tests de la skill (ignorar para integración)
│   │   └── references/      ← Materiales de apoyo (opcional)
│   └── product-marketing-context/
│       └── SKILL.md         ← Archivo fundacional — crear primero
├── AGENTS.md / CLAUDE.md    ← Instrucciones de integración (CLAUDE.md = symlink a AGENTS.md)
├── README.md
└── VERSIONS.md
```

**Mecanismo de integración:** Los skills son instructional modules en markdown. El mecanismo nativo es `.agents/skills/` para Claude Code (el agente lee el SKILL.md y aplica los frameworks). Para la integración con OpenAI API directa (el caso de GAFF), el patrón es **destilar el contenido relevante del SKILL.md e incorporarlo al system prompt** del agente correspondiente. [VERIFIED: AGENTS.md leído]

**Instalación recomendada para GAFF:** git submodule o clone directo en `.agents/skills/marketingskills/` — los skill files quedan disponibles en disco para referencia del desarrollador y futura automatización de carga.

---

## Skills relevantes por agente — contenido verificado

### skill: `email-sequence` [VERIFIED: SKILL.md leído]

**Aplicable a:** Lead Follow-up, CRM Agent

Frameworks clave para GAFF:
- **One Email, One Job** — cada mensaje de follow-up tiene un único propósito y un único CTA
- **Tipos de secuencia:** Lead Nurture (6-8 emails, 2-3 semanas) — el cold sequence de 5 pasos ya se aproxima; optimizar con esta estructura
- **Hook → Context → Value → CTA → Sign-off** — estructura de copy para cada mensaje
- **Subject line patterns:** Preguntas ("Still planning that Cabo trip?"), specificity ("Your marlin window closes Oct 31"), story hooks
- **Timing:** Hot = inmediato/mismo día; Warm = 1-2 días; Cold = weekly/bi-weekly
- **Re-engagement trigger:** 30-60 días inactivity (ya implementado a 6 meses para CRM)
- Compatible con Resend (ya en stack) — mencionado explícitamente en la skill

**Gap actual:** Los mensajes de follow-up en `FOLLOW_UP_SEQUENCE` son funcionales pero sin structure Hook→Value→CTA. Requieren reescritura con frameworks de esta skill.

### skill: `marketing-psychology` [VERIFIED: SKILL.md leído]

**Aplicable a:** Lead Agent (clasificación + follow-up), Chat Agent

26 behavioral models mapeados. Los más relevantes para GAFF sport fishing:

| Framework | Aplicación GAFF |
|-----------|-----------------|
| Scarcity/Urgency Heuristic | "Solo 2 fechas disponibles en octubre (marlin peak)" |
| Social Proof / Bandwagon | "4.8★ en TripAdvisor — 500+ trips al año" |
| Loss Aversion / Prospect Theory | "No perder la mejor ventana de pesca" vs "ganar un trip" |
| Goal-Gradient Effect | Lead más cerca de la fecha → más urgencia → más hot |
| Hyperbolic Discounting | Descuentos early-booking aumentan conversión inmediata |
| FOMO + Anchoring | Precio luxury como anchor; midsize como "mejor valor" |
| Peak-End Rule | El momento del marlin + la foto = el recuerdo que genera reseña |
| Reciprocity | Fishing report gratuito → lead más receptivo al follow-up |

**Para el Lead Agent:** El system prompt debe incluir señales de urgency basadas en temporada (marlin Oct-Nov = hot bias), disponibilidad de botes (luxury/large requested = mayor valor percibido), y size del grupo (≥6 = familia/empresa = mayor compromiso).

### skill: `copywriting` [VERIFIED: SKILL.md leído]

**Aplicable a:** Reviews Agent, Chat Agent, Lead Follow-up

Frameworks clave:
- **Clarity over cleverness** — especialmente importante en mensajes WhatsApp
- **Benefits over features** — "pesca la experiencia de tu vida" > "tenemos un barco de 45ft"
- **CTA formula:** Action verb + specific benefit + qualifier → "Book your October slot before the marlin peak ends"
- **Above the fold:** Hook → subheadline → CTA (relevante para emails)
- **Página por tipo:** Reviews negativos tienen estructura distinta a positivos

**Para Reviews Agent:** El system prompt debe incluir guidance de tono de marca GAFF (premium, confiado, no defensivo), y estructura específica para reviews negativos (acknowledge → empathize → resolve → invite back).

### skill: `programmatic-seo` [VERIFIED: SKILL.md leído]

**Aplicable a:** SEO Agent — ESTA ES LA OPORTUNIDAD MÁS GRANDE

La skill define el patrón Locations: `[service] in [location]` → páginas como `/blog/marlin-fishing-cabo-october-2026`.

**Análisis del gap actual:**
- El SEO Agent ya genera fishing reports con slug único (`fishing-report-full-day-on-2026-04-15-2026-04-15`)
- Los slugs no siguen arquitectura de programmatic SEO
- No hay template de URL para location + date + species
- Los fishing reports podrían ser páginas públicas indexadas (actualmente solo en admin)

**Arquitectura programmatic SEO propuesta para GAFF:**
```
/blog/[slug]                           ← Blog posts semanales (ya existe)
/fishing-reports/[year]/[month]/[slug] ← Fishing reports por fecha (nuevo)
/fishing-reports/marlin/               ← Hub por especie (nuevo)
/fishing-reports/cabo-san-lucas/       ← Hub por ubicación (nuevo)
```

**Datos únicos disponibles (propietarios = máximo valor SEO):**
- Fishing reports de trips reales (species caught, date, weather, boat)
- `sourceBookingId` en seo_posts ya linkea el report a la booking real

**Patrón de URL para pSEO:** `getUniqueSlug()` en `generator.ts` ya crea slugs únicos con fecha — solo necesita refactor para seguir arquitectura `[species]-fishing-cabo-[month]-[year]`.

### skill: `ai-seo` [VERIFIED: SKILL.md leído]

**Aplicable a:** SEO Agent

Optimización para ser citado por ChatGPT, Perplexity, Google AI Overviews:
- **Structured data + schema markup** — `Article`, `TouristAttraction`, `FAQPage`
- **Definition blocks, comparison tables, step-by-step formats** — cada blog post debe tener una sección FAQ
- **Freshness signals** — fishing reports con fecha real (ya tenemos)
- **`/llms.txt`** — archivo para visibilidad en AI agents (nuevo)
- **Citability:** Each claim debe funcionar independientemente — recomendaciones específicas ("Best time for Yellowfin Tuna in Cabo: May–December, peak late summer")

### skill: `social-content` [VERIFIED: SKILL.md leído]

**Aplicable a:** Marketing Agent

Frameworks clave para Instagram/TikTok/Facebook:
- **3-second rule** — hook visual + verbal + texto simultáneos en video (TikTok)
- **Hook formulas:** curiosity ("You won't believe what they caught..."), story ("Last week a family of 5 caught..."), value ("How to book the cheapest Cabo charter")
- **Content pillars para GAFF:** (1) Trip results/catch reports, (2) Educational fishing tips, (3) Behind-the-scenes/crew, (4) Booking/availability CTAs, (5) Customer testimonials
- **Platform timing:** Instagram = M/W/F 11am-1pm PST (US West Coast tourists); TikTok = any time, hook-driven

**Gap actual:** `buildEngagementDrafts()` genera drafts estáticos genéricos. Con LLM + social-content skill se pueden generar captions específicas con hooks, hashtags estratégicos, y call-to-actions orientados a booking.

### skill: `churn-prevention` [VERIFIED: SKILL.md leído]

**Aplicable a:** CRM Agent (re-engagement)

**Nota:** "Churn" en GAFF = cliente inactivo >6 meses que no regresa. El sport fishing no tiene suscripción, pero la lógica de re-engagement es directamente aplicable.

Frameworks aplicables:
- **Risk signal tracking:** cliente sin booking en 6 meses = at-risk (ya implementado como trigger)
- **Cancel flow mapping** → aplicar como "re-engagement sequence" con Survey → Offer → Confirmation
- **Dynamic offers por razón de inactividad:** price-sensitive → early bird discount; low engagement → seasonal alert (marlin peak coming); missing feature → nuevo barco/servicio
- **Cohort analysis:** segmentar por especie preferida, gasto total, temporada original

### skill: `customer-research` [VERIFIED: SKILL.md leído]

**Aplicable a:** Lead Agent, CRM Agent — para enriquecer contexto de segmentación

Frameworks aplicables:
- **Jobs to be Done:** El turista US que reserva pesca en Cabo "contrata" una experiencia de aventura + bonding familiar + historia que contar (no solo el fish)
- **Digital watering holes:** TripAdvisor reviews ya son fuente de VOC (voz del cliente) — el Reviews Agent los captura pero no los analiza para extraer language patterns
- **Persona triggers:** "planning a bachelor trip", "family reunion", "corporate team event" = señales de alta conversión que el Lead Agent debería reconocer

### skill: `analytics-tracking` [VERIFIED: SKILL.md leído]

**Aplicable a:** Analytics Agent

La skill cubre GA4, GTM, event naming conventions, UTM strategy:
- **Object-Action naming:** `booking_completed`, `lead_captured`, `review_submitted` — ya existe este patrón en el proyecto
- **Tracking plan template:** formalizar qué eventos se capturan, en qué condiciones, con qué properties
- El Analytics Agent actualmente es puramente backend (bookings/leads DB) — esta skill orienta a **conectar GA4 data** con el report

**Gap actual:** El Analytics Agent no lee GA4 data real — usa solo datos de la DB interna. La skill de analytics-tracking orienta cómo estructurar el tracking plan para cerrar este gap.

### skill: `competitor-profiling` [VERIFIED: SKILL.md leído]

**Aplicable a:** SEO Agent (keyword tracking vs piscessportfishing.com)

El competitor tracking ya está hardcodeado (`competitorFocus: "piscessportfishing.com"` en `generator.ts` y `reports.ts`). La skill orienta a hacer un perfil completo:
- Homepage + pricing page scraping
- Keyword ranking gaps
- Content strategy comparison

**Gap actual:** `buildKeywordReport()` en `reports.ts` retorna datos simulados (`gaffRank: index + 1, competitorRank: index + 2`) — no hay competitor tracking real. La skill define el framework para hacerlo con herramientas reales.

---

## Patrón de integración recomendado

### Patrón A: Prompt Enrichment (RECOMENDADO para agentes con LLM existente)

Para Chat Agent, Lead Agent, Reviews Agent, SEO Agent:

```typescript
// PATRÓN ACTUAL (ejemplo — lead-agent.ts)
content: "Classify GAFF fishing charter leads as hot, warm, or cold. Return valid JSON..."

// PATRÓN MEJORADO con skill frameworks destilados
content: `
Classify GAFF fishing charter leads as hot, warm, or cold.

BUYER PSYCHOLOGY SIGNALS (apply these):
- Scarcity urgency: preferred date within 14 days AND peak season (Oct-Nov marlin) → strong hot bias
- Group commitment: group_size >= 6 OR luxury/large boat requested → higher conversion intent
- Loss aversion framing: near-term dates with limited availability are hot regardless of group size
- Goal-gradient: the closer to the preferred date, the more urgency → hot threshold lowers
- Social proof trigger: mentions of "friends recommended" or "TripAdvisor" → warm-to-hot

CLASSIFICATION RULES:
- hot: booking intent clear + at least 2 urgency signals present
- warm: interest clear but urgency low or contact info incomplete
- cold: exploratory, far-future date, or single weak signal

Return JSON: { classification, confidence, reason, nextAction }
`
```

### Patrón B: Skill-Loaded Context (para agentes que necesitan LLM añadido)

Para CRM Agent, Marketing Agent:
1. Añadir función `generateXxxContent()` que llama a OpenAI
2. Construir system prompt que inyecta el framework de la skill relevante
3. Pasar contexto de la DB (trip data, client segment) como user message

```typescript
// Ejemplo: CRM Agent campaign generation
async function generateAnniversaryEmail(client: Client): Promise<string> {
  return callOpenAI({
    model: "gpt-4o-mini",
    systemPrompt: `
You write retention emails for GAFF All Fishing Los Cabos — a premium sport fishing charter.

EMAIL SEQUENCE FRAMEWORK:
- One Email, One Job: this email's single purpose is to re-book the client
- Structure: Hook (specific memory) → Value (new season/catch opportunity) → CTA (booking link)
- Subject line: personalized with species caught or trip date
- 150-200 words max for mobile readability

CLIENT SEGMENT:
${client.preferredSpecies?.length ? `Prefers: ${client.preferredSpecies.join(', ')}` : 'General angler'}
Total trips: ${client.totalTrips}
Last trip: ${client.lastTripDate}

Write an anniversary email. Return only the email body (subject line on first line, blank line, body).
    `,
    userMessage: `Client: ${client.firstName} ${client.lastName}, anniversary of trip ${client.lastTripDate}`
  })
}
```

### Patrón C: product-marketing-context.md (fundacional — crear primero)

Archivo: `.agents/product-marketing-context.md`

Este archivo centraliza el contexto GAFF para que todas las skills y system prompts puedan referenciar el mismo positioning. [VERIFIED: SKILL.md del skill product-marketing-context leído]

Secciones a crear para GAFF:
- Product Overview: charter premium de pesca deportiva en Cabo San Lucas
- Target Audience: turistas US (35-55 años, parejas/familias/grupos de amigos, $1k-5k budget por trip)
- Problems & Pain Points: miedo a reservar mal, incertidumbre sobre temporada, no saber qué barco elegir
- Competitive Landscape: piscessportfishing.com, Picante Fleet, directamente vs agencias de travel
- Brand Voice: confiado, experto, cálido pero premium (no turístico-barato)
- Proof Points: 4.8★ TripAdvisor, N años operando, captains certificados IGFA

---

## Oportunidades de quick win por prioridad

### QW-1: Enriquecer Lead Agent system prompt (alta ROI, bajo esfuerzo)
- **Archivo:** `src/lib/agents/lead-agent.ts` → función `classifyLeadWithOpenAI()`
- **Acción:** Expandir 1 línea a ~20 líneas con buyer psychology signals y classification rules
- **Skills:** `marketing-psychology`, `customer-research`
- **ROI estimado:** Mejor clasificación hot/warm → más conversiones en el mismo volumen de leads

### QW-2: Reescribir FOLLOW_UP_SEQUENCE con email-sequence framework (alta ROI, medio esfuerzo)
- **Archivo:** `src/lib/chat/follow-up.ts` → constante `FOLLOW_UP_SEQUENCE`
- **Acción:** Reescribir todos los mensajes siguiendo Hook→Value→CTA, subject line patterns, y psychology triggers
- **Skills:** `email-sequence`, `marketing-psychology`, `copywriting`
- **ROI estimado:** Mejora de open rate y response rate en secuencias existentes sin cambiar infraestructura

### QW-3: Enriquecer Reviews Agent con copywriting framework (bajo esfuerzo, medio ROI)
- **Archivo:** `src/lib/reviews/sync.ts` → función `fetchOpenAIDraft()`
- **Acción:** Expandir 1 línea a ~10 líneas con brand voice, tone guidance, y estructura para reviews negativos
- **Skills:** `copywriting`
- **ROI estimado:** Respuestas de reviews más on-brand, mejor manejo de reviews negativos

### QW-4: Enriquecer SEO Agent con programmatic-seo + ai-seo frameworks (alto esfuerzo, mayor ROI)
- **Archivos:** `src/lib/seo/generator.ts` → `SEO_SYSTEM_PROMPT` + `generateFishingReportFromBooking()`
- **Acción:** (a) Refactor de URL architecture en `getUniqueSlug()` para pSEO; (b) Añadir FAQ section obligatoria a cada blog post; (c) Añadir `/llms.txt` route; (d) Enriquecer system prompt con citation-first writing
- **Skills:** `programmatic-seo`, `ai-seo`, `content-strategy`
- **ROI estimado:** Fishing reports con URLs indexables y citabilidad en AI search

### QW-5: Añadir LLM a CRM Agent para campaign content generation (medio esfuerzo, alto ROI)
- **Archivo:** `src/lib/crm/campaigns.ts` → añadir `generateCampaignEmail()` helper
- **Acción:** Reemplazar Redis-only scheduling con generación GPT-4o-mini de contenido de email al momento de envío
- **Skills:** `email-sequence`, `churn-prevention`, `customer-research`

### QW-6: Añadir LLM a Marketing Agent para caption generation (medio esfuerzo, medio ROI)
- **Archivo:** `src/lib/social/engagement.ts` → reemplazar string estáticos en `buildEngagementDrafts()`
- **Acción:** GPT-4o-mini genera captions con hook formulas y hashtags estratégicos por plataforma
- **Skills:** `social-content`, `copywriting`

---

## Instalación del repositorio marketingskills

```bash
# Opción A: git submodule (recomendado — permite updates)
git submodule add https://github.com/coreyhaines31/marketingskills .agents/skills/marketingskills

# Opción B: clone directo
git clone https://github.com/coreyhaines31/marketingskills .agents/skills/marketingskills
```

Los SKILL.md quedan disponibles en:
```
.agents/skills/marketingskills/skills/{skill-name}/SKILL.md
```

No hay dependency de runtime — los archivos son markdown referenciados por el desarrollador al escribir/actualizar system prompts. El submodule en `.gitmodules` es la única adición a git.

**Licencia:** MIT — sin restricciones de uso comercial. [VERIFIED: repo description en github.com/coreyhaines31/marketingskills]

---

## Estructura del proyecto después de la integración

```
.agents/
├── product-marketing-context.md     ← Nuevo: contexto GAFF para todos los agentes
└── skills/
    └── marketingskills/             ← git submodule
        └── skills/
            ├── email-sequence/SKILL.md
            ├── marketing-psychology/SKILL.md
            ├── copywriting/SKILL.md
            ├── programmatic-seo/SKILL.md
            ├── ai-seo/SKILL.md
            ├── social-content/SKILL.md
            ├── churn-prevention/SKILL.md
            ├── customer-research/SKILL.md
            ├── competitor-profiling/SKILL.md
            ├── analytics-tracking/SKILL.md
            └── ...

src/lib/agents/
├── lead-agent.ts                    ← Enriquecido: system prompt con marketing-psychology + customer-research
└── chat-agent.ts                    ← Enriquecido: system prompt con copywriting + marketing-psychology

src/lib/chat/
└── follow-up.ts                     ← Reescrito: FOLLOW_UP_SEQUENCE con email-sequence frameworks

src/lib/crm/
└── campaigns.ts                     ← Actualizado: añadir LLM call para generar email content

src/lib/reviews/
└── sync.ts                          ← Enriquecido: system prompt con copywriting framework

src/lib/seo/
└── generator.ts                     ← Actualizado: pSEO URL architecture + ai-seo content structure

src/lib/social/
└── engagement.ts                    ← Actualizado: añadir LLM call para caption generation

public/
└── llms.txt                         ← Nuevo: AI agent visibility file (ai-seo skill)
```

---

## Anti-patrones a evitar

- **No copiar el SKILL.md completo al system prompt** — los SKILL.md tienen 200-500 líneas; copiarlos completos consume context window y degrada quality. Destilar solo los frameworks aplicables a GAFF (50-150 palabras por skill).
- **No añadir LLM donde el proceso es determinístico y correcto** — el Analytics Agent hace cálculos financieros precisos; añadir LLM ahí introduce alucinaciones. Solo añadir LLM donde la generación de texto natural agrega valor.
- **No usar `gpt-4o` donde `gpt-4o-mini` es suficiente** — clasificación, drafts de respuestas de reviews, y follow-up generation son tareas para mini; solo chat interactivo y SEO content full usa gpt-4o.
- **No cambiar los cron routes** — los entrypoints en `src/app/api/cron/` son la interfaz correcta; la integración de skills es solo en las libraries bajo `src/lib/`.

---

## Pitfalls comunes

### Pitfall 1: Context window overflow en system prompts
**Qué sale mal:** Inyectar demasiado contenido de skills hace que el modelo ignore la parte final del prompt.
**Por qué ocurre:** GPT-4o-mini tiene ~128k context pero la atención decae en prompts largos.
**Cómo evitar:** Destilar cada skill a ≤150 palabras. Priorizar los 3-4 frameworks más relevantes por agente.
**Señales de alerta:** Respuestas que ignoran instrucciones tardías en el prompt.

### Pitfall 2: Email content generation sin contexto de cliente
**Qué sale mal:** CRM Agent genera emails genéricos aunque tenga el framework de email-sequence.
**Por qué ocurre:** El modelo necesita el contexto específico del cliente (species, last trip, total trips) en el user message para personalizar.
**Cómo evitar:** Siempre pasar los datos del cliente como structured JSON en el user message, no en el system prompt.

### Pitfall 3: pSEO genera URLs duplicadas
**Qué sale mal:** Múltiples fishing reports del mismo mes tienen slugs en conflicto.
**Por qué ocurre:** `getUniqueSlug()` usa solo `baseSlug + date` — si hay dos reports el mismo día, colisionan.
**Cómo evitar:** Incluir `bookingId.slice(0, 8)` en el slug de fishing reports.

### Pitfall 4: Marketing Agent genera captions sin aprobación humana
**Qué sale mal:** Content generado por LLM se auto-publica sin revisión.
**Por qué ocurre:** El pipeline de publish ya tiene el cron wired.
**Cómo evitar:** Las captions generadas por LLM deben ir a status `draft` en `marketing_posts`, no `scheduled`. El admin aprueba antes de publicar.

---

## Ejemplos de system prompts mejorados

### Lead Agent — antes y después

```typescript
// ANTES (1 línea)
"Classify GAFF fishing charter leads as hot, warm, or cold. Return valid JSON with classification, confidence, reason, and nextAction."

// DESPUÉS (~25 líneas)
`Classify leads for GAFF All Fishing Los Cabos — a premium sport fishing charter in Cabo San Lucas, México targeting US tourists.

CLASSIFICATION:
- hot: booking intent clear + urgency signals present (preferred date ≤14 days, marlin peak Oct-Nov, group ≥6, luxury/large boat requested, notes mention "book/ready/today")
- warm: genuine interest, moderate urgency (date 15-45 days, 1-2 contact signals, group 3-5)
- cold: exploratory, far future, single signal, no date provided

BUYER PSYCHOLOGY TO APPLY:
- Goal-gradient: closer to preferred date = lower threshold for hot
- Scarcity: Oct-Nov marlin season = any lead with those dates biased toward hot
- Group commitment: groups ≥6 are family/corporate = higher sunk cost = higher conversion
- Loss aversion: "last minute" + "only 2 spots" framing in nextAction for hot leads

Return JSON: { classification, confidence (0-1), reason (1 sentence), nextAction (1 actionable instruction) }`
```

### SEO Agent — antes y después

```typescript
// ANTES (4 líneas)
const SEO_SYSTEM_PROMPT = "You are an SEO content writer for GAFF All Fishing..."

// DESPUÉS (~30 líneas)
const SEO_SYSTEM_PROMPT = `You are an SEO content writer for GAFF All Fishing Los Cabos — premium sport fishing charter targeting US tourists searching Google and AI assistants.

CONTENT STRUCTURE (every post):
- Opening: direct answer to the search query in first 2 sentences (AI citation-ready)
- Sections: How-to or listicle format with H2/H3 headers (extractable by AI)
- FAQ section: minimum 3 Q&A pairs targeting related searches
- CTA: always end with specific booking invitation linking to /booking

PROGRAMMATIC SEO URL PATTERN (fishing reports):
- Slug format: [species]-fishing-cabo-[month]-[year] (e.g., marlin-fishing-cabo-october-2026)
- Hub pages: cluster reports by species and by month for internal linking

AI VISIBILITY:
- Include specific data points ("Yellowfin tuna peaks May-December in Cabo")
- Source claims to GAFF's real trip data when available
- Use definition blocks for species, seasons, and fishing terms

TONE: knowledgeable, premium, practical. Never keyword-stuffed. Write for the angler planning their trip, not a search algorithm.`
```

---

## Ambiente y dependencias

| Dependencia | Requerida por | Disponible | Versión | Fallback |
|-------------|--------------|------------|---------|----------|
| OpenAI API key | Todos los agentes con LLM | Si (ya en prod) | GPT-4o / GPT-4o-mini | Heurístic fallback ya existe en lead-agent |
| git (submodule) | Instalación marketingskills | Si | — | Clone directo |
| Resend | Email campaigns CRM | Si (ya en prod) | — | — |
| Redis (Upstash) | Schedule persistence | Si (ya en prod) | — | — |
| OPENAI_REVIEW_MODEL env | Reviews Agent | Si (documentado en .env.example) | gpt-4o-mini | fallback a template |

[VERIFIED: .env.example y archivos de agentes inspeccionados]

**Sin dependencias bloqueantes.** Todos los servicios externos requeridos ya están en producción.

---

## Validación

No hay test framework instalado en el proyecto [VERIFIED: no se encontró pytest.ini, jest.config, ni vitest.config]. Los planes de fases anteriores pasaron verificación con `npm run type-check` y `npm run lint`.

**Criterio de verificación por tarea:**
- `npm run type-check` — obligatorio después de cada cambio en archivos `.ts`
- `npm run lint` — obligatorio después de cada cambio
- Smoke test manual: para agentes con LLM, incluir un script de test ad-hoc que llame al agente con un lead/review/content de ejemplo y verifique que el output sigue la nueva estructura

---

## Preguntas abiertas

1. **¿Las páginas de fishing reports deben ser públicas?**
   - Lo que sabemos: Los seo_posts están en DB con status draft/scheduled/published. La ruta pública `/blog/[slug]` aún no está implementada (no hay route en `src/app/blog/`).
   - Lo que no está claro: ¿El cliente quiere publicar los fishing reports como páginas públicas indexadas? Es el mayor beneficio de pSEO.
   - Recomendación: El planner debe asumir que sí y crear las routes; si el cliente decide no hacerlo, se omite.

2. **¿El competitor tracking debe ser real-time o simulado?**
   - Lo que sabemos: `buildKeywordReport()` retorna datos simulados. La skill `competitor-profiling` recomienda DataForSEO o Ahrefs para datos reales.
   - Lo que no está claro: ¿Hay budget para una API de SEO ($50-200/mes)?
   - Recomendación: Mantener simulado en Phase 9; marcar como v2 item. Enriquecer el system prompt del SEO Agent con el framework de competitor analysis sin necesidad de API real.

3. **¿La CRM campaign execution está conectada a Resend?**
   - Lo que sabemos: `scheduleClientLifecycleCampaigns()` persiste en Redis pero no hay cron route que consuma los schedules y dispare los emails.
   - Lo que no está claro: ¿El cron de `trips/remind` ya cubre esto o es un gap no implementado?
   - Recomendación: El planner debe auditar `src/app/api/cron/trips/remind/route.ts` y conectar el loop.

---

## Assumptions Log

| # | Claim | Sección | Riesgo si es incorrecto |
|---|-------|---------|------------------------|
| A1 | `coreyhaines31/marketingskills` tiene licencia MIT | Standard Stack | Restricciones de uso comercial imprevistas |
| A2 | GPT-4o-mini es suficiente para generación de email content CRM | Architecture Patterns | Output de menor calidad; upgrade a gpt-4o agrega costo |
| A3 | Las páginas de fishing reports deben ser públicas para indexación | Programmatic SEO | Si cliente no quiere páginas públicas, el beneficio pSEO desaparece |
| A4 | No existe route `/blog/[slug]` pública actualmente | Architecture Patterns | Si ya existe, el trabajo de creación de route se omite |

---

## Fuentes

### Primarias (HIGH confidence)
- `src/lib/agents/lead-agent.ts` — auditado directamente [VERIFIED: lectura directa]
- `src/lib/agents/chat-agent.ts` — auditado directamente [VERIFIED: lectura directa]
- `src/lib/chat/follow-up.ts` — auditado directamente [VERIFIED: lectura directa]
- `src/lib/crm/campaigns.ts` — auditado directamente [VERIFIED: lectura directa]
- `src/lib/reviews/sync.ts` — auditado directamente [VERIFIED: lectura directa]
- `src/lib/seo/generator.ts` — auditado directamente [VERIFIED: lectura directa]
- `src/lib/social/engagement.ts` — auditado directamente [VERIFIED: lectura directa]
- `src/lib/analytics-agent.ts` — auditado directamente [VERIFIED: lectura directa]
- `github.com/coreyhaines31/marketingskills` — inspeccionado directamente [VERIFIED: WebFetch multiple páginas]

### Secundarias (MEDIUM confidence)
- AGENTS.md de marketingskills — leído via WebFetch [CITED: github.com/coreyhaines31/marketingskills/AGENTS.md]
- SKILL.md de email-sequence, marketing-psychology, copywriting, programmatic-seo, ai-seo, social-content, churn-prevention, customer-research, competitor-profiling, analytics-tracking — leídos via WebFetch [CITED: github.com/coreyhaines31/marketingskills/skills/*/SKILL.md]
- product-marketing-context SKILL.md — leído via WebFetch [CITED: github.com/coreyhaines31/marketingskills/skills/product-marketing-context/SKILL.md]

---

## Metadata

**Desglose de confianza:**
- Mapa de agentes existentes: HIGH — código fuente leído directamente
- Contenido de skills de marketingskills: HIGH — SKILL.md leídos directamente via WebFetch
- Patrón de integración recomendado: MEDIUM — basado en documentación del repo + análisis del código; no hay precedente en el proyecto
- Quick wins / priorización: MEDIUM — lógica de negocio asumida basada en impacto estimado

**Fecha de investigación:** 2026-04-29
**Válido hasta:** 2026-06-01 (skills de marketing son estables; verificar VERSIONS.md del repo antes de instalar)
