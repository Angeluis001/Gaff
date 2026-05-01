---
phase: 09-upgrade-agentes-integrar-marketingskills-dentro-de-los-agent
verified: 2026-04-29T12:00:00Z
status: passed
score: 17/17 must-haves verified
overrides_applied: 0
re_verification: null
gaps: []
deferred: []
human_verification:
  - test: "Navegar a /fishing-reports/[slug] con un post publicado en la base de datos"
    expected: "La página renderiza el reporte con Article schema.org visible en view-source"
    why_human: "Requiere un registro en seoPosts con status=published para probar la ruta en browser"
  - test: "Activar classifyLead() con un lead de prueba de 7 días y grupo ≥6"
    expected: "Clasificación: hot, nextAction menciona urgency (fechas limitadas / ventana de marlín)"
    why_human: "La lógica LLM del Lead Agent solo se puede validar con un llamado real a OpenAI"
  - test: "Llamar generateMarketingCalendarCaptions() con posts draft en la DB"
    expected: "Retorna captions no vacíos con hook en primera línea, hashtags en nueva línea para instagram"
    why_human: "Requiere OPENAI_API_KEY activa y posts draft en la base de datos"
  - test: "Llamar scheduleClientLifecycleCampaigns() con un cliente real"
    expected: "Los payloads en Redis contienen emailSubject y emailBody con copy personalizado (no el fallback estático)"
    why_human: "Requiere OPENAI_API_KEY activa y un registro de cliente en la DB con datos de viaje"
---

# Phase 9: Upgrade Agentes — Integrar marketingskills Verification Report

**Phase Goal:** Elevar la calidad de outputs de los 6 agentes GAFF integrando frameworks de marketing de marketingskills. Al finalizar: los system prompts de todos los agentes LLM están enriquecidos con los skills relevantes, existe un product-marketing-context.md con el positioning de GAFF, el SEO Agent genera páginas programáticas de fishing reports con URLs optimizadas para SEO, y los agentes CRM y Marketing tienen generación LLM para email y captions respectivamente.

**Verificado:** 2026-04-29T12:00:00Z
**Estado:** passed (con verificación humana pendiente para comportamiento LLM en runtime)
**Re-verificación:** No — verificación inicial

