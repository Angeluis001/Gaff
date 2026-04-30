# Phase 10 — OpenClaw WhatsApp Agent Expansion

**Objetivo:** Convertir el canal WhatsApp de GAFF de recepción pasiva de leads a un agente conversacional completo que responde, vende, hace upsell, recolecta reseñas y nutre leads fríos — todo de forma automática a través de OpenClaw.

**Estado del punto de partida:**
- ✅ Inbound WhatsApp → lead ingestion (ya implementado)
- ✅ Booking confirmation WhatsApp al pagar depósito (ya implementado en Stripe webhook)
- ✅ Recordatorio pre-viaje 48h (ya implementado)
- ✅ Follow-up secuencias hot/warm/cold — 2 pasos (ya implementado)
- ❌ Respuestas automáticas — el agente recibe mensajes pero NO responde
- ❌ Review collection post-viaje
- ❌ Nurturing extendido para leads fríos (>2 pasos)
- ❌ Upsell post-booking
- ❌ Escalación a humano con alerta admin

---

## Features a implementar

| # | Feature | Complejidad | Impacto |
|---|---------|-------------|---------|
| F1 | Agente conversacional bidireccional | Alta | 🔴 Crítico |
| F2 | Review collection post-viaje | Baja | 🟡 Alto |
| F3 | Nurturing extendido cold leads (5 pasos) | Baja | 🟡 Medio |
| F4 | Upsell post-booking (48h) | Baja | 🟠 Medio |
| F5 | Escalación a humano + alerta admin | Media | 🟡 Alto |

---

## F1 — Agente Conversacional Bidireccional

### Qué hace
Cuando un cliente envía cualquier mensaje por WhatsApp, el agente GPT-4o responde inteligentemente usando el contexto de la conversación y herramientas en tiempo real.

### DB: Nueva tabla `whatsapp_sessions`
```sql
CREATE TABLE whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_number TEXT NOT NULL,
  lead_id UUID REFERENCES leads(id),
  messages JSONB NOT NULL DEFAULT '[]', -- [{role, content, timestamp}]
  status TEXT NOT NULL DEFAULT 'active', -- active | escalated | closed
  escalation_reason TEXT,
  last_message_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX ON whatsapp_sessions(whatsapp_number);
CREATE INDEX ON whatsapp_sessions(lead_id);
```

### Herramientas del agente (tool calls)
| Tool | Descripción | Fuente |
|------|------------|--------|
| `check_availability` | Verifica disponibilidad de barco en una fecha | `boat_availability` table |
| `get_pricing` | Precios por tipo de viaje y categoría de barco | `boats` table |
| `get_booking_link` | Genera enlace de booking con fecha/barco preseleccionado | Genera URL `/booking?date=...&boat=...` |
| `get_seasons_info` | Temporadas y especies por mes | `chatFaqCatalog` |
| `answer_faq` | Responde preguntas comunes sobre GAFF | `chatFaqCatalog` |
| `escalate_to_human` | Escala la conversación y alerta al admin | Crea actividad + notifica admin |

### System prompt del agente
```
Eres el asistente virtual de GAFF All Fishing Los Cabos, una empresa premium de pesca deportiva en Cabo San Lucas, México.

Tu rol: ayudar a turistas estadounidenses a planear y reservar su charter de pesca. Responde siempre en el mismo idioma que el cliente (inglés o español).

GAFF ofrece:
- Standard (26ft, hasta 4 personas, desde $550)
- Midsize (31ft, hasta 6 personas, desde $850)
- Large (38ft, hasta 8 personas, desde $1,250)
- Luxury (45ft, hasta 10 personas, desde $1,950)

Temporadas destacadas: Marlín (Jun-Nov), Atún (May-Dic), Dorado (Jun-Oct), Wahoo (Jul-Nov).

Reglas:
- Sé amigable, confiado y directo. No uses formatos genéricos de bot.
- Para disponibilidad usa siempre la herramienta check_availability.
- Cuando el cliente quiera reservar, usa get_booking_link y comparte el enlace.
- Si el cliente menciona cancelar, cambiar fecha, o tiene un problema urgente, usa escalate_to_human.
- Si no puedes resolver algo, escala al equipo.
- Mantén las respuestas cortas para WhatsApp (máx 3-4 líneas por mensaje).
```

