"use client"

import { useCallback, useEffect, useState } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import Link from "next/link"
import type { ConnectionGraph, ConnectionSearchResult, ConnectionNodeType } from "@/lib/admin/connections"

// ─── Color config ──────────────────────────────────────────────────────────────

const NODE_CONFIG: Record<ConnectionNodeType, { bg: string; glow: string; label: string; emoji: string }> = {
  lead:     { bg: "#3b82f6", glow: "rgba(59,130,246,0.55)",  label: "Lead",         emoji: "🎯" },
  activity: { bg: "#eab308", glow: "rgba(234,179,8,0.55)",   label: "Conversation", emoji: "💬" },
  booking:  { bg: "#22c55e", glow: "rgba(34,197,94,0.55)",   label: "Booking",      emoji: "📅" },
  client:   { bg: "#a855f7", glow: "rgba(168,85,247,0.55)",  label: "Client",       emoji: "👤" },
}

// ─── Node data type ────────────────────────────────────────────────────────────

type CircleNodeData = {
  label: string
  sublabel?: string
  nodeType: ConnectionNodeType
  isRoot?: boolean
  href: string
  animDelay: string
}

// ─── Custom circular node ──────────────────────────────────────────────────────

function CircleNode(props: NodeProps) {
  const data   = props.data as CircleNodeData
  const selected = props.selected
  const cfg  = NODE_CONFIG[data.nodeType] ?? NODE_CONFIG.lead
  const size = data.isRoot ? 92 : 68

  return (
    <div
      style={{
        animation: `node-float 3.6s ease-in-out infinite`,
        animationDelay: data.animDelay,
      }}
    >
      <Handle type="target" position={Position.Top}    style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="target" position={Position.Left}   style={{ opacity: 0, width: 1, height: 1 }} />
      <div
        style={{
          width:        size,
          height:       size,
          borderRadius: "50%",
          background:   `radial-gradient(circle at 38% 35%, ${cfg.bg}ee, ${cfg.bg}66)`,
          border:       `2px solid ${selected ? "rgba(255,255,255,0.75)" : `${cfg.bg}88`}`,
          boxShadow:    selected
            ? `0 0 0 3px rgba(255,255,255,0.35), 0 0 22px ${cfg.glow}, 0 0 44px ${cfg.glow}`
            : `0 0 16px ${cfg.glow}, 0 6px 18px rgba(0,0,0,0.55)`,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          padding:        "6px",
          cursor:         "pointer",
          transform:      selected ? "scale(1.12)" : "scale(1)",
          transition:     "box-shadow 0.22s ease, border-color 0.22s ease, transform 0.22s ease",
        }}
      >
        <span style={{
          fontSize:    data.isRoot ? 11 : 9,
          fontWeight:  700,
          color:       "#fff",
          textAlign:   "center",
          lineHeight:  1.25,
          letterSpacing: "0.01em",
          wordBreak:   "break-word",
        }}>
          {data.label.length > 13 ? `${data.label.slice(0, 12)}…` : data.label}
        </span>
        {data.sublabel && (
          <span style={{
            fontSize:  data.isRoot ? 9 : 7,
            color:     "rgba(255,255,255,0.58)",
            textAlign: "center",
            marginTop: 2,
            lineHeight: 1.2,
          }}>
            {data.sublabel.length > 17 ? `${data.sublabel.slice(0, 16)}…` : data.sublabel}
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="source" position={Position.Right}  style={{ opacity: 0, width: 1, height: 1 }} />
    </div>
  )
}

const nodeTypes = { circleNode: CircleNode }

// ─── Graph builders ────────────────────────────────────────────────────────────

function buildRFNodes(graph: ConnectionGraph): Node[] {
  const root   = graph.nodes.find((n) => n.id === graph.rootId)
  const others = graph.nodes.filter((n) => n.id !== graph.rootId)

  const byType: Record<string, typeof others> = {}
  for (const n of others) {
    if (!byType[n.type]) byType[n.type] = []
    byType[n.type].push(n)
  }

  const typeOrder = ["activity", "booking", "client", "lead"]
  const rings: { nodes: typeof others; radius: number }[] = []
  let radius = 210
  for (const t of typeOrder) {
    if (byType[t]?.length) {
      rings.push({ nodes: byType[t], radius })
      radius += 185
    }
  }

  const rfNodes: Node[] = []
  let animIdx = 0

  if (root) {
    rfNodes.push({
      id:   root.id,
      type: "circleNode",
      data: {
        label:     root.label,
        sublabel:  root.sublabel,
        nodeType:  root.type,
        isRoot:    true,
        href:      root.href,
        animDelay: "0s",
      } satisfies CircleNodeData,
      position: { x: 0, y: 0 },
    })
  }

  for (const ring of rings) {
    const count = ring.nodes.length
    ring.nodes.forEach((n, i) => {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2
      animIdx++
      rfNodes.push({
        id:   n.id,
        type: "circleNode",
        data: {
          label:     n.label,
          sublabel:  n.sublabel,
          nodeType:  n.type,
          isRoot:    false,
          href:      n.href,
          animDelay: `${((animIdx * 0.45) % 3).toFixed(2)}s`,
        } satisfies CircleNodeData,
        position: {
          x: ring.radius * Math.cos(angle),
          y: ring.radius * Math.sin(angle),
        },
      })
    })
  }

  return rfNodes
}

function buildRFEdges(graph: ConnectionGraph): Edge[] {
  return graph.edges.map((e) => ({
    id:     e.id,
    source: e.source,
    target: e.target,
    label:  e.label,
    type:   "smoothstep",
    animated: true,
    style: { stroke: "rgba(255,255,255,0.22)", strokeWidth: 1.5 },
    labelStyle: { fill: "rgba(255,255,255,0.4)", fontSize: 9 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(255,255,255,0.3)", width: 14, height: 14 },
    className: "connections-edge-path",
  }))
}

// ─── Detail panel ──────────────────────────────────────────────────────────────

interface PanelData {
  label:     string
  sublabel?: string
  nodeType:  ConnectionNodeType
  href:      string
}

function DetailPanel({ node, onClose }: { node: PanelData; onClose: () => void }) {
  const cfg = NODE_CONFIG[node.nodeType]

  return (
    <div
      style={{
        position:       "absolute",
        top:            0,
        right:          0,
        bottom:         0,
        width:          288,
        background:     "rgba(7,17,30,0.96)",
        backdropFilter: "blur(16px)",
        borderLeft:     "1px solid rgba(255,255,255,0.08)",
        zIndex:         20,
        display:        "flex",
        flexDirection:  "column",
        padding:        "20px 18px",
        gap:            16,
        animation:      "panel-slide-in 0.22s ease-out",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          display:       "inline-flex",
          alignItems:    "center",
          gap:           6,
          background:    `${cfg.bg}1a`,
          border:        `1px solid ${cfg.bg}44`,
          borderRadius:  20,
          padding:       "3px 10px",
          fontSize:      10,
          color:         cfg.bg,
          fontWeight:    700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.bg, display: "inline-block" }} />
          {cfg.label}
        </span>
        <button
          onClick={onClose}
          style={{
            background:  "rgba(255,255,255,0.06)",
            border:      "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color:       "rgba(255,255,255,0.5)",
            cursor:      "pointer",
            width:       28,
            height:      28,
            display:     "flex",
            alignItems:  "center",
            justifyContent: "center",
            fontSize:    18,
            lineHeight:  1,
          }}
        >
          ×
        </button>
      </div>

      {/* Glowing circle */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 6 }}>
        <div style={{
          width:        84,
          height:       84,
          borderRadius: "50%",
          background:   `radial-gradient(circle at 38% 35%, ${cfg.bg}ee, ${cfg.bg}66)`,
          boxShadow:    `0 0 28px ${cfg.glow}, 0 0 56px ${cfg.glow}`,
          border:       `2px solid ${cfg.bg}99`,
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
          fontSize:     30,
          animation:    "node-glow-pulse 2.4s ease-in-out infinite",
        }}>
          {cfg.emoji}
        </div>
      </div>

      {/* Name + sublabel */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, textAlign: "center" }}>
        <span style={{ color: "#fff", fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>
          {node.label}
        </span>
        {node.sublabel && (
          <span style={{ color: "rgba(255,255,255,0.48)", fontSize: 12, lineHeight: 1.4 }}>
            {node.sublabel}
          </span>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

      {/* Details block */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Details
        </div>
        <div style={{
          background:   "rgba(255,255,255,0.04)",
          borderRadius: 10,
          padding:      "10px 12px",
          fontSize:     12,
          color:        "rgba(255,255,255,0.58)",
          lineHeight:   1.55,
          border:       "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ marginBottom: 6 }}>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</span>
            <div style={{ color: cfg.bg, fontWeight: 600, marginTop: 2 }}>{cfg.label}</div>
          </div>
          {node.sublabel && (
            <div>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Info</span>
              <div style={{ marginTop: 2 }}>{node.sublabel}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* CTA */}
      <Link
        href={node.href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          gap:            8,
          background:     `${cfg.bg}18`,
          border:         `1px solid ${cfg.bg}44`,
          borderRadius:   12,
          padding:        "11px 16px",
          color:          cfg.bg,
          textDecoration: "none",
          fontSize:       13,
          fontWeight:     600,
          transition:     "background 0.2s ease",
        }}
      >
        Open full detail →
      </Link>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

function ConnectionsCanvas() {
  const [searchQuery,   setSearchQuery]   = useState("")
  const [searchResults, setSearchResults] = useState<ConnectionSearchResult[]>([])
  const [isSearching,   setIsSearching]   = useState(false)
  const [isLoadingGraph,setIsLoadingGraph]= useState(false)
  const [selectedEntity,setSelectedEntity]= useState<ConnectionSearchResult | null>(null)
  const [nodes, setNodes, onNodesChange]  = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange]  = useEdgesState<Edge>([])
  const [showDropdown,  setShowDropdown]  = useState(false)
  const [panelData,     setPanelData]     = useState<PanelData | null>(null)

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res  = await fetch(`/api/admin/connections?q=${encodeURIComponent(searchQuery)}`)
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
    setPanelData(null)
    try {
      const res   = await fetch(`/api/admin/connections?type=${result.type}&id=${result.id}`)
      const graph = (await res.json()) as ConnectionGraph
      setNodes(buildRFNodes(graph))
      setEdges(buildRFEdges(graph))
    } finally {
      setIsLoadingGraph(false)
    }
  }

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const data = node.data as CircleNodeData
    setPanelData({ label: data.label, sublabel: data.sublabel, nodeType: data.nodeType, href: data.href })
  }, [])

  const onPaneClick = useCallback(() => setPanelData(null), [])

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-amber-400/40 focus:outline-none"
        />
        {isSearching && (
          <span className="absolute right-3 top-2.5 text-xs text-white/40">Searching…</span>
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
                  style={{ background: NODE_CONFIG[r.type as ConnectionNodeType]?.bg }}
                />
                <div>
                  <div className="text-sm text-white">{r.label}</div>
                  <div className="text-xs text-white/45">{r.sublabel} · {r.type}</div>
                </div>
              </button>
            ))}
          </div>
        )}
        {showDropdown && !isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white/50 shadow-xl">
            No results for &ldquo;{searchQuery}&rdquo;
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-white/50">
        {(Object.entries(NODE_CONFIG) as [ConnectionNodeType, (typeof NODE_CONFIG)[ConnectionNodeType]][]).map(([type, cfg]) => (
          <span key={type} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: cfg.bg }} />
            {cfg.label}
          </span>
        ))}
        <span className="ml-auto opacity-60">Click a node to see details</span>
      </div>

      {/* Canvas */}
      <div className="relative min-h-[560px] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
        {isLoadingGraph && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <span className="text-sm text-white/50">Loading graph…</span>
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
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          nodeOrigin={[0.5, 0.5]}
          fitView
          fitViewOptions={{ padding: 0.28 }}
          colorMode="dark"
          minZoom={0.25}
          maxZoom={2.5}
        >
          <Background color="rgba(255,255,255,0.022)" gap={30} />
          <Controls className="[&_button]:bg-zinc-800 [&_button]:border-white/10 [&_button]:text-white" />
        </ReactFlow>

        {panelData && (
          <DetailPanel node={panelData} onClose={() => setPanelData(null)} />
        )}
      </div>
    </div>
  )
}

export { ConnectionsCanvas }
