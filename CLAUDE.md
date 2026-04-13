<!-- GSD:project-start source:PROJECT.md -->
## Project

**GAFF All Fishing Los Cabos**

A full-stack digital platform for GAFF All Fishing, a sport fishing charter company in Los Cabos, B.C.S., México. The platform serves US tourists seeking deep-sea fishing experiences via a premium landing page with real-time booking, and automates the entire customer lifecycle — from discovery through post-trip follow-up — using a suite of 7 AI agents. Built by AUREON Digital Agency.

**Core Value:** A US tourist discovers GAFF on Google or Instagram, checks real-time boat availability, books and pays a deposit online without speaking to anyone — and the AI handles follow-up from that moment forward.

### Constraints

- **Tech Stack**: Next.js 15 + TypeScript + Tailwind CSS + Drizzle ORM + Neon PostgreSQL — specified in build pack, not negotiable
- **Hosting**: Vercel (Pro) for Next.js app; Railway/DigitalOcean for OpenClaw WhatsApp gateway
- **AI**: OpenAI GPT-4o as primary LLM for all agents; GPT-4o-mini for high-volume classification tasks
- **Domain**: gaffallfishingloscabos.com
- **Language**: English primary (USA market), Spanish secondary (bilingual UI)
- **Budget (infra)**: ~$140–350 USD/month estimated (Vercel + Neon + Upstash + Resend + OpenAI + OpenClaw hosting)
- **Performance**: Lighthouse > 90, LCP < 2.5s — video hero must be < 5MB optimized
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
