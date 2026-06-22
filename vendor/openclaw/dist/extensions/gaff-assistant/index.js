import { i as formatErrorMessage } from "../../errors-D8p6rxH8.js";
import { t as definePluginEntry } from "../../plugin-entry-Bkat4og3.js";
import "../../error-runtime-CgBDklBz.js";
//#region extensions/gaff-assistant/index.ts
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function normalizeString(value) {
	return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
function trimTrailingSlash(value) {
	return value.replace(/\/+$/, "");
}
function joinUrl(baseUrl, path) {
	return `${trimTrailingSlash(baseUrl)}${path.startsWith("/") ? path : `/${path}`}`;
}
function resolveConfig(pluginConfig) {
	const raw = isRecord(pluginConfig) ? pluginConfig : {};
	return {
		siteUrl: trimTrailingSlash(normalizeString(raw.siteUrl) ?? normalizeString(process.env.GAFF_SITE_URL) ?? normalizeString(process.env.NEXT_PUBLIC_SITE_URL) ?? "https://gaff-gules.vercel.app"),
		knowledgePath: normalizeString(raw.knowledgePath) ?? "/api/chat/knowledge",
		reservationPath: normalizeString(raw.reservationPath) ?? "/api/chat/reservation"
	};
}
async function fetchKnowledgeExport(knowledgeUrl) {
	const response = await fetch(knowledgeUrl, {
		headers: { Accept: "application/json" },
		cache: "no-store"
	});
	if (!response.ok) throw new Error(`Failed to load GAFF knowledge: ${response.status} ${response.statusText}`);
	return await response.json();
}
async function createReservation(reservationUrl, payload) {
	const response = await fetch(reservationUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json"
		},
		body: JSON.stringify(payload)
	});
	const data = await response.json().catch(() => null);
	if (!response.ok) {
		const message = isRecord(data) && typeof data.error === "string" ? data.error : `Reservation request failed with HTTP ${response.status}`;
		throw new Error(message);
	}
	return data;
}
function buildGuidance(_knowledgeUrl, _reservationUrl) {
	return "You are operating in webhook-relay mode for GAFF All Fishing Los Cabos. All customer interactions on WhatsApp are handled by the GAFF backend pipeline. Do not compose replies to customers. Always respond with only: NO_REPLY";
}
var gaff_assistant_default = definePluginEntry({
	id: "gaff-assistant",
	name: "GAFF Assistant",
	description: "GAFF knowledge and reservation bridge for OpenClaw",
	register(api) {
		const config = resolveConfig(api.pluginConfig);
		const knowledgeUrl = joinUrl(config.siteUrl, config.knowledgePath);
		const reservationUrl = joinUrl(config.siteUrl, config.reservationPath);
		api.on("before_prompt_build", async () => ({ prependSystemContext: buildGuidance(knowledgeUrl, reservationUrl) }));
		api.registerTool({
			name: "gaff_knowledge",
			label: "GAFF Knowledge",
			description: "Fetch the canonical GAFF knowledge export. Call this for ANY question about GAFF including fish species, fishing seasons (what's in season NOW), boats, pricing, policies, FAQs, and booking rules. The response includes a 'seasons.inSeasonNow' field listing species currently in peak season.",
			parameters: {
				type: "object",
				additionalProperties: false,
				properties: { question: {
					type: "string",
					description: "Optional customer question to help the assistant focus the response."
				} }
			},
			async execute(_toolCallId, params) {
				try {
					const knowledge = await fetchKnowledgeExport(knowledgeUrl);
					const payload = {
						question: normalizeString(params?.question),
						knowledge
					};
					return {
						content: [{
							type: "text",
							text: JSON.stringify(payload, null, 2)
						}],
						details: payload
					};
				} catch (error) {
					return {
						content: [{
							type: "text",
							text: `Error: ${formatErrorMessage(error)}`
						}],
						details: { error: true }
					};
				}
			}
		});
		api.registerTool({
			name: "gaff_reservation",
			label: "GAFF Reservation",
			description: "Create a pending GAFF reservation and return the Stripe checkout link for the deposit.",
			parameters: {
				type: "object",
				additionalProperties: false,
				properties: {
					date: {
						type: "string",
						description: "Trip date in YYYY-MM-DD format."
					},
					boatId: {
						type: "string",
						description: "Boat identifier."
					},
					tripType: {
						type: "string",
						enum: [
							"half_day",
							"full_day",
							"overnight"
						],
						description: "Trip type."
					},
					guestCount: {
						type: "integer",
						minimum: 1,
						maximum: 12,
						description: "Number of guests."
					},
					firstName: {
						type: "string",
						description: "Guest first name."
					},
					lastName: {
						type: "string",
						description: "Guest last name."
					},
					email: {
						type: "string",
						description: "Guest email address."
					},
					phone: {
						type: "string",
						description: "Guest phone number."
					},
					specialRequests: {
						type: "string",
						description: "Optional special requests or notes."
					}
				},
				required: [
					"date",
					"boatId",
					"tripType",
					"guestCount",
					"firstName",
					"lastName",
					"email",
					"phone"
				]
			},
			async execute(_toolCallId, params) {
				try {
					const reservation = await createReservation(reservationUrl, {
						date: params.date,
						boatId: params.boatId,
						tripType: params.tripType,
						guestCount: params.guestCount,
						firstName: params.firstName,
						lastName: params.lastName,
						email: params.email,
						phone: params.phone,
						specialRequests: params.specialRequests
					});
					return {
						content: [{
							type: "text",
							text: JSON.stringify(reservation, null, 2)
						}],
						details: reservation
					};
				} catch (error) {
					return {
						content: [{
							type: "text",
							text: `Error: ${formatErrorMessage(error)}`
						}],
						details: { error: true }
					};
				}
			}
		});
		// Direct WhatsApp notification endpoint — bypasses AI, delivers message straight to channel
		api.registerHttpRoute({
			path: "/gaff/notify",
			auth: "plugin",
			handler: async (req, res) => {
				if (req.method !== "POST") {
					res.writeHead(405, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ ok: false, error: "Method Not Allowed" }));
					return true;
				}
				const secret = process.env.OPENCLAW_WEBHOOK_SECRET?.trim();
				if (secret) {
					const authHeader = req.headers.authorization ?? "";
					const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
					if (token !== secret) {
						res.writeHead(401, { "Content-Type": "application/json" });
						res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
						return true;
					}
				}
				let body = {};
				try {
					body = await new Promise((resolve, reject) => {
						let data = "";
						req.on("data", chunk => { data += chunk.toString(); });
						req.on("end", () => {
							try { resolve(JSON.parse(data)); }
							catch { reject(new Error("Invalid JSON")); }
						});
						req.on("error", reject);
					});
				} catch {
					res.writeHead(400, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ ok: false, error: "Invalid JSON body" }));
					return true;
				}
				const to = typeof body.to === "string" ? body.to.trim() : "";
				const text = typeof body.message === "string" ? body.message.trim() : "";
				if (!to || !text) {
					res.writeHead(400, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ ok: false, error: "'to' and 'message' are required" }));
					return true;
				}
				try {
					const adapter = await api.runtime.channel.outbound.loadAdapter("whatsapp");
					if (!adapter?.sendText) {
						res.writeHead(503, { "Content-Type": "application/json" });
						res.end(JSON.stringify({ ok: false, error: "WhatsApp channel not available or not connected" }));
						return true;
					}
					await adapter.sendText({ cfg: api.config, to, text });
					res.writeHead(200, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ ok: true }));
				} catch (err) {
					res.writeHead(500, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ ok: false, error: formatErrorMessage(err) }));
				}
				return true;
			}
		});
	}
});
//#endregion
export { gaff_assistant_default as default };
