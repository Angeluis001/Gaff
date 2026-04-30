import { db } from "@/lib/db"
import { leads, leadActivities, bookings, clients } from "@/lib/db/schema"
import { eq, desc, or, ilike } from "drizzle-orm"

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConnectionNodeType = "lead" | "activity" | "booking" | "client"

export interface ConnectionNode {
  id: string
  type: ConnectionNodeType
  label: string
  sublabel?: string
  href: string
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
  rootId: string
}

export interface ConnectionSearchResult {
  id: string
  type: "lead" | "client" | "booking"
  label: string
  sublabel: string
}

// ─── Graph builder ────────────────────────────────────────────────────────────

export async function getConnectionGraph(
  entityType: "lead" | "client" | "booking",
  entityId: string,
): Promise<ConnectionGraph | null> {
  const nodes: ConnectionNode[] = []
  const edges: ConnectionEdge[] = []

  if (entityType === "lead") {
    // Fetch lead
    const [lead] = await db.select().from(leads).where(eq(leads.id, entityId)).limit(1)
    if (!lead) return null

    const leadNodeId = `lead-${lead.id}`
    nodes.push({
      id: leadNodeId,
      type: "lead",
      label: `${lead.firstName}${lead.lastName ? ` ${lead.lastName}` : ""}`,
      sublabel: lead.email ?? lead.status ?? undefined,
      href: `/admin/leads/${lead.id}`,
    })

    // Fetch activities (up to 20, newest first)
    const activities = await db
      .select()
      .from(leadActivities)
      .where(eq(leadActivities.leadId, lead.id))
      .orderBy(desc(leadActivities.createdAt))
      .limit(20)

    for (const activity of activities) {
      const actNodeId = `activity-${activity.id}`
      nodes.push({
        id: actNodeId,
        type: "activity",
        label: activity.type,
        sublabel: activity.description.slice(0, 60),
        href: `/admin/leads/${lead.id}`,
      })
      edges.push({ id: `${leadNodeId}-${actNodeId}`, source: leadNodeId, target: actNodeId })
    }

    // Fetch bookings
    const leadBookings = await db.select().from(bookings).where(eq(bookings.leadId, lead.id))

    for (const booking of leadBookings) {
      const bookingNodeId = `booking-${booking.id}`
      nodes.push({
        id: bookingNodeId,
        type: "booking",
        label: `Booking`,
        sublabel: `${booking.status} · ${booking.tripType}`,
        href: `/admin/bookings/${booking.id}`,
      })
      edges.push({ id: `${leadNodeId}-${bookingNodeId}`, source: leadNodeId, target: bookingNodeId })

      // booking → client edge (if booking has a clientId)
      if (booking.clientId) {
        const clientNodeId = `client-${booking.clientId}`
        if (!nodes.find((n) => n.id === clientNodeId)) {
          const [client] = await db.select().from(clients).where(eq(clients.id, booking.clientId!)).limit(1)
          if (client) {
            nodes.push({
              id: clientNodeId,
              type: "client",
              label: `${client.firstName} ${client.lastName}`,
              sublabel: client.email,
              href: `/admin/clients/${client.id}`,
            })
          }
        }
        edges.push({ id: `${bookingNodeId}-client-${booking.clientId}`, source: bookingNodeId, target: `client-${booking.clientId}` })
      }
    }

    // convertedToClientId → client node
    if (lead.convertedToClientId) {
      const clientNodeId = `client-${lead.convertedToClientId}`
      if (!nodes.find((n) => n.id === clientNodeId)) {
        const [client] = await db.select().from(clients).where(eq(clients.id, lead.convertedToClientId!)).limit(1)
        if (client) {
          nodes.push({
            id: clientNodeId,
            type: "client",
            label: `${client.firstName} ${client.lastName}`,
            sublabel: client.email,
            href: `/admin/clients/${client.id}`,
          })
        }
      }
      if (!edges.find((e) => e.id === `${leadNodeId}-${clientNodeId}`)) {
        edges.push({ id: `${leadNodeId}-${clientNodeId}`, source: leadNodeId, target: clientNodeId, label: "converted" })
      }
    }

    return { nodes, edges, rootId: leadNodeId }
  }

  if (entityType === "client") {
    // Fetch client
    const [client] = await db.select().from(clients).where(eq(clients.id, entityId)).limit(1)
    if (!client) return null

    const clientNodeId = `client-${client.id}`
    nodes.push({
      id: clientNodeId,
      type: "client",
      label: `${client.firstName} ${client.lastName}`,
      sublabel: client.email,
      href: `/admin/clients/${client.id}`,
    })

    // Fetch bookings for client
    const clientBookings = await db.select().from(bookings).where(eq(bookings.clientId, client.id))

    for (const booking of clientBookings) {
      const bookingNodeId = `booking-${booking.id}`
      nodes.push({
        id: bookingNodeId,
        type: "booking",
        label: `Booking`,
        sublabel: `${booking.status} · ${booking.tripType}`,
        href: `/admin/bookings/${booking.id}`,
      })
      edges.push({ id: `${clientNodeId}-${bookingNodeId}`, source: clientNodeId, target: bookingNodeId })

      // Booking → lead (if booking has a leadId)
      if (booking.leadId) {
        const leadNodeId = `lead-${booking.leadId}`
        let leadNode = nodes.find((n) => n.id === leadNodeId)
        if (!leadNode) {
          const [lead] = await db.select().from(leads).where(eq(leads.id, booking.leadId!)).limit(1)
          if (lead) {
            nodes.push({
              id: leadNodeId,
              type: "lead",
              label: `${lead.firstName}${lead.lastName ? ` ${lead.lastName}` : ""}`,
              sublabel: lead.email ?? lead.status ?? undefined,
              href: `/admin/leads/${lead.id}`,
            })
            leadNode = nodes[nodes.length - 1]
          }
        }
        if (leadNode) {
          edges.push({ id: `${bookingNodeId}-${leadNodeId}`, source: bookingNodeId, target: leadNodeId })

          // Activities for this lead (up to 10)
          const activities = await db
            .select()
            .from(leadActivities)
            .where(eq(leadActivities.leadId, booking.leadId!))
            .orderBy(desc(leadActivities.createdAt))
            .limit(10)

          for (const activity of activities) {
            const actNodeId = `activity-${activity.id}`
            if (!nodes.find((n) => n.id === actNodeId)) {
              nodes.push({
                id: actNodeId,
                type: "activity",
                label: activity.type,
                sublabel: activity.description.slice(0, 60),
                href: `/admin/leads/${booking.leadId}`,
              })
            }
            if (!edges.find((e) => e.id === `${leadNodeId}-${actNodeId}`)) {
              edges.push({ id: `${leadNodeId}-${actNodeId}`, source: leadNodeId, target: actNodeId })
            }
          }
        }
      }
    }

    return { nodes, edges, rootId: clientNodeId }
  }

  if (entityType === "booking") {
    // Fetch booking
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, entityId)).limit(1)
    if (!booking) return null

    const bookingNodeId = `booking-${booking.id}`
    nodes.push({
      id: bookingNodeId,
      type: "booking",
      label: `Booking`,
      sublabel: `${booking.status} · ${booking.tripType}`,
      href: `/admin/bookings/${booking.id}`,
    })

    // Lead
    if (booking.leadId) {
      const leadNodeId = `lead-${booking.leadId}`
      const [lead] = await db.select().from(leads).where(eq(leads.id, booking.leadId)).limit(1)
      if (lead) {
        nodes.push({
          id: leadNodeId,
          type: "lead",
          label: `${lead.firstName}${lead.lastName ? ` ${lead.lastName}` : ""}`,
          sublabel: lead.email ?? lead.status ?? undefined,
          href: `/admin/leads/${lead.id}`,
        })
        edges.push({ id: `${bookingNodeId}-${leadNodeId}`, source: bookingNodeId, target: leadNodeId })

        // Activities for this lead (up to 15)
        const activities = await db
          .select()
          .from(leadActivities)
          .where(eq(leadActivities.leadId, lead.id))
          .orderBy(desc(leadActivities.createdAt))
          .limit(15)

        for (const activity of activities) {
          const actNodeId = `activity-${activity.id}`
          nodes.push({
            id: actNodeId,
            type: "activity",
            label: activity.type,
            sublabel: activity.description.slice(0, 60),
            href: `/admin/leads/${lead.id}`,
          })
          edges.push({ id: `${leadNodeId}-${actNodeId}`, source: leadNodeId, target: actNodeId })
        }
      }
    }

    // Client
    if (booking.clientId) {
      const clientNodeId = `client-${booking.clientId}`
      const [client] = await db.select().from(clients).where(eq(clients.id, booking.clientId)).limit(1)
      if (client) {
        nodes.push({
          id: clientNodeId,
          type: "client",
          label: `${client.firstName} ${client.lastName}`,
          sublabel: client.email,
          href: `/admin/clients/${client.id}`,
        })
        edges.push({ id: `${bookingNodeId}-${clientNodeId}`, source: bookingNodeId, target: clientNodeId })
      }
    }

    return { nodes, edges, rootId: bookingNodeId }
  }

  return null
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchConnectionEntities(q: string): Promise<ConnectionSearchResult[]> {
  const term = q.trim().toLowerCase()
  if (!term) return []

  const [leadRows, clientRows, bookingRows] = await Promise.all([
    db.select().from(leads).limit(50),
    db.select().from(clients).limit(50),
    db.select().from(bookings).limit(50),
  ])

  const matchedLeads: ConnectionSearchResult[] = leadRows
    .filter((l) => {
      const fullName = `${l.firstName}${l.lastName ? ` ${l.lastName}` : ""}`.toLowerCase()
      const email = (l.email ?? "").toLowerCase()
      return fullName.includes(term) || email.includes(term)
    })
    .slice(0, 4)
    .map((l) => ({
      id: l.id,
      type: "lead" as const,
      label: `${l.firstName}${l.lastName ? ` ${l.lastName}` : ""}`,
      sublabel: l.email ?? l.status ?? "",
    }))

  const matchedClients: ConnectionSearchResult[] = clientRows
    .filter((c) => {
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase()
      const email = c.email.toLowerCase()
      return fullName.includes(term) || email.includes(term)
    })
    .slice(0, 4)
    .map((c) => ({
      id: c.id,
      type: "client" as const,
      label: `${c.firstName} ${c.lastName}`,
      sublabel: c.email,
    }))

  const matchedBookings: ConnectionSearchResult[] = bookingRows
    .filter((b) => b.id.toLowerCase().startsWith(term))
    .slice(0, 2)
    .map((b) => ({
      id: b.id,
      type: "booking" as const,
      label: `Booking ${b.id.slice(0, 8)}`,
      sublabel: `${b.status} · ${b.date ? new Date(b.date).toLocaleDateString() : ""}`,
    }))

  return [...matchedLeads, ...matchedClients, ...matchedBookings].slice(0, 10)
}
