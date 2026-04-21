"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { MenuIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { getAccessibleAdminNav } from "@/lib/admin/navigation"
import type { AdminRole } from "@/lib/auth/session"

function AdminNavLinks({
  role,
  className,
}: {
  role: AdminRole
  className?: string
}) {
  const pathname = usePathname()
  const links = getAccessibleAdminNav(role)

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {links.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-xl border px-4 py-3 transition",
              active
                ? "border-primary/40 bg-primary/10 text-white shadow-[0_0_0_1px_rgba(212,168,67,0.15)]"
                : "border-transparent text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white"
            )}
          >
            <div className="text-sm font-medium">{item.label}</div>
            <div className="text-xs text-white/50">{item.description}</div>
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminSidebar({ role }: { role: AdminRole }) {
  return (
    <>
      <div className="border-b border-white/10 px-4 py-3 lg:hidden">
        <Sheet>
          <SheetTrigger render={<Button variant="outline" size="sm" />}>
            <MenuIcon />
            <span>Menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 bg-[#091420] text-white">
            <SheetHeader>
              <SheetTitle>GAFF Admin</SheetTitle>
            </SheetHeader>
            <AdminNavLinks role={role} className="px-2" />
          </SheetContent>
        </Sheet>
      </div>
      <aside className="hidden border-r border-white/10 bg-sidebar/90 px-4 py-6 lg:flex lg:flex-col">
        <div className="mb-6 space-y-1">
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">Phase 4</p>
          <div className="font-heading text-3xl text-white">Operations</div>
          <p className="text-sm text-white/55">Read, manage, and stage the charter business.</p>
        </div>
        <AdminNavLinks role={role} className="flex-1" />
      </aside>
    </>
  )
}
