---
phase: quick
plan: 260428-kaq
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - src/lib/admin/navigation.ts
  - src/lib/admin/connections.ts
  - src/app/api/admin/connections/route.ts
  - src/app/admin/(protected)/connections/page.tsx
  - src/components/admin/ConnectionsCanvas.tsx
autonomous: true
requirements:
  - connections-module

must_haves:
  truths:
    - "Admin user sees a Connections link in nav immediately after Dashboard"
    - "Search box accepts name or email and returns up to 10 lead/client/booking matches"
    - "Selecting a result renders a React Flow canvas with color-coded nodes"
    - "Leads = blue nodes, conversations/activities = yellow, bookings = green, clients = purple"
    - "Clicking any node navigates to the entity's existing detail page"
    - "Canvas is empty/instructional before a search result is selected"
  artifacts:
    - path: "src/lib/admin/connections.ts"
      provides: "Graph data fetcher — returns ConnectionGraph for a given entity"
    - path: "src/app/api/admin/connections/route.ts"
      provides: "GET /api/admin/connections?type=lead|client|booking&id=xxx"
      exports: ["GET"]
    - path: "src/app/admin/(protected)/connections/page.tsx"
      provides: "Server page shell with AdminPageHeader, renders ConnectionsCanvas"
    - path: "src/components/admin/ConnectionsCanvas.tsx"
      provides: "Client component — search input + React Flow canvas"
  key_links:
    - from: "src/components/admin/ConnectionsCanvas.tsx"
      to: "/api/admin/connections"
      via: "fetch on search result select"
      pattern: "fetch.*api/admin/connections"
    - from: "src/app/api/admin/connections/route.ts"
      to: "src/lib/admin/connections.ts"
      via: "getConnectionGraph()"
---

<objective>
Add a Connections module to the admin panel that visualises the entity graph for any
lead, client, or booking using an interactive React Flow canvas.

Purpose: Gives operations staff instant visibility into how a record connects to
conversations, bookings, and clients — without clicking through multiple detail pages.
Output: New /admin/connections route, GET API endpoint, React Flow canvas component.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

<!-- Key interfaces the executor needs — no codebase exploration required -->
<interfaces>
<!-- Auth pattern (from src/app/api/admin/boats/route.ts) -->
```typescript
import { getToken } from "next-auth/jwt"
import { getAdminAuthSecret } from "@/lib/auth/secret"

async function requireAdmin(request: Request) {
  const token = await getToken({ req: request as never, secret: getAdminAuthSecret() })
  return Boolean(token?.id && token.isActive)
}
```

<!-- Navigation (from src/lib/admin/navigation.ts) -->
```typescript
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", description: "Live KPI overview", minimumRole: "viewer" },
  // INSERT HERE — Connections after Dashboard
  { href: "/admin/leads", label: "Leads", ... },
  ...
]
```

<!-- Schema FK relationships -->
// leads.id → leadActivities.leadId (one-to-many)
// leads.id → bookings.leadId (one-to-many)
// leads.convertedToClientId → clients.id (nullable FK)
// bookings.clientId → clients.id (nullable FK)
// bookings.leadId → leads.id (nullable FK)

<!-- Schema tables (Drizzle) -->
import { leads, leadActivities, bookings, clients } from "@/lib/db/schema"
// leads: { id: uuid, firstName, lastName, email, phone, status, classification, source, convertedToClientId }
// leadActivities: { id: serial, leadId: uuid, type, description, agentId, createdAt }
// bookings: { id: uuid, leadId, clientId, boatId, date, tripType, status, totalPrice }
// clients: { id: uuid, firstName, lastName, email, phone, totalTrips, totalSpend }

<!-- AdminPageHeader -->
```typescript
<AdminPageHeader eyebrow="..." title="..." description="..." actions={...} />
// Props: title, description?, eyebrow?, actions?: React.ReactNode, className?
```

<!-- Page pattern (server component) -->
export default async function AdminXxxPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader eyebrow="..." title="..." description="..." />
      {/* content */}
    </div>
  )
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install @xyflow/react and build data layer</name>
  <files>
    package.json,
    src/lib/admin/connections.ts,
    src/app/api/admin/connections/route.ts
  </files>
  <action>
**Step A — Install React Flow v12:**
Run `npm install @xyflow/react` in the project root. This is @xyflow/react (v12), NOT the legacy reactflow package.

**Step B — Create src/lib/admin/connections.ts:**

Define and export these types:

```typescript
export type ConnectionNodeType = "lead" | "activity" | "booking" | "client"

export interface ConnectionNode {
  id: string
  type: ConnectionNodeType
  label: string
  sublabel?: string       // e.g. status, email
  href: string            // navigate-to URL on click
}

export interface ConnectionEdge {
  id: string
  source: string
  target: string
  label?: string
}

export interface ConnectionGraph {
  nodes: ConnectionNode[]
  edges: ConnectionEdge[]
  rootId: string          // id of the searched entity
}
```