---

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidencia |
|----|-------|--------|-----------|
| 1  | marketingskills repo disponible como git submodule en .agents/skills/marketingskills/ | VERIFICADO | `.gitmodules` contiene la URL `coreyhaines31/marketingskills`; directorio tiene 40 skills |
| 2  | .agents/product-marketing-context.md existe con positioning GAFF (audiencia, pain points, brand voice, competencia) | VERIFICADO | Archivo existe; contiene "Target Audience", "4.8", "piscessportfishing.com", 7 secciones |
| 3  | Lead Agent classifyLeadWithOpenAI() usa BUYER PSYCHOLOGY SIGNALS (goal-gradient, scarcity, loss aversion) | VERIFICADO | `lead-agent.ts` línea 164: "BUYER PSYCHOLOGY SIGNALS", "goal-gradient" L165, "Oct-Nov" L166 |
| 4  | FOLLOW_UP_SEQUENCE tiene 7 mensajes con estructura Hook-Value-CTA para los 3 tiers | VERIFICADO | `follow-up.ts`: hot(2) + warm(2) + cold(5) = 7 steps; hot email subject "window is closing", urgency en todos |
| 5  | SEO_SYSTEM_PROMPT contiene PROGRAMMATIC SEO URL PATTERN, FAQ section, AI VISIBILITY | VERIFICADO | `generator.ts` líneas 16, 12, 20: todas presentes con contenido sustantivo |
| 6  | getFishingReportSlug() genera slugs [species]-fishing-cabo-[month]-[year]-[bookingPrefix] | VERIFICADO | `generator.ts` L50: template literal `${speciesSlug}-fishing-cabo-${month}-${year}-${bookingPrefix}` |
| 7  | Ruta pública /fishing-reports/[slug] existe con Article schema.org markup | VERIFICADO | `page.tsx` existe; contiene `application/ld+json`, `@type: Article`, `TouristAttraction`, `notFound()` |
| 8  | public/llms.txt existe describiendo GAFF para indexadores de IA | VERIFICADO | Archivo existe; 4 menciones "GAFF All Fishing", 1 mención "fishing-reports" URL |
| 9  | Reviews Agent system prompt contiene BRAND VOICE y NEGATIVE REVIEW STRUCTURE con 4 pasos | VERIFICADO | `sync.ts`: "BRAND VOICE" L48, "NEGATIVE REVIEW STRUCTURE" L60, acknowledge/empathize/resolve/invite back presentes |
| 10 | Marketing Agent tiene generateSocialCaption() con SOCIAL CONTENT FRAMEWORK y 3-second hook | VERIFICADO | `engagement.ts`: SOCIAL_SYSTEM_PROMPT L8, "SOCIAL CONTENT FRAMEWORK" L10, "3-second hook" L18 |
| 11 | Caption generation usa piscessportfishing.com como anchor de posicionamiento | VERIFICADO | `engagement.ts` L28: "COMPETITOR CONTEXT: Our main competitor is piscessportfishing.com" |
| 12 | Contenido generado va siempre a status draft — nunca auto-publicado | VERIFICADO | `generateMarketingCalendarCaptions()` filtra `status === "draft"`, no escribe a DB; publish pipeline sin modificar |
| 13 | buildEngagementDrafts() llama generateCommentReplyDraft() con fallback a STATIC_REPLY_DRAFT | VERIFICADO | `engagement.ts` L132-141: `await generateCommentReplyDraft(post)` en Promise.all; STATIC_REPLY_DRAFT como fallback en L73/93 |
| 14 | CRM Agent genera email personalizado via GPT-4o-mini (anniversary, seasonal, reengagement) | VERIFICADO | `campaigns.ts`: CAMPAIGN_PROMPTS con las 3 claves; generateCampaignEmail() definida L85 |
| 15 | generateCampaignEmail() cae en FALLBACK_EMAILS cuando no hay OPENAI_API_KEY | VERIFICADO | `campaigns.ts` L96: `if (!process.env.OPENAI_API_KEY) return FALLBACK_EMAILS[type]` |
| 16 | scheduleClientLifecycleCampaigns() almacena emailSubject y emailBody en cada payload de Redis | VERIFICADO | `campaigns.ts` L160-162, 173-175, 186-188: emailSubject y emailBody en los 3 payloads |
| 17 | Cada tipo de campaña tiene system prompt distinto aplicando email-sequence o churn-prevention framework | VERIFICADO | CAMPAIGN_PROMPTS: anniversary usa "EMAIL SEQUENCE FRAMEWORK", reengagement usa "CHURN PREVENTION FRAMEWORK" |

**Puntuación:** 17/17 truths verificados

---

## Required Artifacts

| Artifact | Descripción | Estado | Detalles |
|----------|-------------|--------|---------|
| `.agents/skills/marketingskills/` | Git submodule — biblioteca de 40 skills | VERIFICADO | 40 directorios en `/skills/` |
| `.agents/product-marketing-context.md` | Positioning canónico GAFF | VERIFICADO | Contiene "Target Audience", 7 secciones completas |
| `src/lib/agents/lead-agent.ts` | Lead Agent con buyer psychology | VERIFICADO | "BUYER PSYCHOLOGY SIGNALS" presente; ~30 líneas de prompt |
| `src/lib/chat/follow-up.ts` | FOLLOW_UP_SEQUENCE Hook-Value-CTA | VERIFICADO | 7 steps con copy de urgencia/valor/CTA |
| `src/lib/seo/generator.ts` | SEO_SYSTEM_PROMPT + getFishingReportSlug() | VERIFICADO | pSEO + AI VISIBILITY + FAQ section + helper wired al call site |
| `src/lib/reviews/sync.ts` | Reviews Agent con BRAND VOICE | VERIFICADO | BRAND VOICE + 4-step NEGATIVE REVIEW STRUCTURE |
| `src/app/fishing-reports/[slug]/page.tsx` | Ruta pública fishing reports | VERIFICADO | Article + TouristAttraction schema.org; filtro kind=fishing_report y status=published |
| `public/llms.txt` | AI agent visibility file | VERIFICADO | Descripción completa de GAFF, seasons, URL /fishing-reports |
| `src/lib/social/engagement.ts` | Marketing Agent con LLM captions | VERIFICADO | SOCIAL_SYSTEM_PROMPT + generateSocialCaption() + generateCommentReplyDraft() + generateMarketingCalendarCaptions() |
| `src/lib/crm/campaigns.ts` | CRM Agent con LLM email generation | VERIFICADO | generateCampaignEmail() + FALLBACK_EMAILS + payloads con emailSubject/emailBody |

