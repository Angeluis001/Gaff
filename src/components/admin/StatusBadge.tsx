import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STATUS_VARIANTS = {
  success: "bg-emerald-500/15 text-emerald-100 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-100 border-amber-500/30",
  danger: "bg-rose-500/15 text-rose-100 border-rose-500/30",
  neutral: "bg-slate-500/15 text-slate-100 border-slate-500/30",
  info: "bg-cyan-500/15 text-cyan-100 border-cyan-500/30",
} as const

export type StatusTone = keyof typeof STATUS_VARIANTS

export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: StatusTone
  children: React.ReactNode
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn("border px-2.5 py-0.5 font-medium", STATUS_VARIANTS[tone], className)}
    >
      {children}
    </Badge>
  )
}
