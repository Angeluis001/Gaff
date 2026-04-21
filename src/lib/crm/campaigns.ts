import { db } from "@/lib/db"
import { clients } from "@/lib/db/schema"
import { redis } from "@/lib/redis"
import { eq } from "drizzle-orm"

type CampaignType = "anniversary" | "seasonal" | "reengagement"

export type ClientCampaignSchedule = {
  clientId: string
  type: CampaignType
  dueAt: string
  key: string
  payload: Record<string, unknown>
}

function scheduleDate(daysFromNow: number) {
  const dueAt = new Date()
  dueAt.setDate(dueAt.getDate() + daysFromNow)
  return dueAt
}

async function persistCampaign(schedule: ClientCampaignSchedule) {
  if (redis) {
    await redis.set(schedule.key, JSON.stringify(schedule.payload))
  }
}

export async function scheduleClientLifecycleCampaigns(clientId: string) {
  const [client] = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1)

  if (!client) {
    throw new Error("Client not found.")
  }

  const schedules: ClientCampaignSchedule[] = [
    {
      clientId: client.id,
      type: "anniversary",
      dueAt: scheduleDate(365).toISOString(),
      key: `gaff:client-campaign:${client.id}:anniversary`,
      payload: {
        clientId: client.id,
        type: "anniversary",
        name: `${client.firstName} ${client.lastName}`.trim(),
        email: client.email,
      },
    },
    {
      clientId: client.id,
      type: "seasonal",
      dueAt: scheduleDate(90).toISOString(),
      key: `gaff:client-campaign:${client.id}:seasonal`,
      payload: {
        clientId: client.id,
        type: "seasonal",
        name: `${client.firstName} ${client.lastName}`.trim(),
        email: client.email,
      },
    },
    {
      clientId: client.id,
      type: "reengagement",
      dueAt: scheduleDate(180).toISOString(),
      key: `gaff:client-campaign:${client.id}:reengagement`,
      payload: {
        clientId: client.id,
        type: "reengagement",
        name: `${client.firstName} ${client.lastName}`.trim(),
        email: client.email,
      },
    },
  ]

  await Promise.all(schedules.map((schedule) => persistCampaign(schedule)))

  return schedules
}