Then implement `getConnectionGraph(entityType: "lead" | "client" | "booking", entityId: string): Promise<ConnectionGraph | null>`.

Graph assembly logic:

**When entityType = "lead":**
- Root node: the lead (id = `lead-{lead.id}`)
- Query: SELECT that lead, its leadActivities (up to 20, newest first), its bookings (all), and — if convertedToClientId is set — the client row
- Activity nodes: id = `activity-{activity.id}`, href = `/admin/leads/{lead.id}` (activities shown on lead detail)
- Booking nodes: id = `booking-{booking.id}`, href = `/admin/bookings/{booking.id}`
- Client node (if exists): id = `client-{client.id}`, href = `/admin/clients/{client.id}`
- Edges: lead→each activity, lead→each booking, lead→client (if present), booking→client (if booking.clientId matches)

**When entityType = "client":**
- Root node: the client (id = `client-{client.id}`)
- Query: SELECT that client, its bookings (all), and — for each booking that has a leadId — the lead row
- Booking nodes: href = `/admin/bookings/{booking.id}`
- Lead nodes (if found): href = `/admin/leads/{lead.id}`
- Activity nodes: for each lead, SELECT its leadActivities (up to 10 newest per lead), href = `/admin/leads/{lead.id}`
- Edges: client→each booking, booking→lead (if lead exists), lead→each activity

**When entityType = "booking":**
- Root node: the booking (id = `booking-{booking.id}`)
- Query: SELECT that booking, then lead (if booking.leadId), client (if booking.clientId), activities for the lead (if any, up to 15)
- Edges: booking→lead (if exists), booking→client (if exists), lead→each activity

**Search function** — also export:
```typescript
export interface ConnectionSearchResult {
  id: string
  type: "lead" | "client" | "booking"
  label: string
  sublabel: string
}

export async function searchConnectionEntities(q: string): Promise<ConnectionSearchResult[]>
```
- q is trimmed, lowercase. Return up to 10 results across all three tables.
- Query: db.select() from leads, clients, bookings in parallel (Promise.all).
- Filter leads: match against `${firstName} ${lastName}` or email (case-insensitive substring).
- Filter clients: match against `${firstName} ${lastName}` or email.
- Filter bookings: match against booking.id (exact prefix) — bookings don't have names, so show id + status + date.
- Merge and slice to 10 total (4 leads, 4 clients, 2 bookings preference — or just sort by type and take first 10).
- Return `{ id, type, label, sublabel }` — e.g. label = full name, sublabel = email or status.

**Step C — Create src/app/api/admin/connections/route.ts:**

```typescript
import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { getAdminAuthSecret } from "@/lib/auth/secret"
import { getConnectionGraph, searchConnectionEntities } from "@/lib/admin/connections"

async function requireAdmin(request: Request) {
  const token = await getToken({ req: request as never, secret: getAdminAuthSecret() })
  return Boolean(token?.id && token.isActive)
}

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") as "lead" | "client" | "booking" | null
  const id = searchParams.get("id")
  const q = searchParams.get("q")

  // Search mode: GET /api/admin/connections?q=john
  if (q) {
    const results = await searchConnectionEntities(q.trim())
    return NextResponse.json(results)
  }

  // Graph mode: GET /api/admin/connections?type=lead&id=xxx
  if (!type || !id || !["lead", "client", "booking"].includes(type)) {
    return NextResponse.json({ error: "type and id are required" }, { status: 400 })
  }

  const graph = await getConnectionGraph(type, id)
  if (!graph) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(graph)
}
```
  </action>
  <verify>
    <automated>npm run type-check 2>&1 | grep -E "connections" || echo "No type errors in connections files"</automated>
  </verify>
  <done>
    - @xyflow/react appears in package.json dependencies
    - src/lib/admin/connections.ts exports ConnectionGraph, ConnectionNode, ConnectionEdge, getConnectionGraph, searchConnectionEntities
    - src/app/api/admin/connections/route.ts handles both ?q= search and ?type=&id= graph modes, returns 401 without valid session
    - npm run type-check passes with no errors in the new files
  </done>
</task>

<task type="auto">
  <name>Task 2: Build ConnectionsCanvas client component and page route</name>
  <files>
    src/components/admin/ConnectionsCanvas.tsx,
    src/app/admin/(protected)/connections/page.tsx,
    src/lib/admin/navigation.ts
  </files>
  <action>
**Step A — Create src/components/admin/ConnectionsCanvas.tsx:**

`"use client"` directive at top.

