import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import { googlechatDock, googlechatPlugin } from "./src/channel.ts";
import { handleGoogleChatWebhookRequest } from "./src/monitor.ts";
import { setGoogleChatRuntime } from "./src/runtime.ts";

const plugin = {
  id: "googlechat",
  name: "Google Chat",
  description: "OpenClaw Google Chat channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    setGoogleChatRuntime(api.runtime);
    api.registerChannel({ plugin: googlechatPlugin, dock: googlechatDock });
    api.registerHttpHandler(handleGoogleChatWebhookRequest);
  },
};

export default plugin;