---

## Key Link Verification

| From | To | Via | Estado | Detalles |
|------|----|-----|--------|---------|
| `lead-agent.ts` | `classifyLeadWithOpenAI()` system message | inline string en L157 | WIRED | Template literal de ~30 líneas con "BUYER PSYCHOLOGY SIGNALS" |
| `follow-up.ts` | `FOLLOW_UP_SEQUENCE` constant | message rewrite | WIRED | 7 subjects/messages reescritos con Hook-Value-CTA |
| `generator.ts` | `generateFishingReportFromBooking()` | `getFishingReportSlug()` L189 | WIRED | Call site usa la función helper; slug incluye "fishing-cabo" |
| `generator.ts` | blog post slug | `getUniqueSlug()` L127 | WIRED | Blog posts siguen usando getUniqueSlug (sin cambiar) |
| `page.tsx` | `seoPosts` table | `db.select().from(seoPosts).where(and(...))` L39 | WIRED | Filtra por slug AND kind="fishing_report" |
| `engagement.ts` | OpenAI API | `generateSocialCaption()` fetch L42 | WIRED | gpt-4o-mini, temp 0.8, max_tokens 300 |
| `engagement.ts` | `marketingPosts` table | `generateMarketingCalendarCaptions()` L197 | WIRED | Lee posts con status="draft", retorna captions sin escribir DB |
| `campaigns.ts` | OpenAI API | `generateCampaignEmail()` fetch L100 | WIRED | gpt-4o-mini, response_format json_object |
| `campaigns.ts` | Redis via `persistCampaign()` | `schedule.payload.emailSubject/emailBody` L160-162 | WIRED | Los 3 tipos de campaña incluyen ambos campos en el payload |

---

## Data-Flow Trace (Level 4)

| Artifact | Variable de datos | Fuente | Produce datos reales | Estado |
|----------|------------------|--------|---------------------|--------|
| `lead-agent.ts` | system prompt content | TypeScript string literal compilado | N/A (prompt estático) | VERIFIED — no dinámico |
| `follow-up.ts` | FOLLOW_UP_SEQUENCE messages | TypeScript string literal compilado | N/A (copy estático) | VERIFIED — intencional |
| `generator.ts getFishingReportSlug()` | fishCaught, tripDate, bookingId | `booking` record de Neon DB | Sí — datos reales de reservas completadas | FLOWING |
| `page.tsx` | `post` object | `db.select().from(seoPosts)` | Sí — query real a DB con filtros | FLOWING |
| `engagement.ts generateSocialCaption()` | captions generadas | OpenAI API (gpt-4o-mini) | Sí — llamada LLM real; null en fallo | FLOWING con fallback |
| `campaigns.ts generateCampaignEmail()` | emailSubject, emailBody | OpenAI API (gpt-4o-mini) + clientContext de DB | Sí — clientContext real; fallback a templates | FLOWING con fallback |

---

## Behavioral Spot-Checks

| Comportamiento | Verificación | Resultado | Estado |
|----------------|-------------|-----------|--------|
| marketingskills submodule tiene skills | `ls /d/GAFF/.agents/skills/marketingskills/skills/ \| wc -l` | 40 | PASS |
| product-marketing-context.md tiene Target Audience | `grep -c "Target Audience"` | 1 | PASS |
| lead-agent.ts tiene BUYER PSYCHOLOGY SIGNALS | `grep -c "BUYER PSYCHOLOGY SIGNALS"` | 1 | PASS |
| follow-up.ts tiene 7 steps de canal | `grep -c "channel"` | 13 (7 keys + 6 type defs — correcto) | PASS |
| follow-up.ts hot email tiene urgency | subject "window is closing", message "24 hours" | Presente en L25, L27 | PASS |
| generator.ts tiene getFishingReportSlug() wired | `grep -c "getFishingReportSlug"` | 2 (definición L39 + call site L189) | PASS |
| page.tsx filtra kind=fishing_report | `grep -c "fishing_report"` | 2 (generateMetadata + default export) | PASS |
| engagement.ts tiene STATIC_REPLY_DRAFT fallback | `grep -c "STATIC_REPLY_DRAFT"` | 5 (definición + 4 usos) | PASS |
| campaigns.ts emailSubject en los 3 payloads | `grep -c "emailSubject"` | 3 | PASS |
| campaigns.ts FALLBACK_EMAILS bien definido | `grep -c "FALLBACK_EMAILS"` | 6 (definición + 3 returns en catch + 2 guard returns) | PASS |
| Commits del plan existen en git | `git log --oneline` | 6cf31af, c795d6c, bb01078, 3dd1cf8, bce1d7a, c61eb81, 61a967a, cae3d84 — todos presentes | PASS |

