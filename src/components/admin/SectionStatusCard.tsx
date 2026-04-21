import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { StatusBadge } from "./StatusBadge"

export function SectionStatusCard({
  title,
  status,
  description,
  nextStep,
}: {
  title: string
  status: "live" | "planned" | "blocked" | "pending"
  description: string
  nextStep: string
}) {
  const tone =
    status === "live" ? "success" : status === "blocked" ? "danger" : status === "pending" ? "warning" : "info"

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-white">{title}</CardTitle>
          <StatusBadge tone={tone}>{status}</StatusBadge>
        </div>
        <p className="text-sm text-white/60">{description}</p>
      </CardHeader>
      <CardContent className="text-sm text-white/70">
        <div className="text-xs uppercase tracking-[0.22em] text-white/45">Next step</div>
        <div className="mt-2">{nextStep}</div>
      </CardContent>
    </Card>
  )
}
