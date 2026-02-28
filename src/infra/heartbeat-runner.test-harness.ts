import { beforeEach } from "vitest";
import { slackPlugin } from "../../extensions/slack/src/channel.ts";
import { setSlackRuntime } from "../../extensions/slack/src/runtime.ts";
import { telegramPlugin } from "../../extensions/telegram/src/channel.ts";
import { setTelegramRuntime } from "../../extensions/telegram/src/runtime.ts";
import { whatsappPlugin } from "../../extensions/whatsapp/src/channel.ts";
import { setWhatsAppRuntime } from "../../extensions/whatsapp/src/runtime.ts";
import type { ChannelPlugin } from "../channels/plugins/types.plugin.ts";
import { setActivePluginRegistry } from "../plugins/runtime.ts";
import { createPluginRuntime } from "../plugins/runtime/index.ts";
import { createTestRegistry } from "../test-utils/channel-plugins.ts";

const slackChannelPlugin = slackPlugin as unknown as ChannelPlugin;
const telegramChannelPlugin = telegramPlugin as unknown as ChannelPlugin;
const whatsappChannelPlugin = whatsappPlugin as unknown as ChannelPlugin;

export function installHeartbeatRunnerTestRuntime(params?: { includeSlack?: boolean }): void {
  beforeEach(() => {
    const runtime = createPluginRuntime();
    setTelegramRuntime(runtime);
    setWhatsAppRuntime(runtime);
    if (params?.includeSlack) {
      setSlackRuntime(runtime);
      setActivePluginRegistry(
        createTestRegistry([
          { pluginId: "slack", plugin: slackChannelPlugin, source: "test" },
          { pluginId: "whatsapp", plugin: whatsappChannelPlugin, source: "test" },
          { pluginId: "telegram", plugin: telegramChannelPlugin, source: "test" },
        ]),
      );
      return;
    }
    setActivePluginRegistry(
      createTestRegistry([
        { pluginId: "whatsapp", plugin: whatsappChannelPlugin, source: "test" },
        { pluginId: "telegram", plugin: telegramChannelPlugin, source: "test" },
      ]),
    );
  });
}
