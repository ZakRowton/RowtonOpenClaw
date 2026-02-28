import type { OpenClawConfig } from "../../config/config.ts";
import { resolveAccountEntry } from "../../routing/account-lookup.ts";
import { normalizeAccountId } from "../../routing/session-key.ts";
import type { ChannelId } from "./types.ts";

type ChannelConfigWithAccounts = {
  configWrites?: boolean;
  accounts?: Record<string, { configWrites?: boolean }>;
};

function resolveAccountConfig(accounts: ChannelConfigWithAccounts["accounts"], accountId: string) {
  return resolveAccountEntry(accounts, accountId);
}

export function resolveChannelConfigWrites(params: {
  cfg: OpenClawConfig;
  channelId?: ChannelId | null;
  accountId?: string | null;
}): boolean {
  if (!params.channelId) {
    return true;
  }
  const channels = params.cfg.channels as Record<string, ChannelConfigWithAccounts> | undefined;
  const channelConfig = channels?.[params.channelId];
  if (!channelConfig) {
    return true;
  }
  const accountId = normalizeAccountId(params.accountId);
  const accountConfig = resolveAccountConfig(channelConfig.accounts, accountId);
  const value = accountConfig?.configWrites ?? channelConfig.configWrites;
  return value !== false;
}
