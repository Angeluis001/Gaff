import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { AgentStatusCard } from "@/components/admin/AgentStatusCard"
import { AdminStatGrid } from "@/components/admin/AdminStatGrid"
import { MetricCard } from "@/components/admin/MetricCard"
import { getAdminAgentStatus } from "@/lib/admin/agents"

export default async function AdminAgentsPage() {
  const agents = getAdminAgentStatus()

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Future automation"
        title="Agents"
        description="Readiness and staging surfaces for the AI workflows that arrive in later phases."
      />

      <AdminStatGrid>
        <MetricCard title="Planned agents" value={String(agents.length)} tone="info" />
        <MetricCard title="Live automation" value="0" tone="warning" />
      </AdminStatGrid>

      <div className="grid gap-4 xl:grid-cols-2">
        {agents.map((agent) => (
          <AgentStatusCard
            key={agent.name}
            name={agent.name}
            status={agent.status as "pending" | "blocked" | "live" | "planned"}
            lastRun={agent.lastRun}
            nextStep={agent.nextStep}
          />
        ))}
      </div>
    </div>
  )
}
