import { discordPlugin } from "../../extensions/discord/src/channel.ts";
import { imessagePlugin } from "../../extensions/imessage/src/channel.ts";
import { signalPlugin } from "../../extensions/signal/src/channel.ts";
import { slackPlugin } from "../../extensions/slack/src/channel.ts";
import { telegramPlugin } from "../../extensions/telegram/src/channel.ts";
import { whatsappPlugin } from "../../extensions/whatsapp/src/channel.ts";
import { setActivePluginRegistry } from "../plugins/runtime.ts";
import { createTestRegistry } from "../test-utils/channel-plugins.ts";

export function setDefaultChannelPluginRegistryForTests(): void {
  const channels = [
    { pluginId: "discord", plugin: discordPlugin, source: "test" },
    { pluginId: "slack", plugin: slackPlugin, source: "test" },
    { pluginId: "telegram", plugin: telegramPlugin, source: "test" },
    { pluginId: "whatsapp", plugin: whatsappPlugin, source: "test" },
    { pluginId: "signal", plugin: signalPlugin, source: "test" },
    { pluginId: "imessage", plugin: imessagePlugin, source: "test" },
  ] as unknown as Parameters<typeof createTestRegistry>[0];
  setActivePluginRegistry(createTestRegistry(channels));
}
