"use client"

import { useCallback, useEffect, useState } from "react"
import {
  ReactFlow,
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

// ─── Node colors ──────────────────────────────────────────────────────────────

const NODE_COLORS: Record<string, string> = {
  lead: "#3b82f6",      // blue-500
  activity: "#eab308",  // yellow-500
  booking: "#22c55e",   // green-500
  client: "#a855f7",    // purple-500
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

function buildRFNodes(graph: ConnectionGraph): Node[] {
  const root = graph.nodes.find((n) => n.id === graph.rootId)
  const others = graph.nodes.filter((n) => n.id !== graph.rootId)

  // Group non-root nodes by type for ring placement
  const byType: Record<string, typeof others> = {}
  for (const n of others) {
    if (!byType[n.type]) byType[n.type] = []
    byType[n.type].push(n)
  }

  const nodeTypeOrder = ["activity", "booking", "client", "lead"]
  const rings: { nodes: typeof others; radius: number }[] = []

  let radius = 200
  for (const t of nodeTypeOrder) {
    if (byType[t] && byType[t].length > 0) {
      rings.push({ nodes: byType[t], radius })
      radius += 180
    }
  }

  const rfNodes: Node[] = []

  // Root node at center
  if (root) {
    rfNodes.push({
      id: root.id,
      data: { label: root.label, sublabel: root.sublabel, href: root.href, type: root.type },
      position: { x: 400, y: 300 },
      style: {
        background: NODE_COLORS[root.type] ?? "#888",
        color: "#fff",
        border: "2px solid rgba(255,255,255,0.4)",
        borderRadius: "8px",
        padding: "8px 12px",
        minWidth: 140,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
      },
    })
  }

  // Ring nodes
  for (const ring of rings) {
    const count = ring.nodes.length
    ring.nodes.forEach((n, i) => {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2
      const x = 400 + ring.radius * Math.cos(angle)
      const y = 300 + ring.radius * Math.sin(angle)
      rfNodes.push({
        id: n.id,
        data: { label: n.label, sublabel: n.sublabel, href: n.href, type: n.type },
        position: { x, y },
        style: {
          background: NODE_COLORS[n.type] ?? "#888",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "8px",
          padding: "8px 12px",
          minWidth: 120,
          fontSize: 12,
          cursor: "pointer",
        },
      })
    })
  }

  return rfNodes
}

function buildRFEdges(graph: ConnectionGraph): Edge[] {
  return graph.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    style: { stroke: "rgba(255,255,255,0.25)" },
    labelStyle: { fill: "rgba(255,255,255,0.5)", fontSize: 10 },
  }))
}

// ─── Component ────────────────────────────────────────────────────────────────

function ConnectionsCanvas() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<ConnectionSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingGraph, setIsLoadingGraph] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<ConnectionSearchResult | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()

  // Debounced search — 300ms after searchQuery changes
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/admin/connections?q=${encodeURIComponent(searchQuery)}`)
        const data = (await res.json()) as ConnectionSearchResult[]
        setSearchResults(data)
        setShowDropdown(true)
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  async function handleSelectEntity(result: ConnectionSearchResult) {
    setSelectedEntity(result)
    setSearchQuery(result.label)
    setShowDropdown(false)
    setIsLoadingGraph(true)

    try {
      const res = await fetch(`/api/admin/connections?type=${result.type}&id=${result.id}`)
      const graph: ConnectionGraph = (await res.json()) as ConnectionGraph
      setNodes(buildRFNodes(graph))
      setEdges(buildRFEdges(graph))
    } finally {
      setIsLoadingGraph(false)
    }
  }

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const href = (node.data as { href?: string }).href
      if (href) router.push(href)
    },
    [router],
  )

  return (
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
                onClick={() => void handleSelectEntity(r)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: NODE_COLORS[r.type] }}
                />
                <div>
                  <div className="text-sm text-white">{r.label}</div>
                  <div className="text-xs text-white/45">
                    {r.sublabel} &middot; {r.type}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        {showDropdown && searchResults.length === 0 && !isSearching && searchQuery.length >= 2 && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white/50 shadow-xl">
            No results found for &ldquo;{searchQuery}&rdquo;
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
  )
}

export { ConnectionsCanvas }