### Archivos a crear/modificar
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/lib/db/schema/whatsapp-sessions.ts` | CREAR | Schema Drizzle de la tabla |
| `src/lib/db/schema/index.ts` | MODIFICAR | Exportar nuevo schema |
| `src/lib/db/migrations/0003_whatsapp_sessions.sql` | CREAR | Migration SQL |
| `src/lib/agents/chat-agent.ts` | CREAR | Agente GPT-4o con tool calls |
| `src/lib/chat/conversation.ts` | CREAR | get/update session, append message |
| `src/app/api/channels/openclaw/route.ts` | MODIFICAR | Llamar al agente después de ingestar lead, enviar reply |

### Flujo completo
```
Cliente WhatsApp → OpenClaw → POST /api/channels/openclaw
  → verifyRequest (401 si inválido)
  → normalizePayload
  → ingestInboundLead (crea/actualiza lead)
  → getOrCreateSession(whatsappNumber, leadId)
  → appendMessage(session, { role: "user", content: message })
  → runChatAgent(session, lead) → { reply, tool_calls }
  → appendMessage(session, { role: "assistant", content: reply })
  → sendWhatsAppMessage(whatsappNumber, reply)
  → return { received: true, leadId, replied: true }
```

---

## F2 — Review Collection Post-viaje

### Qué hace
El día después de un viaje completado, el sistema envía automáticamente un WhatsApp pidiendo reseña en Google.

### DB: Nuevo campo en `bookings`
```sql
ALTER TABLE bookings ADD COLUMN review_request_sent_at TIMESTAMP;
```

### Nuevo cron endpoint
`POST /api/cron/trips/review-request`

**Lógica:**
1. Calcular "ayer" en zona horaria Mazatlan
2. Buscar bookings: `status = 'completed'` AND `date` entre ayer 00:00 y 23:59 AND `review_request_sent_at IS NULL`
3. Para cada booking, obtener lead asociado
4. Enviar WhatsApp:
   ```
   🎣 *¡Gracias por pescar con GAFF All Fishing!*

   Esperamos que tu viaje haya sido increíble.
   ¿Podrías dejarnos una reseña en Google? Solo toma 2 minutos y ayuda a otros anglers a encontrarnos.

   ⭐ [Link Google Reviews]

   ¡Hasta la próxima en el agua!
   ```
5. Marcar `review_request_sent_at = now()`
6. Registrar actividad en `lead_activities`

### Archivos a crear/modificar
| Archivo | Acción |
|---------|--------|
| `src/lib/db/migrations/0004_booking_review_request.sql` | CREAR |
| `src/lib/db/schema/bookings.ts` | MODIFICAR (agregar campo) |
| `src/app/api/cron/trips/review-request/route.ts` | CREAR |
| `vercel.json` | MODIFICAR (agregar cron `0 14 * * *` = 7am Mazatlan) |

---

## F3 — Nurturing Extendido para Leads Fríos

### Qué hace
Los leads clasificados como "cold" actualmente solo reciben 2 mensajes (48h email + 7d email). Se extiende a 5 pasos con contenido de alto valor para re-activarlos.

### Nuevos pasos para cold leads
| Step | Delay | Canal | Contenido |
|------|-------|-------|-----------|
| 0 | 48h | email | "Plan your future Cabo fishing trip" (ya existe) |
| 1 | 7d | email | "A better date for your GAFF charter" (ya existe) |
| 2 | 14d | whatsapp | Fishing report semanal: qué está picando ahora |
| 3 | 21d | whatsapp | Seasonal hook: mejor temporada para su especie favorita |
| 4 | 30d | email | "Final offer" con urgencia y disponibilidad limitada |

### Archivos a modificar
| Archivo | Acción |
|---------|--------|
| `src/lib/chat/follow-up.ts` | MODIFICAR (agregar steps 2-4 para cold) |

---

## F4 — Upsell Post-booking (48h)

### Qué hace
48 horas después de que se paga el depósito, el cliente recibe un WhatsApp con opciones de upgrade y add-ons.

### Mensaje
```
🎣 *Tu viaje GAFF está confirmado — ¿lo hacemos aún mejor?*

Tenemos algunas opciones para mejorar tu experiencia:
📸 *Fotografía profesional a bordo* — capturas de pesca de alta calidad
🦐 *Paquete de carnada especial* — carnada viva premium para marlin
🌅 *Salida temprana* — 5:30 AM para más tiempo en el agua

