import type { OpenClawConfig } from "../config/config.ts";

export function resolveChannelAccountConfigBasePath(params: {
  cfg: OpenClawConfig;
  channelKey: string;
  accountId: string;
}): string {
  const channels = params.cfg.channels as unknown as Record<string, unknown> | undefined;
  const channelSection = channels?.[params.channelKey] as Record<string, unknown> | undefined;
  const accounts = channelSection?.accounts as Record<string, unknown> | undefined;
  const useAccountPath = Boolean(accounts?.[params.accountId]);
  return useAccountPath
    ? `channels.${params.channelKey}.accounts.${params.accountId}.`
    : `channels.${params.channelKey}.`;
}
