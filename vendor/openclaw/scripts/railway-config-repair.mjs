import fs from "node:fs/promises";
import path from "node:path";
import JSON5 from "json5";

const CONFIG_DIR = process.env.OPENCLAW_CONFIG_DIR ?? "/data/.openclaw";
const CONFIG_PATH = process.env.OPENCLAW_CONFIG_PATH ?? path.join(CONFIG_DIR, "openclaw.json");
const CONTROL_UI_BASE_PATH = process.env.OPENCLAW_CONTROL_UI_BASE_PATH ?? "/openclaw";
const DEFAULT_ALLOWED_ORIGINS = process.env.OPENCLAW_ALLOWED_ORIGINS
  ? process.env.OPENCLAW_ALLOWED_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
  : process.env.RAILWAY_PUBLIC_DOMAIN
    ? [`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`]
    : [];

async function main() {
  await fs.mkdir(CONFIG_DIR, { recursive: true });

  let config = {};
  if (await fs.stat(CONFIG_PATH).then(() => true).catch(() => false)) {
    const raw = await fs.readFile(CONFIG_PATH, "utf8");
    config = JSON5.parse(raw);
  }

  // Only ensure gateway.controlUi is reachable — do not touch plugins or channels.
  // Plugins and channels are configured post-startup via the Control UI after WhatsApp QR scan.
  const gateway = typeof config.gateway === "object" && config.gateway !== null
    ? { ...config.gateway }
    : {};

  gateway.controlUi = {
    ...(typeof gateway.controlUi === "object" ? gateway.controlUi : {}),
    enabled: true,
    basePath: CONTROL_UI_BASE_PATH,
    ...(DEFAULT_ALLOWED_ORIGINS.length > 0 ? { allowedOrigins: DEFAULT_ALLOWED_ORIGINS } : {}),
    dangerouslyDisableDeviceAuth: true,
  };

  config.gateway = gateway;

  await fs.writeFile(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

await main();