¿Te interesa alguna? Responde a este mensaje.
```

### Dónde agregar
Después de `deposit_paid` en el Stripe webhook, crear un `lead_followup_step` con `dueAt = now + 48h`, `channel = 'whatsapp'`, `stepIndex = 99` (upsell).

### Archivos a modificar
| Archivo | Acción |
|---------|--------|
| `src/app/api/stripe/webhook/route.ts` | MODIFICAR (crear followup_step de upsell) |

---

## F5 — Escalación a Humano + Alerta Admin

### Qué hace
Cuando el agente conversacional detecta que necesita intervención humana (cancelación, problema urgente, cliente frustrado), escala la sesión y notifica al admin por WhatsApp y email.

### Lógica de escalación (parte del agente F1)
El tool `escalate_to_human(reason)`:
1. Actualiza `whatsapp_sessions.status = 'escalated'` con `escalation_reason`
2. Envía WhatsApp al cliente: "Estoy conectándote con nuestro equipo, te contactarán en breve."
3. Envía WhatsApp al número admin (env var `ADMIN_WHATSAPP_NUMBER`) con:
   - Nombre del cliente
   - Teléfono
   - Último mensaje
   - Razón de escalación
4. Registra actividad en `lead_activities` con `type = 'escalation'`

### Variables de entorno nuevas
| Variable | Descripción |
|----------|-------------|
| `ADMIN_WHATSAPP_NUMBER` | Número del dueño/operador para alertas de escalación |
| `GOOGLE_REVIEW_URL` | Link directo a la página de reseñas de Google |

### Archivos a modificar
| Archivo | Acción |
|---------|--------|
| `src/lib/agents/chat-agent.ts` | Ya incluido en F1 — tool `escalate_to_human` |
| `.env.example` | Agregar nuevas vars |

---

## Orden de ejecución

```
F3 → F4 → F2 → F5 → F1
```

**Razonamiento:**
- F3 y F4 son cambios pequeños a código ya existente — sin nuevas tablas, sin riesgo.
- F2 agrega una tabla nueva y un cron — bajo riesgo, alto valor.
- F5 es parte integral de F1 (el tool `escalate_to_human`) — se implementan juntos.
- F1 es el más complejo (nueva tabla, nuevo agente, modificar webhook) — va último cuando el resto ya funciona.

---

## Migrations necesarias

| # | Archivo | Contenido |
|---|---------|-----------|
| 0003 | `whatsapp_sessions.sql` | Tabla whatsapp_sessions + índices |
| 0004 | `booking_review_request.sql` | Columna `review_request_sent_at` en bookings |

---

## Variables de entorno nuevas

Agregar a `.env.example` y Vercel:

```env
# Agente conversacional
ADMIN_WHATSAPP_NUMBER=    # Número del operador para alertas (ej: 6241234567)
GOOGLE_REVIEW_URL=        # Link directo a Google Reviews de GAFF
OPENCLAW_CHAT_MODEL=      # Modelo para agente chat (default: gpt-4o)
```

---

## Checklist de ejecución

### F3 — Cold lead nurturing extendido
- [x] Modificar `scheduleLeadFollowUps()` en `src/lib/chat/follow-up.ts` — agregar steps 2, 3, 4 para cold
- [ ] Verificar en admin que nuevos steps aparecen en lead_followup_steps

### F4 — Upsell post-booking
- [x] Modificar Stripe webhook para crear followup_step de upsell a T+48h
- [ ] Probar con seed booking que el step se crea correctamente

### F2 — Review collection
- [x] Migration 0004: agregar `review_request_sent_at` a bookings — aplicada en Neon
- [x] Crear `src/app/api/cron/trips/review-request/route.ts`
- [x] Agregar a `vercel.json` cron schedule (`0 15 * * *`)
- [ ] Probar con booking completed de ayer

### F5 + F1 — Agente conversacional + escalación
- [x] Migration 0003: crear tabla `whatsapp_sessions` — aplicada en Neon
- [x] Crear schema Drizzle `src/lib/db/schema/whatsapp-sessions.ts`
- [x] Crear `src/lib/chat/conversation.ts` — getOrCreate, appendMessage, updateStatus
- [x] Crear `src/lib/agents/chat-agent.ts` — GPT-4o con 5 tools
- [x] Modificar `src/app/api/channels/openclaw/route.ts` — llamar agente y enviar reply
- [x] Env vars en Vercel: `OPENCLAW_CHAT_MODEL=gpt-4o`, `ADMIN_WHATSAPP_NUMBER=6241000381`
- [ ] E2E test: enviar WhatsApp "do you have availability on May 10?" y verificar respuesta
- [ ] E2E test: enviar "I need to cancel" y verificar escalación + alerta admin

### ⏳ Pendiente
- [ ] **GOOGLE_REVIEW_URL** — agregar en Vercel una vez que esté disponible el link de Google Business Profile de GAFF
