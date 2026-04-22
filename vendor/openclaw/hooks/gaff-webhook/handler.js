const GAFF_WEBHOOK_URL = process.env.GAFF_WEBHOOK_URL?.trim();
const OPENCLAW_WEBHOOK_SECRET = process.env.OPENCLAW_WEBHOOK_SECRET?.trim();

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export default async function handler(event) {
  if (!event || event.type !== "message" || event.action !== "received") {
    return;
  }

  const context = event.context ?? {};
  if (normalizeText(context.channelId) !== "whatsapp") {
    return;
  }

  if (!GAFF_WEBHOOK_URL) {
    console.warn("[gaff-webhook] GAFF_WEBHOOK_URL is not configured");
    return;
  }

  const content = normalizeText(context.content);
  if (!content) {
    return;
  }

  const payload = {
    conversationId: normalizeText(context.conversationId) || undefined,
    messageId: normalizeText(context.messageId) || undefined,
    from: normalizeText(context.from) || undefined,
    phone: normalizeText(context.from) || undefined,
    name: normalizeText(context.metadata?.senderName) || normalizeText(context.from) || undefined,
    text: content,
    body: content,
    timestamp: context.timestamp ?? Date.now(),
    metadata: {
      ...(context.metadata ?? {}),
      channelId: context.channelId,
      accountId: context.accountId,
    },
    lead: {
      source: "whatsapp",
      notes: content,
      whatsappNumber: normalizeText(context.from) || undefined,
      metadata: {
        ...(context.metadata ?? {}),
      },
    },
  };

  try {
    await fetch(GAFF_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(OPENCLAW_WEBHOOK_SECRET
          ? {
              authorization: `Bearer ${OPENCLAW_WEBHOOK_SECRET}`,
              "x-openclaw-token": OPENCLAW_WEBHOOK_SECRET,
            }
          : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.warn("[gaff-webhook] failed to deliver webhook", error);
  }
}
