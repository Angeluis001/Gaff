import { getMarketingQueueSummary } from "./engagement"
import { getMetaPublishingReadiness } from "./meta"
import { getTikTokPublishingReadiness } from "./tiktok"

export async function getAdsSummary() {
  const queue = await getMarketingQueueSummary()
  const meta = getMetaPublishingReadiness()
  const tiktok = getTikTokPublishingReadiness()

  const campaigns = [
    {
      name: "Meta retargeting",
      audience: "Recent leads and site visitors",
      status: meta.configured ? "ready" : "blocked",
      spend: meta.configured ? "Ready to launch" : "Missing Meta credentials",
    },
    {
      name: "TikTok awareness",
      audience: "Top-of-funnel travelers",
      status: tiktok.configured ? "ready" : "blocked",
      spend: tiktok.configured ? "Ready to launch" : "Missing TikTok access token",
    },
  ] as const

  const readyCampaigns = campaigns.filter((campaign) => campaign.status === "ready").length

  return {
    queue: queue.summary,
    campaigns,
    readiness: readyCampaigns === campaigns.length ? "ready" : readyCampaigns > 0 ? "partial" : "blocked",
    spendStatus:
      readyCampaigns === campaigns.length ? "Launch-ready" : readyCampaigns > 0 ? "Partial setup" : "Not ready",
  }
}
