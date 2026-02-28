import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import { twitchPlugin } from "./src/plugin.ts";
import { setTwitchRuntime } from "./src/runtime.ts";

export { monitorTwitchProvider } from "./src/monitor.ts";

const plugin = {
  id: "twitch",
  name: "Twitch",
  description: "Twitch channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    setTwitchRuntime(api.runtime);
    // oxlint-disable-next-line typescript/no-explicit-any
    api.registerChannel({ plugin: twitchPlugin as any });
  },
};

export default plugin;
