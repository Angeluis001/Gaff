import type { IncomingMessage, ServerResponse } from "node:http";

import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";

type GaffAssistantPluginConfig = {
  siteUrl?: string;
  knowledgePath?: string;
  reservationPath?: string;
};

type BookingReservationPayload = {
  date: string;
  boatId: string;
  tripType: "half_day" | "full_day" | "overnight";
  guestCount: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
};

type KnowledgeExportResponse = {
  version?: string;
  updatedAt?: string;
  sourceOfTruth?: Record<string, string>;
  business?: Record<string, unknown>;
  usageNotes?: string[];
  bookingFlow?: Record<string, unknown>;
  faq?: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function joinUrl(baseUrl: string, path: string) {
  const normalizedBase = trimTrailingSlash(baseUrl);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function resolveConfig(pluginConfig: unknown) {
  const raw = isRecord(pluginConfig) ? pluginConfig : {};
  const siteUrl =
    normalizeString(raw.siteUrl) ??
    normalizeString(process.env.GAFF_SITE_URL) ??
    normalizeString(process.env.NEXT_PUBLIC_SITE_URL) ??
    "https://gaff-gules.vercel.app";

  return {
    siteUrl: trimTrailingSlash(siteUrl),
    knowledgePath: normalizeString(raw.knowledgePath) ?? "/api/chat/knowledge",
    reservationPath: normalizeString(raw.reservationPath) ?? "/api/chat/reservation",
  };
}

async function fetchKnowledgeExport(knowledgeUrl: string): Promise<KnowledgeExportResponse> {
  const response = await fetch(knowledgeUrl, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load GAFF knowledge: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as KnowledgeExportResponse;
}

async function createReservation(
  reservationUrl: string,
  payload: BookingReservationPayload,
): Promise<unknown> {
  const response = await fetch(reservationUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      isRecord(data) && typeof data.error === "string"
        ? data.error
        : `Reservation request failed with HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}

function buildGuidance(knowledgeUrl: string, reservationUrl: string) {
  return [
    "GAFF fishing assistant instructions:",
    `- Use ${knowledgeUrl} as the canonical source for GAFF facts, FAQs, policies, contacts, and booking rules.`,
    "- Do not invent availability, pricing, or boat details.",
    "- Before promising a date or boat, confirm availability through the knowledge source or the booking flow.",
    "- If the guest wants to reserve, collect all required booking details first: date, boatId, tripType, guestCount, firstName, lastName, email, and phone.",
    "- Once the guest has provided the required data, use the gaff_reservation tool to create the reservation and return the checkout link.",
    "- If a field is missing, ask only for the missing field(s) rather than restarting the conversation.",
    `- The reservation endpoint is ${reservationUrl}.`,
  ].join("\n")
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: Buffer) => { data += chunk.toString(); });
    req.on("end", () => {
      try {
        resolve(JSON.parse(data) as Record<string, unknown>);
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

export default definePluginEntry({
  id: "gaff-assistant",
  name: "GAFF Assistant",
  description: "GAFF knowledge and reservation bridge for OpenClaw",
  register(api) {
    const config = resolveConfig(api.pluginConfig);
    const knowledgeUrl = joinUrl(config.siteUrl, config.knowledgePath);
    const reservationUrl = joinUrl(config.siteUrl, config.reservationPath);

    api.on("before_prompt_build", async () => ({
      prependSystemContext: buildGuidance(knowledgeUrl, reservationUrl),
    }));

    api.registerTool({
      name: "gaff_knowledge",
      label: "GAFF Knowledge",
      description:
        "Fetch the canonical GAFF knowledge export for FAQs, booking rules, contacts, and source-of-truth URLs.",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          question: {
            type: "string",
            description: "Optional customer question to help the assistant focus the response.",
          },
        },
      },
      async execute(_toolCallId: string, params: { question?: string }) {
        try {
          const knowledge = await fetchKnowledgeExport(knowledgeUrl);
          const payload = {
            question: normalizeString(params?.question),
            knowledge,
          };

          return {
            content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
            details: payload,
          };
        } catch (error: unknown) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: ${formatErrorMessage(error)}`,
              },
            ],
            details: { error: true },
          };
        }
      },
    });

    api.registerTool({
      name: "gaff_reservation",
      label: "GAFF Reservation",
      description:
        "Create a pending GAFF reservation and return the Stripe checkout link for the deposit.",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          date: { type: "string", description: "Trip date in YYYY-MM-DD format." },
          boatId: { type: "string", description: "Boat identifier." },
          tripType: {
            type: "string",
            enum: ["half_day", "full_day", "overnight"],
            description: "Trip type.",
          },
          guestCount: {
            type: "integer",
            minimum: 1,
            maximum: 12,
            description: "Number of guests.",
          },
          firstName: { type: "string", description: "Guest first name." },
          lastName: { type: "string", description: "Guest last name." },
          email: { type: "string", description: "Guest email address." },
          phone: { type: "string", description: "Guest phone number." },
          specialRequests: {
            type: "string",
            description: "Optional special requests or notes.",
          },
        },
        required: [
          "date",
          "boatId",
          "tripType",
          "guestCount",
          "firstName",
          "lastName",
          "email",
          "phone",
        ],
      },
      async execute(_toolCallId: string, params: BookingReservationPayload) {
        try {
          const payload = {
            date: params.date,
            boatId: params.boatId,
            tripType: params.tripType,
            guestCount: params.guestCount,
            firstName: params.firstName,
            lastName: params.lastName,
            email: params.email,
            phone: params.phone,
            specialRequests: params.specialRequests,
          };

          const reservation = await createReservation(reservationUrl, payload);
          return {
            content: [{ type: "text" as const, text: JSON.stringify(reservation, null, 2) }],
            details: reservation,
          };
        } catch (error: unknown) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: ${formatErrorMessage(error)}`,
              },
            ],
            details: { error: true },
          };
        }
      },
    });

    // Direct WhatsApp notification endpoint — bypasses AI, delivers message straight to channel
    api.registerHttpRoute({
      path: "/gaff/notify",
      auth: "plugin",
      handler: async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== "POST") {
          sendJson(res, 405, { ok: false, error: "Method Not Allowed" });
          return true;
        }

        const secret = process.env.OPENCLAW_WEBHOOK_SECRET?.trim();
        if (secret) {
          const authHeader = (req.headers.authorization as string | undefined) ?? "";
          const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
          if (token !== secret) {
            sendJson(res, 401, { ok: false, error: "Unauthorized" });
            return true;
          }
        }

        let body: Record<string, unknown>;
        try {
          body = await readJsonBody(req);
        } catch {
          sendJson(res, 400, { ok: false, error: "Invalid JSON body" });
          return true;
        }

        const to = typeof body.to === "string" ? body.to.trim() : "";
        const text = typeof body.message === "string" ? body.message.trim() : "";
        if (!to || !text) {
          sendJson(res, 400, { ok: false, error: "'to' and 'message' are required" });
          return true;
        }

        try {
          const adapter = await api.runtime.channel.outbound.loadAdapter("whatsapp");
          if (!adapter?.sendText) {
            sendJson(res, 503, { ok: false, error: "WhatsApp channel not available or not connected" });
            return true;
          }
          await adapter.sendText({ cfg: api.config, to, text });
          sendJson(res, 200, { ok: true });
        } catch (err: unknown) {
          sendJson(res, 500, { ok: false, error: formatErrorMessage(err) });
        }
        return true;
      },
    });
  },
});
