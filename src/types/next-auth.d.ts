import type { DefaultSession } from "next-auth"
import type { AdminRole } from "@/lib/auth/session"

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string
      role: AdminRole
      isActive: boolean
    }
  }

  interface User {
    id: string
    role: AdminRole
    isActive: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: AdminRole
    isActive?: boolean
  }
}
