import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function AdminPageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: {
  title: string
  description?: string
  eyebrow?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-4 border-b border-white/10 pb-6", className)}>
      {eyebrow ? <Badge className="w-fit">{eyebrow}</Badge> : null}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="font-heading text-4xl font-semibold text-white">{title}</h1>
          {description ? <p className="max-w-3xl text-sm text-white/65">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}
