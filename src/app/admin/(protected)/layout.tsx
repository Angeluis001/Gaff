import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { AdminShell } from "@/components/admin/AdminShell"

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  if (!session?.user?.id || !session.user.isActive) {
    redirect("/admin/login")
  }

  return (
    <AdminShell name={session.user.name || session.user.email || "Admin"} role={session.user.role}>
      {children}
    </AdminShell>
  )
}
