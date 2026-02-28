import { createChannelRegistryLoader } from "./registry-loader.ts";
import type { ChannelId, ChannelPlugin } from "./types.ts";

const loadPluginFromRegistry = createChannelRegistryLoader<ChannelPlugin>((entry) => entry.plugin);

export async function loadChannelPlugin(id: ChannelId): Promise<ChannelPlugin | undefined> {
  return loadPluginFromRegistry(id);
}