Imports:
```typescript
import { useCallback, useState } from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useRouter } from "next/navigation"
import type { ConnectionGraph, ConnectionSearchResult } from "@/lib/admin/connections"
```

**Node color mapping** — define a constant:
```typescript
const NODE_COLORS: Record<string, string> = {
  lead: "#3b82f6",       // blue-500
  activity: "#eab308",   // yellow-500
  booking: "#22c55e",    // green-500
  client: "#a855f7",     // purple-500
}
```

**Graph-to-ReactFlow transformation** — convert ConnectionGraph to React Flow nodes/edges:
- Each ConnectionNode → React Flow Node with:
  - `id`: same as ConnectionNode.id
  - `data`: `{ label: node.label, sublabel: node.sublabel, href: node.href, type: node.type }`
  - `position`: auto-layout using a simple radial/force layout. Use a simple approach: root node at `{x: 400, y: 300}`, then distribute other nodes in rings (activities inner ring radius 200, bookings/clients outer ring radius 380). Calculate positions using `Math.cos/sin` with equal angular spacing per ring group.
  - `style`: `{ background: NODE_COLORS[node.type], color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "8px 12px", minWidth: 120, fontSize: 12 }`
- Each ConnectionEdge → React Flow Edge with `id`, `source`, `target`, `label`, `style: { stroke: "rgba(255,255,255,0.25)" }`, `labelStyle: { fill: "rgba(255,255,255,0.5)", fontSize: 10 }`

**Component state:**
```typescript
const [searchQuery, setSearchQuery] = useState("")
const [searchResults, setSearchResults] = useState<ConnectionSearchResult[]>([])
const [isSearching, setIsSearching] = useState(false)
const [isLoadingGraph, setIsLoadingGraph] = useState(false)
const [selectedEntity, setSelectedEntity] = useState<ConnectionSearchResult | null>(null)
const [nodes, setNodes, onNodesChange] = useNodesState([])
const [edges, setEdges, onEdgesChange] = useEdgesState([])
const [showDropdown, setShowDropdown] = useState(false)
const router = useRouter()
```

**Search handler** — debounce 300ms using a simple `useEffect` on `searchQuery`:
- If searchQuery.length < 2: clear results, setShowDropdown(false), return
- setIsSearching(true)
- fetch(`/api/admin/connections?q=${encodeURIComponent(searchQuery)}`)
- setSearchResults(data), setShowDropdown(true), setIsSearching(false)

**Select handler** — when user picks a result:
```typescript
async function handleSelectEntity(result: ConnectionSearchResult) {
  setSelectedEntity(result)
  setSearchQuery(result.label)
  setShowDropdown(false)
  setIsLoadingGraph(true)

  const res = await fetch(`/api/admin/connections?type=${result.type}&id=${result.id}`)
  const graph: ConnectionGraph = await res.json()

  const rfNodes = buildRFNodes(graph)
  const rfEdges = buildRFEdges(graph)
  setNodes(rfNodes)
  setEdges(rfEdges)
  setIsLoadingGraph(false)
}
```

**Node click handler:**
```typescript
const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
  const href = (node.data as { href?: string }).href
  if (href) router.push(href)
}, [router])
```

**JSX layout:**
```tsx
<div className="flex h-full flex-col gap-4">
  {/* Search bar */}
  <div className="relative">
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search by name or email..."
      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-amber-400/40 focus:outline-none"
    />
    {isSearching && (
      <span className="absolute right-3 top-2.5 text-xs text-white/40">Searching...</span>
    )}
    {showDropdown && searchResults.length > 0 && (
      <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 py-1 shadow-xl">
        {searchResults.map((r) => (
          <button
            key={`${r.type}-${r.id}`}
            onClick={() => handleSelectEntity(r)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: NODE_COLORS[r.type] }}
            />
            <div>
              <div className="text-sm text-white">{r.label}</div>
              <div className="text-xs text-white/45">{r.sublabel} · {r.type}</div>
            </div>
          </button>
        ))}
      </div>
    )}
    {showDropdown && searchResults.length === 0 && !isSearching && searchQuery.length >= 2 && (
      <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white/50 shadow-xl">
        No results found for "{searchQuery}"
      </div>
    )}
  </div>

  {/* Legend */}
  <div className="flex flex-wrap items-center gap-4 text-xs text-white/50">
    {Object.entries(NODE_COLORS).map(([type, color]) => (
      <span key={type} className="flex items-center gap-1.5 capitalize">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        {type === "activity" ? "Conversations" : type}
      </span>
    ))}
    <span className="ml-auto">Click any node to open its detail page</span>
  </div>

  {/* Canvas */}
  <div className="relative min-h-[520px] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
    {isLoadingGraph && (
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <span className="text-sm text-white/50">Loading graph...</span>
      </div>
    )}
    {!selectedEntity && !isLoadingGraph && (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm text-white/40">Search for a lead, client, or booking above</p>
        <p className="text-xs text-white/25">Select a result to visualise its connections</p>
      </div>
    )}
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      colorMode="dark"
    >
      <Background color="rgba(255,255,255,0.04)" />
      <Controls className="[&_button]:bg-zinc-800 [&_button]:border-white/10 [&_button]:text-white" />
      <MiniMap
        nodeColor={(n) => NODE_COLORS[(n.data as { type?: string }).type ?? "lead"] ?? "#888"}
        maskColor="rgba(0,0,0,0.6)"
        style={{ background: "rgba(0,0,0,0.4)" }}
      />
    </ReactFlow>
  </div>
</div>
```

