import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { StatusBadge } from "./StatusBadge"

export function AgentStatusCard({
  name,
  status,
  lastRun,
  nextStep,
}: {
  name: string
  status: "live" | "planned" | "blocked" | "pending"
  lastRun: string | null
  nextStep: string
}) {
  const tone =
    status === "live" ? "success" : status === "blocked" ? "danger" : status === "pending" ? "warning" : "info"

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-white">{name}</CardTitle>
          <StatusBadge tone={tone}>{status}</StatusBadge>
        </div>
        <p className="text-sm text-white/60">Last run: {lastRun ?? "Not started"}</p>
      </CardHeader>
      <CardContent className="text-sm text-white/70">
        <div className="text-xs uppercase tracking-[0.22em] text-white/45">Next step</div>
        <div className="mt-2">{nextStep}</div>
      </CardContent>
    </Card>
  )
}
