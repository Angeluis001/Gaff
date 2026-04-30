import type { AdminRole } from "@/lib/auth/session"

export interface AdminNavItem {
  href: string
  label: string
  description: string
  minimumRole: AdminRole
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    description: "Live KPI overview",
    minimumRole: "viewer",
  },
  {
    href: "/admin/connections",
    label: "Connections",
    description: "Entity relationship graph",
    minimumRole: "viewer",
  },
  {
    href: "/admin/leads",
    label: "Leads",
    description: "Inquiry pipeline and timelines",
    minimumRole: "viewer",
  },
  {
    href: "/admin/clients",
    label: "Clients",
    description: "Customer history and spend",
    minimumRole: "viewer",
  },
  {
    href: "/admin/bookings",
    label: "Bookings",
    description: "Trips, deposits, and status",
    minimumRole: "viewer",
  },
  {
    href: "/admin/fleet",
    label: "Fleet",
    description: "Boats and maintenance windows",
    minimumRole: "manager",
  },
  {
    href: "/admin/agents",
    label: "Agents",
    description: "AI operations surfaces",
    minimumRole: "manager",
  },
  {
    href: "/admin/marketing",
    label: "Marketing",
    description: "Publishing and content calendar",
    minimumRole: "manager",
  },
  {
    href: "/admin/seo",
    label: "SEO",
    description: "Search content and reports",
    minimumRole: "manager",
  },
  {
    href: "/admin/reviews",
    label: "Reviews",
    description: "Monitor and draft responses",
    minimumRole: "manager",
  },
  {
    href: "/admin/settings",
    label: "Settings",
    description: "Users and integration health",
    minimumRole: "admin",
  },
]

export function canAccessAdminSection(role: AdminRole, minimumRole: AdminRole) {
  const order: Record<AdminRole, number> = {
    viewer: 0,
    manager: 1,
    admin: 2,
  }

  return order[role] >= order[minimumRole]
}

export function getAccessibleAdminNav(role: AdminRole) {
  return ADMIN_NAV_ITEMS.filter((item) => canAccessAdminSection(role, item.minimumRole))
}
