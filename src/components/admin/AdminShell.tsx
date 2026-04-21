import { AdminSidebar } from "./AdminSidebar"
import { AdminTopbar } from "./AdminTopbar"
import type { AdminRole } from "@/lib/auth/session"

export function AdminShell({
  children,
  name,
  role,
}: {
  children: React.ReactNode
  name: string
  role: AdminRole
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <AdminSidebar role={role} />
      <div className="flex min-h-screen flex-col">
        <AdminTopbar name={name} role={role} />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
