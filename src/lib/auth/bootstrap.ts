import { db } from "@/lib/db"
import { adminUsers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

import { hashAdminPassword } from "./password"
import { normalizeAdminRole } from "./session"

export interface BootstrapAdminInput {
  email: string
  password: string
  name: string
  role?: string
}

export interface BootstrapAdminResult {
  created: boolean
  email: string
  role: string
}

const FALLBACK_BOOTSTRAP_EMAIL = "admin@gaffallfishingloscabos.com"
const FALLBACK_BOOTSTRAP_PASSWORD = "change-me-now"
const FALLBACK_BOOTSTRAP_NAME = "GAFF Admin"
const FALLBACK_BOOTSTRAP_ROLE = "admin"

export function getBootstrapAdminInputFromEnv(): BootstrapAdminInput | null {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim() || FALLBACK_BOOTSTRAP_EMAIL
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim() || FALLBACK_BOOTSTRAP_PASSWORD
  const name = process.env.ADMIN_BOOTSTRAP_NAME?.trim() || FALLBACK_BOOTSTRAP_NAME

  return {
    email: email.toLowerCase(),
    password,
    name,
    role: process.env.ADMIN_BOOTSTRAP_ROLE?.trim() || FALLBACK_BOOTSTRAP_ROLE,
  }
}

export async function ensureBootstrapAdminUser(input?: BootstrapAdminInput) {
  const bootstrapInput = input ?? getBootstrapAdminInputFromEnv()

  if (!bootstrapInput) {
    return {
      created: false,
      email: "",
      role: "viewer",
    } satisfies BootstrapAdminResult
  }

  const [existingAdminUser] = await db
    .select({
      email: adminUsers.email,
      role: adminUsers.role,
    })
    .from(adminUsers)
    .where(eq(adminUsers.email, bootstrapInput.email.toLowerCase()))
    .limit(1)

  if (existingAdminUser) {
    return {
      created: false,
      email: existingAdminUser.email,
      role: normalizeAdminRole(existingAdminUser.role),
    } satisfies BootstrapAdminResult
  }

  const normalizedRole = normalizeAdminRole(bootstrapInput.role)
  const passwordHash = await hashAdminPassword(bootstrapInput.password)

  const [adminUser] = await db
    .insert(adminUsers)
    .values({
      email: bootstrapInput.email.toLowerCase(),
      passwordHash,
      name: bootstrapInput.name,
      role: normalizedRole,
      isActive: true,
    })
    .returning({
      email: adminUsers.email,
      role: adminUsers.role,
    })

  return {
    created: Boolean(adminUser),
    email: adminUser?.email ?? bootstrapInput.email.toLowerCase(),
    role: normalizeAdminRole(adminUser?.role),
  } satisfies BootstrapAdminResult
}
