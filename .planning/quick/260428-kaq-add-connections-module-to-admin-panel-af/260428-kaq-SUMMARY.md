---
phase: quick
plan: 260428-kaq
subsystem: admin
tags: [admin, react-flow, graph, connections, navigation]
dependency_graph:
  requires: [admin-panel, leads, clients, bookings, lead-activities]
  provides: [connections-module]
  affects: [admin-navigation]
tech_stack:
  added: ["@xyflow/react@12"]
  patterns: [react-flow-canvas, debounced-search, server-page-client-canvas]
key_files:
  created:
    - src/lib/admin/connections.ts
    - src/app/api/admin/connections/route.ts
    - src/app/admin/(protected)/connections/page.tsx
    - src/components/admin/ConnectionsCanvas.tsx
  modified:
    - src/lib/admin/navigation.ts
    - package.json
decisions:
  - "Used named import { ReactFlow } instead of default import — v12 exports ReactFlow as a named export only"
  - "useNodesState/useEdgesState require explicit Node/Edge generic parameters to avoid never[] inference"
  - "searchConnectionEntities fetches up to 50 rows per table then filters in-memory — safe given current DB size and avoids SQL injection per threat model T-kaq-04"
metrics:
  duration: "~20 minutes"
  completed_date: "2026-04-28"
  tasks_completed: 2
  files_created: 4
  files_modified: 2
---

# Quick Task 260428-kaq: Add Connections Module to Admin Panel — Summary

**One-liner:** React Flow v12 entity graph for admin panel with color-coded nodes (lead=blue, activity=yellow, booking=green, client=purple), debounced search across leads/clients/bookings, and click-to-navigate node interactions.

## What Was Built

### Data Layer — `src/lib/admin/connections.ts`

Exports `getConnectionGraph(entityType, entityId)` which assembles a `ConnectionGraph` (nodes + edges + rootId) by querying Drizzle ORM across leads, leadActivities, bookings, and clients tables. Three entity types supported:

- **lead** — root lead + up to 20 activities + all bookings + optional converted client node
- **client** — root client + all bookings + leads per booking + up to 10 activities per lead
- **booking** — root booking + lead (if any) + client (if any) + up to 15 lead activities

Also exports `searchConnectionEntities(q)` returning up to 10 results (4 leads, 4 clients, 2 bookings) filtered in-memory after fetching 50 rows per table.

### API Route — `src/app/api/admin/connections/route.ts`

`GET /api/admin/connections` with two modes:
- `?q=<term>` — search mode, returns `ConnectionSearchResult[]`
- `?type=lead|client|booking&id=<uuid>` — graph mode, returns `ConnectionGraph`

Protected by `requireAdmin()` via next-auth JWT — returns 401 without valid session.

### Canvas Component — `src/components/admin/ConnectionsCanvas.tsx`

`"use client"` component with:
- Debounced search input (300ms, triggers at 2+ chars) with dropdown of color-dotted results
- React Flow canvas with radial layout (root at center, rings by type at r=200/380/560)
- Color-coded nodes: lead=#3b82f6, activity=#eab308, booking=#22c55e, client=#a855f7
- Background, Controls, MiniMap components from @xyflow/react
- `onNodeClick` calls `router.push(node.data.href)` for detail page navigation
- Empty/instructional state before any entity is selected

### Page Route — `src/app/admin/(protected)/connections/page.tsx`

Server component using `AdminPageHeader` (eyebrow="Entity graph") and rendering `ConnectionsCanvas`.

### Navigation — `src/lib/admin/navigation.ts`

Connections inserted at index 1 (after Dashboard, before Leads) with `minimumRole: "viewer"`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed React Flow v12 named import**
- **Found during:** Task 2 — type-check
- **Issue:** Plan showed `import ReactFlow, { ... }` (default import), but `@xyflow/react` v12 exports `ReactFlow` as a named export only (`export { default as ReactFlow }` from internal container). Default import resolves to the entire module object, not the component.
- **Fix:** Changed to `import { ReactFlow, ... }` named import.
- **Files modified:** `src/components/admin/ConnectionsCanvas.tsx`
- **Commit:** 5117dc2

**2. [Rule 1 - Bug] Fixed useNodesState/useEdgesState never[] inference**
- **Found during:** Task 2 — type-check
- **Issue:** `useNodesState([])` with empty initial array infers `never[]`, making `setNodes(rfNodes)` fail with `Node not assignable to never`.
- **Fix:** Added explicit generics — `useNodesState<Node>([])` and `useEdgesState<Edge>([])`.
- **Files modified:** `src/components/admin/ConnectionsCanvas.tsx`
- **Commit:** 5117dc2

## Threat Model Compliance

| Threat ID | Status |
|-----------|--------|
| T-kaq-01 | Mitigated — `requireAdmin()` gate on all responses |
| T-kaq-02 | Mitigated — search returns only id/type/label/sublabel (no phone, stripeSessionId, metadata) |
| T-kaq-03 | Accepted — activities capped at 20/15/10 per query |
| T-kaq-04 | Accepted — in-memory `.includes()` filtering, no raw SQL interpolation |

## Known Stubs

None — all data is fetched live from the database via Drizzle ORM queries.

## Threat Flags

None — no new trust boundaries beyond the documented GET /api/admin/connections endpoint which is already in the plan's threat model.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | 11cfe41 | feat(quick-260428-kaq): install @xyflow/react and build connections data layer |
| Task 2 | 5117dc2 | feat(quick-260428-kaq): build ConnectionsCanvas component, connections page, and nav entry |

## Self-Check: PASSED

- [x] `src/lib/admin/connections.ts` — exists
- [x] `src/app/api/admin/connections/route.ts` — exists
- [x] `src/app/admin/(protected)/connections/page.tsx` — exists
- [x] `src/components/admin/ConnectionsCanvas.tsx` — exists
- [x] Commit 11cfe41 — exists
- [x] Commit 5117dc2 — exists
- [x] `npm run type-check` — exits 0
