import type { Session, User } from "next-auth"
import type { AdapterUser } from "next-auth/adapters"
import Credentials from "next-auth/providers/credentials"
import type { JWT } from "next-auth/jwt"

import { authorizeAdminCredentials } from "./authorize"
import type { AdminAuthUser, AdminJwtToken } from "./session"
import { normalizeAdminRole } from "./session"
import { getAdminAuthSecret } from "./secret"

export const adminAuthConfig = {
  trustHost: true,
  secret: getAdminAuthSecret(),
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = typeof credentials?.email === "string" ? credentials.email : ""
        const password = typeof credentials?.password === "string" ? credentials.password : ""
        const adminUser = await authorizeAdminCredentials(email, password)

        if (!adminUser) {
          return null
        }

        return {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: normalizeAdminRole(adminUser.role),
          isActive: adminUser.isActive,
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }: { token: JWT; user?: User | AdapterUser | null }) => {
      if (user) {
        const adminUser = user as AdapterUser & AdminAuthUser
        const adminToken = token as AdminJwtToken

        adminToken.id = adminUser.id
        adminToken.email = adminUser.email
        adminToken.name = adminUser.name
        adminToken.role = normalizeAdminRole(adminUser.role)
        adminToken.isActive = Boolean(adminUser.isActive)
      }

      return token
    },
    session: async ({
      session,
      token,
    }: {
      session: Session
      token: AdminJwtToken
    }) => {
      if (session.user) {
        const adminSessionUser = session.user as Session["user"] & {
          id: string
          role: AdminAuthUser["role"]
          isActive: boolean
        }

        adminSessionUser.id = token.id ?? ""
        adminSessionUser.email = token.email ?? adminSessionUser.email ?? undefined
        adminSessionUser.name = token.name ?? adminSessionUser.name ?? null
        adminSessionUser.role = normalizeAdminRole(token.role)
        adminSessionUser.isActive = Boolean(token.isActive)
      }

      return session
    },
  },
}
