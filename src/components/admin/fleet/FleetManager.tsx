"use client"

import { useState } from "react"
import { CldImage } from "next-cloudinary"
import {
  Edit2,
  ImageOff,
  Loader2,
  Plus,
  Trash2,
  Wrench,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BoatDialog, type BoatRow } from "./BoatDialog"
import { MaintenanceDialog } from "./MaintenanceDialog"

interface MaintenanceWindow {
  id: number
  boatId: string
  date: string
  reason: string | null
}

interface Props {
  initialBoats: BoatRow[]
  initialMaintenance: MaintenanceWindow[]
}

const TONE: Record<string, string> = {
  standard: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  midsize: "bg-teal-500/10 text-teal-300 border-teal-500/20",
  large: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  luxury: "bg-amber-500/10 text-amber-300 border-amber-500/20",
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

export function FleetManager({ initialBoats, initialMaintenance }: Props) {
  const [boats, setBoats] = useState<BoatRow[]>(initialBoats)
  const [maintenance, setMaintenance] = useState<MaintenanceWindow[]>(initialMaintenance)
  const [boatDialog, setBoatDialog] = useState<{ open: boolean; boat: BoatRow | null }>({
    open: false,
    boat: null,
  })
  const [maintenanceDialog, setMaintenanceDialog] = useState<{
    open: boolean
    boatId: string
    boatName: string
  } | null>(null)
  const [deletingBoat, setDeletingBoat] = useState<string | null>(null)
  const [deletingMaint, setDeletingMaint] = useState<number | null>(null)

  const openAdd = () => setBoatDialog({ open: true, boat: null })
  const openEdit = (boat: BoatRow) => setBoatDialog({ open: true, boat })
  const closeBoatDialog = () => setBoatDialog({ open: false, boat: null })

  const handleBoatSaved = (saved: BoatRow) => {
    setBoats((prev) => {
      const idx = prev.findIndex((b) => b.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [...prev, saved]
    })
    closeBoatDialog()
  }

  const handleDeleteBoat = async (id: string) => {
    if (!confirm("Delete this boat? This cannot be undone.")) return
    setDeletingBoat(id)
    try {
      await fetch(`/api/admin/boats/${id}`, { method: "DELETE" })
      setBoats((prev) => prev.filter((b) => b.id !== id))
    } finally {
      setDeletingBoat(null)
    }
  }

  const handleMaintenanceSaved = async (boatId: string) => {
    const res = await fetch(`/api/admin/boats/${boatId}/maintenance`)
    if (res.ok) {
      const rows = (await res.json()) as MaintenanceWindow[]
      setMaintenance((prev) => [
        ...prev.filter((m) => m.boatId !== boatId),
        ...rows,
      ])
    }
    setMaintenanceDialog(null)
  }

  const handleDeleteMaintenance = async (id: number) => {
    setDeletingMaint(id)
    const maint = maintenance.find((m) => m.id === id)
    if (!maint) { setDeletingMaint(null); return }
    try {
      await fetch(`/api/admin/boats/${maint.boatId}/maintenance/${id}`, { method: "DELETE" })
      setMaintenance((prev) => prev.filter((m) => m.id !== id))
    } finally {
      setDeletingMaint(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header action */}
      <div className="flex justify-end">
        <Button
          type="button"
          className="rounded-full bg-amber-400 text-navy hover:bg-amber-300"
          onClick={openAdd}
        >
          <Plus className="size-4" />
          Add boat
        </Button>
      </div>

      {/* Boats list */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Boats ({boats.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {boats.length === 0 ? (
            <p className="text-sm text-white/40">No boats yet. Add one above.</p>
          ) : (
            boats
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((boat) => (
                <div
                  key={boat.id}
                  className="rounded-2xl border border-white/10 bg-black/10 p-4"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-white/5">
                      {CLOUD_NAME && boat.images?.[0] ? (
                        <CldImage
                          src={boat.images[0]}
                          alt={boat.name}
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImageOff className="size-6 text-white/20" />
                        </div>
                      )}
                      {(boat.images?.length ?? 0) > 1 && (
                        <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 text-[10px] text-white/70">
                          +{boat.images!.length - 1}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{boat.name}</span>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${TONE[boat.category] ?? ""}`}
                            >
                              {boat.category}
                            </span>
                            {!boat.isActive && (
                              <Badge className="rounded-full bg-red-500/10 text-red-400">
                                inactive
                              </Badge>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-white/45">
                            {boat.capacity} guests
                            {boat.length ? ` · ${boat.length}` : ""}
                            {boat.captainName ? ` · ${boat.captainName}` : ""}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-lg border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                            onClick={() =>
                              setMaintenanceDialog({
                                open: true,
                                boatId: boat.id,
                                boatName: boat.name,
                              })
                            }
                          >
                            <Wrench className="size-3.5" />
                            Maintenance
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-lg border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                            onClick={() => openEdit(boat)}
                          >
                            <Edit2 className="size-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-lg border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10"
                            onClick={() => handleDeleteBoat(boat.id)}
                            disabled={deletingBoat === boat.id}
                          >
                            {deletingBoat === boat.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-white/55">
                        <span>
                          Half day:{" "}
                          <span className="text-white/80">
                            {boat.priceHalfDay ? `$${boat.priceHalfDay}` : "—"}
                          </span>
                        </span>
                        <span>
                          Full day:{" "}
                          <span className="text-white/80">
                            {boat.priceFullDay ? `$${boat.priceFullDay}` : "—"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </CardContent>
      </Card>

      {/* Maintenance windows */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">
            Maintenance windows ({maintenance.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {maintenance.length === 0 ? (
            <p className="text-sm text-white/40">
              No maintenance blocks. Use the Maintenance button on a boat to add one.
            </p>
          ) : (
            maintenance
              .slice()
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((maint) => {
                const boatName =
                  boats.find((b) => b.id === maint.boatId)?.name ?? "Unknown"
                return (
                  <div
                    key={maint.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/10 px-4 py-3"
                  >
                    <div>
                      <span className="font-medium text-white">{boatName}</span>
                      <span className="ml-3 text-sm text-white/50">{formatDate(maint.date)}</span>
                      {maint.reason && maint.reason !== "maintenance" && (
                        <span className="ml-2 text-sm text-white/40">— {maint.reason}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteMaintenance(maint.id)}
                      disabled={deletingMaint === maint.id}
                      className="flex items-center gap-1 text-xs text-red-400/70 hover:text-red-400 disabled:opacity-40"
                    >
                      {deletingMaint === maint.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <X className="size-3.5" />
                      )}
                      Remove
                    </button>
                  </div>
                )
              })
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <BoatDialog
        open={boatDialog.open}
        boat={boatDialog.boat}
        onClose={closeBoatDialog}
        onSaved={handleBoatSaved}
      />

      {maintenanceDialog && (
        <MaintenanceDialog
          open={maintenanceDialog.open}
          boatId={maintenanceDialog.boatId}
          boatName={maintenanceDialog.boatName}
          onClose={() => setMaintenanceDialog(null)}
          onSaved={() => handleMaintenanceSaved(maintenanceDialog.boatId)}
        />
      )}
    </div>
  )
}
