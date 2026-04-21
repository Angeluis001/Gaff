import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { StatusBadge, type StatusTone } from "./StatusBadge"

export function MetricCard({
  title,
  value,
  description,
  tone = "neutral",
  footnote,
}: {
  title: string
  value: string
  description?: string
  tone?: StatusTone
  footnote?: string
}) {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-sm uppercase tracking-[0.22em] text-white/70">
            {title}
          </CardTitle>
          <StatusBadge tone={tone}>{tone}</StatusBadge>
        </div>
        {description ? (
          <CardDescription className="text-sm text-white/60">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="font-heading text-3xl font-semibold text-white">{value}</div>
        {footnote ? <p className="text-sm text-white/55">{footnote}</p> : null}
      </CardContent>
    </Card>
  )
}
