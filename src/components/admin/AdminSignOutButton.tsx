"use client"

import { signOut } from "next-auth/react"

import { Button } from "@/components/ui/button"

export function AdminSignOutButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        void signOut({ callbackUrl: "/admin/login" })
      }}
    >
      Sign out
    </Button>
  )
}
