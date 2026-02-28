import type { loadConfig } from "../config/config.ts";
import { resolveGatewayProbeAuth as resolveGatewayProbeAuthByMode } from "../gateway/probe-auth.ts";
export { pickGatewaySelfPresence } from "./gateway-presence.ts";

export function resolveGatewayProbeAuth(cfg: ReturnType<typeof loadConfig>): {
  token?: string;
  password?: string;
} {
  return resolveGatewayProbeAuthByMode({
    cfg,
    mode: cfg.gateway?.mode === "remote" ? "remote" : "local",
    env: process.env,
  });
}
