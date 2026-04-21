import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

import { getAdminAuthSecret } from "@/lib/auth/secret"

export default async function middleware(request: NextRequest) {
  const { nextUrl } = request
  const pathname = nextUrl.pathname
  const isLoginRoute = pathname === "/admin/login"
  const token = await getToken({ req: request, secret: getAdminAuthSecret() })

  if (token?.id && token.isActive && isLoginRoute) {
    return NextResponse.redirect(new URL("/admin", nextUrl))
  }

  if (!(token?.id && token.isActive) && !isLoginRoute) {
    const loginUrl = new URL("/admin/login", nextUrl)
    loginUrl.searchParams.set("callbackUrl", `${pathname}${nextUrl.search}`)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