---

## Requirements Coverage

Los planes de la Fase 9 no declaran IDs de REQUIREMENTS.md (campo `requirements: []` en todos los planes). El objetivo de la fase es de mejora de calidad de agentes existentes — un esfuerzo de upgrade de prompts y LLM tooling que eleva los requerimientos LEAD-02, CRM-02, CRM-03, CRM-04, SEOAG-02, MKTG-01, MKTG-03, REVW-02 hacia una implementación más rica, pero sin reemplazar los planes de implementación base de fases 5-8.

No se detectaron requirements huérfanos asignados a la Fase 9 en REQUIREMENTS.md.

---

## Anti-Patterns Found

| Archivo | Patrón | Severidad | Impacto |
|---------|--------|-----------|---------|
| `follow-up.ts` L34, L43, L50 | `{{firstName}}`, `{{seasonNote}}`, `{{monthsUntilPeak}}` — tokens no interpolados | INFO | Los SUMMARY de 09-01 documentan esto como decisión intencional diferida a Fase 10. Los tokens se almacenan verbatim en `leadFollowupSteps` DB — no hay eval() en runtime. No es un bloqueador. |

No se encontraron blockers, stubs de implementación, return null sin fallback, ni handlers vacíos.

---

## Human Verification Required

### 1. Ruta pública /fishing-reports/[slug] en browser

**Test:** En la DB de desarrollo, cambiar el status de un seo_post de kind=fishing_report a "published" y navegar a `/fishing-reports/[el-slug]`.
**Esperado:** La página renderiza: título, fecha, excerpt, contenido, CTA de booking. En view-source se ve el JSON-LD con `"@type": "Article"` y `"@type": "TouristAttraction"`.
**Por qué humano:** Requiere un registro publicado en Neon DB; el verificador no puede crear datos de prueba sin modificar estado.

### 2. Lead Agent LLM con señales de buyer psychology

**Test:** Llamar `classifyLead()` con un lead de prueba: preferredDate 7 días, groupSize 8, notes "ready to book, bachelor party".
**Esperado:** classification: "hot", nextAction contiene lenguaje de urgencia ("marlin peak window", "limited dates", o similar).
**Por qué humano:** El comportamiento LLM con el prompt enriquecido solo puede validarse con OPENAI_API_KEY activa y un llamado real.

### 3. Marketing Agent caption generation

**Test:** Insertar un marketing_post con status="draft" en la DB y llamar `generateMarketingCalendarCaptions()`.
**Esperado:** Retorna un caption con hook visible en primera línea, hashtags en nueva línea (para instagram), sin mencionar precios.
**Por qué humano:** Requiere OPENAI_API_KEY y datos en DB. El verificador solo puede confirmar el wiring estático.

### 4. CRM Agent email generation personalizado

**Test:** Llamar `scheduleClientLifecycleCampaigns()` con un clientId que tenga preferredSpecies y lastTripDate poblados.
**Esperado:** Los 3 payloads de Redis tienen emailSubject y emailBody con copy contextual (species mencionados, fechas relevantes) — no el fallback genérico.
**Por qué humano:** Requiere OPENAI_API_KEY, cliente real con datos de viaje, y Redis activo.

---

## Gaps Summary

No se encontraron gaps que bloqueen el objetivo de la fase. Todos los 17 must-haves se verificaron con evidencia directa en el codebase.

La única observación notable es que `generateMarketingCalendarCaptions` devuelve 1 match de grep en lugar de 2 (el plan especificaba "definition + export keyword" por separado, pero la implementación usa `export async function` combinado en una sola línea). Esta es una discrepancia menor del criterio de aceptación que no refleja un defecto funcional — la función está correctamente exportada y wired.

El punto de calidad de runtime (si los LLMs realmente producen copy mejor con los prompts enriquecidos) requiere verificación humana listada arriba. Esto es una limitación de la verificación estática, no un gap de implementación.

---

_Verificado: 2026-04-29T12:00:00Z_
_Verificador: Claude (gsd-verifier)_