Export: `export { ConnectionsCanvas }` (named export, not default).

**Step B — Create src/app/admin/(protected)/connections/page.tsx:**

Server component, no `"use client"`. Pattern mirrors Dashboard and Leads pages:

```typescript
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { ConnectionsCanvas } from "@/components/admin/ConnectionsCanvas"

export default function AdminConnectionsPage() {
  return (
    <div className="flex h-full flex-col space-y-6">
      <AdminPageHeader
        eyebrow="Entity graph"
        title="Connections"
        description="Visualise how leads, conversations, bookings, and clients connect. Search for any record to explore its relationship graph."
      />
      <div className="flex-1">
        <ConnectionsCanvas />
      </div>
    </div>
  )
}
```

**Step C — Update src/lib/admin/navigation.ts:**

Insert the Connections nav item immediately after the Dashboard entry (index 1):

```typescript
{
  href: "/admin/connections",
  label: "Connections",
  description: "Entity relationship graph",
  minimumRole: "viewer",
},
```

The updated ADMIN_NAV_ITEMS array order must be:
1. Dashboard (/admin)
2. Connections (/admin/connections)  ← new
3. Leads (/admin/leads)
4. Clients (/admin/clients)
5. Bookings (/admin/bookings)
6. ... (rest unchanged)
  </action>
  <verify>
    <automated>npm run type-check 2>&1 | tail -5</automated>
  </verify>
  <done>
    - npm run type-check passes with no errors across all new files
    - ConnectionsCanvas.tsx uses "use client", imports from @xyflow/react, exports named ConnectionsCanvas
    - /admin/connections page exists and is a server component using AdminPageHeader
    - navigation.ts has Connections at index 1 (after Dashboard) with minimumRole "viewer"
    - NODE_COLORS maps lead=blue, activity=yellow, booking=green, client=purple
    - Node click handler calls router.push(node.data.href) for detail page navigation
    - Search debounce triggers on queries of 2+ characters
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Browser → GET /api/admin/connections | Unauthenticated callers must be rejected |
| Search input → DB query | Arbitrary text from client used in filter logic |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-kaq-01 | Spoofing | GET /api/admin/connections route | mitigate | requireAdmin() gate via next-auth JWT token — same pattern as all other admin API routes |
| T-kaq-02 | Information Disclosure | Search returning all entity fields | mitigate | searchConnectionEntities returns only id/type/label/sublabel — no PII fields like phone, stripeSessionId, or metadata |
| T-kaq-03 | Denial of Service | Unbounded graph traversal for large datasets | accept | Activities capped at 20 per lead; overall node count bounded — current DB size is small, low risk |
| T-kaq-04 | Injection | searchQuery used in filter | accept | Filtering done in-memory via JS `.includes()` on pre-fetched rows (not raw SQL interpolation) — no SQL injection vector |
</threat_model>

<verification>
1. `npm run type-check` — zero errors
2. `npm run build` — builds without error (optional smoke check)
3. Visit http://localhost:3000/admin/connections — page renders with AdminPageHeader and empty canvas
4. Type a known lead name in the search box — dropdown appears within 300ms
5. Click a result — React Flow canvas renders with color-coded nodes
6. Click a node — browser navigates to the correct detail page (e.g. /admin/leads/[id])
7. Open /admin nav — Connections appears between Dashboard and Leads
</verification>

<success_criteria>
- /admin/connections route renders without errors for any authenticated viewer-level admin
- Search returning up to 10 results across leads, clients, and bookings
- React Flow graph renders with correct node colors: lead=blue (#3b82f6), activity=yellow (#eab308), booking=green (#22c55e), client=purple (#a855f7)
- Clicking a node navigates to its existing detail page
- GET /api/admin/connections returns 401 without a valid session cookie
- npm run type-check exits 0
</success_criteria>

<output>
After completion, create `.planning/quick/260428-kaq-add-connections-module-to-admin-panel-af/260428-kaq-SUMMARY.md` with standard summary format documenting what was built, files modified, and any decisions made.
</output>
