import type { Campaign, CampaignKind, VerticalBundle } from "@/lib/types";

export const CAMPAIGN_KIND_LABEL: Record<CampaignKind, string> = {
  birthday: "Sinh nhật",
  winback: "Win-back",
  vip: "VIP",
  new_service: "DV mới",
  post_treatment: "Aftercare",
  seasonal: "Theo mùa",
};

export function getCampaignStats(bundle: VerticalBundle) {
  const list = bundle.campaigns ?? [];
  const sent = list.reduce((s, c) => s + c.sentCount, 0);
  const failed = list.reduce((s, c) => s + c.failedCount, 0);
  return {
    total: list.length,
    draft: list.filter((c) => c.status === "draft").length,
    scheduled: list.filter((c) => c.status === "scheduled").length,
    completed: list.filter((c) => c.status === "completed").length,
    paused: list.filter((c) => c.status === "paused").length,
    sent,
    failed,
    deliveryRate: sent + failed === 0 ? 0 : Math.round((sent / (sent + failed)) * 100),
  };
}

export function campaignMessages(bundle: VerticalBundle, campaignId: string) {
  return bundle.messages.filter((m) => m.campaignId === campaignId);
}

export function emptyCampaignDraft(
  segmentId: string,
  templateId: string,
): Campaign {
  return {
    id: "",
    name: "Chiến dịch mới",
    kind: "seasonal",
    status: "draft",
    segmentId,
    templateId,
    scheduledAt: new Date().toISOString(),
    sentCount: 0,
    failedCount: 0,
    createdAt: new Date().toISOString(),
    note: "",
  };
}
