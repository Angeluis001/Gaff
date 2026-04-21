import { getServerSession } from "next-auth"

import { adminAuthConfig } from "@/lib/auth/config"

export const authOptions = adminAuthConfig

export async function auth() {
  return getServerSession(authOptions)
}
