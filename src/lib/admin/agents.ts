import { formatDateTime } from "./formatters"

export function getAdminAgentStatus() {
  return [
    {
      name: "Lead Agent",
      status: "live",
      lastRun: null,
      nextStep: "Classify new leads and schedule follow-up sequences in Phase 5.",
    },
    {
      name: "Client Agent",
      status: "planned",
      lastRun: null,
      nextStep: "Track trip anniversaries and post-trip engagement in Phase 6.",
    },
    {
      name: "Reviews Agent",
      status: "planned",
      lastRun: null,
      nextStep: "Surface draft responses from review monitors in Phase 6.",
    },
    {
      name: "SEO Agent",
      status: "live",
      lastRun: null,
      nextStep: "Generate weekly blog content and fishing reports from the SEO content store.",
    },
    {
      name: "Marketing Agent",
      status: "live",
      lastRun: null,
      nextStep: "Publish the social calendar and keep Meta/TikTok queue health visible.",
    },
  ].map((agent) => ({
    ...agent,
    lastRun: agent.lastRun ? formatDateTime(agent.lastRun) : null,
  }))
}
