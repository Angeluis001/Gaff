# Review Plan: GAFF Phases

Estado general:
- La implementación de fases 1 a 8 quedó cerrada en el código y en el roadmap.
- Aun así, queda trabajo abierto de configuración para que el sistema quede plenamente funcional en entorno real.
- En especial, hay dependencias externas que necesitan credenciales, variables de entorno, cuentas activas, cron jobs y validación en vivo.
- La fase 3 sigue marcada como `implemented - pending live verification` en el roadmap.

## Configuración abierta

Antes de considerar el sistema completamente operativo, revisar y completar:
- Variables de entorno de producción en Vercel.
- Credenciales activas para Stripe, Resend, NextAuth, OpenAI, Meta, TikTok, OpenClaw y Vercel Cron.
- DNS y dominio final si se va a usar el sitio público como producción definitiva.
- Schedules de cron para SEO, social publishing, analytics, leads y reviews.
- Verificación de que los endpoints externos aceptan los tokens y devuelven respuestas reales.

## Plan De Revisión Por Fase

### Fase 1: Foundation
Revisar:
- Migraciones aplicadas en Neon.
- Conexión a Redis y Sentry.
- Build y despliegue base.
- Si el entorno prod/preview coincide con `.env.example`.

### Fase 2: Landing Page
Revisar:
- Rendimiento y carga inicial.
- SEO metadata y Open Graph.
- Idiomas y navegación.
- Tracking de analytics y chat.

### Fase 3: Booking & Payments
Revisar:
- Flujo completo de booking.
- Stripe checkout en vivo.
- Webhook y confirmación de pago.
- Email de confirmación y bloqueo de disponibilidad.
- Esta fase sigue siendo la más sensible para verificación en producción.

### Fase 4: Admin Dashboard
Revisar:
- Login admin y persistencia de sesión.
- Protección de rutas.
- KPIs y tablas del dashboard.
- Fleet, bookings, leads, clients, agents, marketing, SEO, reviews y settings.

### Fase 5: Chat & Lead Agent
Revisar:
- Botpress en landing.
- OpenClaw conectado.
- Ingesta de leads desde web y WhatsApp.
- Clasificación hot/warm/cold.
- Follow-ups y alertas de leads calientes.

### Fase 6: CRM & Reviews Agent
Revisar:
- Creación y enriquecimiento de client records al completar bookings.
- Campaign scheduling post-trip.
- Polling de reviews.
- Draft responses.
- Alertas por reseñas bajas.

### Fase 7: SEO & Marketing Agents
Revisar:
- Generación semanal de SEO posts y fishing reports.
- Persistencia en `seo_posts`.
- Calendario de marketing.
- Publicación Meta/TikTok.
- Estado de queue y ads readiness.

### Fase 8: Analytics Agent
Revisar:
- KPIs del dashboard.
- Reportes diarios y semanales por email.
- Alertas inteligentes.
- Cobertura de marketing y SEO dentro del reporte.

## Criterio De Cierre

La plataforma puede considerarse completamente funcional cuando:
- Todos los env vars de producción estén configurados.
- Los cron jobs estén activos y verificables.
- Los servicios externos respondan con credenciales válidas.
- La fase 3 pase verificación en vivo.
- Los reportes/alertas de fases 7 y 8 se hayan observado al menos una vez en producción.

## Siguiente Paso Recomendado

Ejecutar una revisión fase por fase desde producción, empezando por:
1. Fase 3
2. Fase 4
3. Fase 5
4. Fase 6
5. Fase 7
6. Fase 8

