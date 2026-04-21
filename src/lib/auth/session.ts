import type { DefaultSession } from "next-auth"
import type { JWT } from "next-auth/jwt"

export const adminRoles = ["viewer", "manager", "admin"] as const

export type AdminRole = (typeof adminRoles)[number]

export interface AdminSessionUser {
  id: string
  email: string
  name: string
  role: AdminRole
  isActive: boolean
}

export interface AdminAuthUser extends AdminSessionUser {
  passwordHash?: string
}

export interface AdminJwtToken extends JWT {
  id?: string
  role?: AdminRole
  isActive?: boolean
}

export function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === "string" && adminRoles.includes(value as AdminRole)
}

export function normalizeAdminRole(value: unknown): AdminRole {
  return isAdminRole(value) ? value : "viewer"
}

export function getRoleRank(role: AdminRole) {
  return adminRoles.indexOf(role)
}

export function canAccessMinimumRole(currentRole: AdminRole, minimumRole: AdminRole) {
  return getRoleRank(currentRole) >= getRoleRank(minimumRole)
}

export function toAdminSessionUser(user: {
  id: string
  email: string
  name: string
  role: unknown
  isActive: unknown
}): AdminSessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: normalizeAdminRole(user.role),
    isActive: Boolean(user.isActive),
  }
}

export function hasActiveAdminSession(
  session: DefaultSession | null | undefined
): session is DefaultSession & { user: DefaultSession["user"] & Partial<AdminSessionUser> } {
  const user = session?.user as (DefaultSession["user"] & Partial<AdminSessionUser>) | undefined
  return Boolean(user?.id && user?.isActive)
}
