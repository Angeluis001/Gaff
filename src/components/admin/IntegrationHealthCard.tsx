import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { StatusBadge } from "./StatusBadge"

export function IntegrationHealthCard({
  name,
  status,
  nextAction,
}: {
  name: string
  status: "configured" | "missing" | "healthy" | "degraded"
  nextAction: string
}) {
  const tone =
    status === "healthy" || status === "configured"
      ? "success"
      : status === "degraded"
        ? "warning"
        : "danger"

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-white">{name}</CardTitle>
          <StatusBadge tone={tone}>{status}</StatusBadge>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-white/70">
        <div className="text-xs uppercase tracking-[0.22em] text-white/45">Next action</div>
        <div className="mt-2">{nextAction}</div>
      </CardContent>
    </Card>
  )
}
