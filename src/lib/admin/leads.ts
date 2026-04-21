import { db } from "@/lib/db"
import { leadActivities, leads } from "@/lib/db/schema"

import { formatDateTime } from "./formatters"

export interface AdminLeadListFilters {
  query?: string
  status?: string
  source?: string
  page?: number
  pageSize?: number
}

export interface AdminLeadListItem {
  id: string
  name: string
  email: string | null
  phone: string | null
  source: string
  status: string
  classification: string | null
  preferredDate: string | null
  groupSize: number | null
  createdAt: string
  activityCount: number
}

export interface AdminLeadDetail {
  lead: AdminLeadListItem & {
    notes: string | null
    whatsappNumber: string | null
    convertedToClientId: string | null
    metadata: unknown
    updatedAt: string | null
  }
  timeline: Array<{
    id: number
    type: string
    description: string
    agentId: string | null
    createdAt: string
  }>
}

type LeadRow = {
  id: string
  firstName: string
  lastName: string | null
  email: string | null
  phone: string | null
  whatsappNumber: string | null
  notes: string | null
  classification: string | null
  source: string
  status: string | null
  preferredDate: Date | string | null
  createdAt: Date | string | null
}

function applyLeadFilters(rows: Array<LeadRow>, filters: AdminLeadListFilters) {
  const query = filters.query?.trim().toLowerCase()
  const status = filters.status?.trim()
  const source = filters.source?.trim()

  return rows.filter((row) => {
    const fullName = `${row.firstName ?? ""} ${row.lastName ?? ""}`.toLowerCase()
    const preferredDate = row.preferredDate ? new Date(row.preferredDate).toISOString() : ""
    const haystack = [
      fullName,
      row.email ?? "",
      row.phone ?? "",
      row.whatsappNumber ?? "",
      row.notes ?? "",
      row.classification ?? "",
      row.source ?? "",
      row.status ?? "",
      preferredDate,
    ]
      .join(" ")
      .toLowerCase()

    if (query && !haystack.includes(query)) {
      return false
    }

    if (status && row.status !== status) {
      return false
    }

    if (source && row.source !== source) {
      return false
    }

    return true
  })
}

function paginateRows<T>(rows: T[], page = 1, pageSize = 10) {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10
  const offset = (safePage - 1) * safePageSize

  return {
    items: rows.slice(offset, offset + safePageSize),
    total: rows.length,
    page: safePage,
    pageSize: safePageSize,
  }
}

export async function getAdminLeadList(filters: AdminLeadListFilters = {}) {
  const [leadRows, activityRows] = await Promise.all([
    db.select().from(leads),
    db.select().from(leadActivities),
  ])

  const items = leadRows.map<AdminLeadListItem>((lead) => ({
    id: lead.id,
    name: `${lead.firstName} ${lead.lastName ?? ""}`.trim(),
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    status: lead.status ?? "new",
    classification: lead.classification,
    preferredDate: lead.preferredDate ? formatDateTime(lead.preferredDate) : null,
    groupSize: lead.groupSize,
    createdAt: formatDateTime(lead.createdAt),
    activityCount: activityRows.filter((activity) => activity.leadId === lead.id).length,
  }))

  const filtered = applyLeadFilters(
    leadRows.map((lead) => ({ ...lead })),
    filters
  )

  const sorted = filtered
    .sort((left, right) => {
      const leftDate = left.createdAt ? new Date(left.createdAt).getTime() : 0
      const rightDate = right.createdAt ? new Date(right.createdAt).getTime() : 0
      return rightDate - leftDate
    })
    .map((lead) => items.find((item) => item.id === lead.id) as AdminLeadListItem)

  return paginateRows(sorted, filters.page, filters.pageSize)
}

export async function getAdminLeadDetail(leadId: string): Promise<AdminLeadDetail | null> {
  const leadRows = await db.select().from(leads)
  const targetLead = leadRows.find((lead) => lead.id === leadId)

  if (!targetLead) {
    return null
  }

  const activities = (await db.select().from(leadActivities))
    .filter((activity) => activity.leadId === leadId)
    .sort((left, right) => {
      const leftDate = left.createdAt ? new Date(left.createdAt).getTime() : 0
      const rightDate = right.createdAt ? new Date(right.createdAt).getTime() : 0
      return rightDate - leftDate
    })

  return {
    lead: {
      id: targetLead.id,
      name: `${targetLead.firstName} ${targetLead.lastName ?? ""}`.trim(),
      email: targetLead.email,
      phone: targetLead.phone,
      source: targetLead.source,
      status: targetLead.status ?? "new",
      classification: targetLead.classification,
      preferredDate: targetLead.preferredDate ? formatDateTime(targetLead.preferredDate) : null,
      groupSize: targetLead.groupSize,
      createdAt: formatDateTime(targetLead.createdAt),
      activityCount: activities.length,
      notes: targetLead.notes,
      whatsappNumber: targetLead.whatsappNumber,
      convertedToClientId: targetLead.convertedToClientId,
      metadata: targetLead.metadata,
      updatedAt: targetLead.updatedAt ? formatDateTime(targetLead.updatedAt) : null,
    },
    timeline: activities.map((activity) => ({
      id: activity.id,
      type: activity.type,
      description: activity.description,
      agentId: activity.agentId,
      createdAt: formatDateTime(activity.createdAt),
    })),
  }
}
