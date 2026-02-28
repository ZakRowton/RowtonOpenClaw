import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import { nostrPlugin } from "./src/channel.ts";
import type { NostrProfile } from "./src/config-schema.ts";
import { createNostrProfileHttpHandler } from "./src/nostr-profile-http.ts";
import { setNostrRuntime, getNostrRuntime } from "./src/runtime.ts";
import { resolveNostrAccount } from "./src/types.ts";

const plugin = {
  id: "nostr",
  name: "Nostr",
  description: "Nostr DM channel plugin via NIP-04",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    setNostrRuntime(api.runtime);
    api.registerChannel({ plugin: nostrPlugin });

    // Register HTTP handler for profile management
    const httpHandler = createNostrProfileHttpHandler({
      getConfigProfile: (accountId: string) => {
        const runtime = getNostrRuntime();
        const cfg = runtime.config.loadConfig();
        const account = resolveNostrAccount({ cfg, accountId });
        return account.profile;
      },
      updateConfigProfile: async (accountId: string, profile: NostrProfile) => {
        const runtime = getNostrRuntime();
        const cfg = runtime.config.loadConfig();

        // Build the config patch for channels.nostr.profile
        const channels = (cfg.channels ?? {}) as Record<string, unknown>;
        const nostrConfig = (channels.nostr ?? {}) as Record<string, unknown>;

        const updatedNostrConfig = {
          ...nostrConfig,
          profile,
        };

        const updatedChannels = {
          ...channels,
          nostr: updatedNostrConfig,
        };

        await runtime.config.writeConfigFile({
          ...cfg,
          channels: updatedChannels,
        });
      },
      getAccountInfo: (accountId: string) => {
        const runtime = getNostrRuntime();
        const cfg = runtime.config.loadConfig();
        const account = resolveNostrAccount({ cfg, accountId });
        if (!account.configured || !account.publicKey) {
          return null;
        }
        return {
          pubkey: account.publicKey,
          relays: account.relays,
        };
      },
      log: api.logger,
    });

    api.registerHttpHandler(httpHandler);
  },
};

export default plugin;
