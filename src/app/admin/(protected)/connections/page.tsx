import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { ConnectionsCanvas } from "@/components/admin/ConnectionsCanvas"

export default function AdminConnectionsPage() {
  return (
    <div className="flex h-full flex-col space-y-6">
      <AdminPageHeader
        eyebrow="Entity graph"
        title="Connections"
        description="Visualise how leads, conversations, bookings, and clients connect. Search for any record to explore its relationship graph."
      />
      <div className="flex-1">
        <ConnectionsCanvas />
      </div>
    </div>
  )
}
