import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

import { AdminSignOutButton } from "./AdminSignOutButton"

export function AdminTopbar({
  name,
  role,
}: {
  name: string
  role: string
}) {
  return (
    <div className="border-b border-white/10 bg-background/90 px-4 py-4 backdrop-blur lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/50">Secure console</p>
          <h2 className="font-heading text-2xl text-white">GAFF Admin</h2>
        </div>
        <div className="flex items-center gap-3">
          <Card className="hidden border-white/10 bg-white/5 px-3 py-2 text-right sm:block">
            <div className="text-sm font-medium text-white">{name}</div>
            <div className="flex justify-end">
              <Badge variant="outline" className="border-white/15 text-white/70">
                {role}
              </Badge>
            </div>
          </Card>
          <AdminSignOutButton />
        </div>
      </div>
    </div>
  )
}
