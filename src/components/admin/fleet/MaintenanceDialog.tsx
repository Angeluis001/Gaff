"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Props {
  open: boolean
  boatId: string
  boatName: string
  onClose: () => void
  onSaved: () => void
}

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"

const labelClass = "block text-xs font-semibold uppercase tracking-widest text-white/50 mb-1"

export function MaintenanceDialog({ open, boatId, boatName, onClose, onSaved }: Props) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("maintenance")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function buildDateRange(start: string, end: string) {
    const dates: string[] = []
    const current = new Date(start)
    const last = new Date(end)
    while (current <= last) {
      dates.push(current.toISOString().split("T")[0])
      current.setDate(current.getDate() + 1)
    }
    return dates
  }

  const handleSave = async () => {
    setError(null)

    if (!startDate) {
      setError("Start date is required")
      return
    }

    const dates = endDate && endDate >= startDate
      ? buildDateRange(startDate, endDate)
      : [startDate]

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/boats/${boatId}/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates, reason: reason.trim() || "maintenance" }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? "Failed to save")
      }

      setStartDate("")
      setEndDate("")
      setReason("maintenance")
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving maintenance")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="border border-white/10 bg-[#0a1628] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Block maintenance — {boatName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Start date *</label>
              <input
                type="date"
                className={fieldClass}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>End date (optional)</label>
              <input
                type="date"
                className={fieldClass}
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Reason</label>
            <input
              className={fieldClass}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Engine service, hull cleaning…"
            />
          </div>

          {startDate && (
            <p className="text-xs text-white/40">
              Blocking{" "}
              {endDate && endDate >= startDate
                ? buildDateRange(startDate, endDate).length
                : 1}{" "}
              day(s).
            </p>
          )}

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-full bg-amber-400 text-navy hover:bg-amber-300"
            onClick={handleSave}
            disabled={saving}
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            Block dates
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
