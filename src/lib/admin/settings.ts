import { db } from "@/lib/db"
import { adminUsers } from "@/lib/db/schema"

import { formatDateTime } from "./formatters"

export async function getAdminSettingsOverview() {
  const adminRows = await db.select().from(adminUsers)

  return {
    admins: adminRows.map((admin) => ({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role ?? "viewer",
      isActive: admin.isActive !== false,
      lastLoginAt: admin.lastLoginAt ? formatDateTime(admin.lastLoginAt) : null,
    })),
    integrations: [
      {
        name: "Neon",
        status: process.env.DATABASE_URL ? "configured" : "missing",
      },
      {
        name: "Stripe",
        status: process.env.STRIPE_SECRET_KEY ? "configured" : "missing",
      },
      {
        name: "Resend",
        status: process.env.RESEND_API_KEY ? "configured" : "missing",
      },
      {
        name: "Upstash",
        status: process.env.UPSTASH_REDIS_REST_URL ? "configured" : "missing",
      },
      {
        name: "Botpress",
        status: process.env.NEXT_PUBLIC_BOTPRESS_BOT_ID ? "configured" : "missing",
      },
      {
        name: "OpenClaw",
        status: process.env.OPENCLAW_URL ? "configured" : "missing",
      },
    ],
  }
}
