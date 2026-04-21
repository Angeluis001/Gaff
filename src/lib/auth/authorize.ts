import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { adminUsers } from "@/lib/db/schema"

import { verifyAdminPassword } from "./password"
import { toAdminSessionUser } from "./session"

export async function authorizeAdminCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail || !password.trim()) {
    return null
  }

  const [adminUser] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, normalizedEmail))
    .limit(1)

  if (!adminUser?.isActive) {
    return null
  }

  const passwordMatches = await verifyAdminPassword(password, adminUser.passwordHash)

  if (!passwordMatches) {
    return null
  }

  await db
    .update(adminUsers)
    .set({ lastLoginAt: new Date() })
    .where(eq(adminUsers.id, adminUser.id))

  return toAdminSessionUser({
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    role: adminUser.role,
    isActive: adminUser.isActive,
  })
}
