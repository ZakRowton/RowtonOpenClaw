import { listChannelPlugins } from "../channels/plugins/index.ts";
import type { ChannelAccountSnapshot, ChannelPlugin } from "../channels/plugins/types.ts";
import type { OpenClawConfig } from "../config/config.ts";
import { resolveDefaultChannelAccountContext } from "./channel-account-context.ts";

export type LinkChannelContext = {
  linked: boolean;
  authAgeMs: number | null;
  account?: unknown;
  accountId?: string;
  plugin: ChannelPlugin;
};

export async function resolveLinkChannelContext(
  cfg: OpenClawConfig,
): Promise<LinkChannelContext | null> {
  for (const plugin of listChannelPlugins()) {
    const { defaultAccountId, account, enabled, configured } =
      await resolveDefaultChannelAccountContext(plugin, cfg);
    const snapshot = plugin.config.describeAccount
      ? plugin.config.describeAccount(account, cfg)
      : ({
          accountId: defaultAccountId,
          enabled,
          configured,
        } as ChannelAccountSnapshot);
    const summary = plugin.status?.buildChannelSummary
      ? await plugin.status.buildChannelSummary({
          account,
          cfg,
          defaultAccountId,
          snapshot,
        })
      : undefined;
    const summaryRecord = summary;
    const linked =
      summaryRecord && typeof summaryRecord.linked === "boolean" ? summaryRecord.linked : null;
    if (linked === null) {
      continue;
    }
    const authAgeMs =
      summaryRecord && typeof summaryRecord.authAgeMs === "number" ? summaryRecord.authAgeMs : null;
    return { linked, authAgeMs, account, accountId: defaultAccountId, plugin };
  }
  return null;
}
