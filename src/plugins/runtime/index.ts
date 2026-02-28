import { createRequire } from "node:module";
import { resolveEffectiveMessagesConfig, resolveHumanDelayConfig } from "../../agents/identity.ts";
import { createMemoryGetTool, createMemorySearchTool } from "../../agents/tools/memory-tool.ts";
import { handleSlackAction } from "../../agents/tools/slack-actions.ts";
import {
  chunkByNewline,
  chunkMarkdownText,
  chunkMarkdownTextWithMode,
  chunkText,
  chunkTextWithMode,
  resolveChunkMode,
  resolveTextChunkLimit,
} from "../../auto-reply/chunk.ts";
import {
  hasControlCommand,
  isControlCommandMessage,
  shouldComputeCommandAuthorized,
} from "../../auto-reply/command-detection.ts";
import { shouldHandleTextCommands } from "../../auto-reply/commands-registry.ts";
import {
  formatAgentEnvelope,
  formatInboundEnvelope,
  resolveEnvelopeFormatOptions,
} from "../../auto-reply/envelope.ts";
import {
  createInboundDebouncer,
  resolveInboundDebounceMs,
} from "../../auto-reply/inbound-debounce.ts";
import { dispatchReplyFromConfig } from "../../auto-reply/reply/dispatch-from-config.ts";
import { finalizeInboundContext } from "../../auto-reply/reply/inbound-context.ts";
import {
  buildMentionRegexes,
  matchesMentionPatterns,
  matchesMentionWithExplicit,
} from "../../auto-reply/reply/mentions.ts";
import { dispatchReplyWithBufferedBlockDispatcher } from "../../auto-reply/reply/provider-dispatcher.ts";
import { createReplyDispatcherWithTyping } from "../../auto-reply/reply/reply-dispatcher.ts";
import { removeAckReactionAfterReply, shouldAckReaction } from "../../channels/ack-reactions.ts";
import { resolveCommandAuthorizedFromAuthorizers } from "../../channels/command-gating.ts";
import { discordMessageActions } from "../../channels/plugins/actions/discord.ts";
import { signalMessageActions } from "../../channels/plugins/actions/signal.ts";
import { telegramMessageActions } from "../../channels/plugins/actions/telegram.ts";
import { createWhatsAppLoginTool } from "../../channels/plugins/agent-tools/whatsapp-login.ts";
import { recordInboundSession } from "../../channels/session.ts";
import { registerMemoryCli } from "../../cli/memory-cli.ts";
import { loadConfig, writeConfigFile } from "../../config/config.ts";
import {
  resolveChannelGroupPolicy,
  resolveChannelGroupRequireMention,
} from "../../config/group-policy.ts";
import { resolveMarkdownTableMode } from "../../config/markdown-tables.ts";
import { resolveStateDir } from "../../config/paths.ts";
import {
  readSessionUpdatedAt,
  recordSessionMetaFromInbound,
  resolveStorePath,
  updateLastRoute,
} from "../../config/sessions.ts";
import { auditDiscordChannelPermissions } from "../../discord/audit.ts";
import {
  listDiscordDirectoryGroupsLive,
  listDiscordDirectoryPeersLive,
} from "../../discord/directory-live.ts";
import { monitorDiscordProvider } from "../../discord/monitor.ts";
import { probeDiscord } from "../../discord/probe.ts";
import { resolveDiscordChannelAllowlist } from "../../discord/resolve-channels.ts";
import { resolveDiscordUserAllowlist } from "../../discord/resolve-users.ts";
import { sendMessageDiscord, sendPollDiscord } from "../../discord/send.ts";
import { shouldLogVerbose } from "../../globals.ts";
import { monitorIMessageProvider } from "../../imessage/monitor.ts";
import { probeIMessage } from "../../imessage/probe.ts";
import { sendMessageIMessage } from "../../imessage/send.ts";
import { getChannelActivity, recordChannelActivity } from "../../infra/channel-activity.ts";
import { enqueueSystemEvent } from "../../infra/system-events.ts";
import {
  listLineAccountIds,
  normalizeAccountId as normalizeLineAccountId,
  resolveDefaultLineAccountId,
  resolveLineAccount,
} from "../../line/accounts.ts";
import { monitorLineProvider } from "../../line/monitor.ts";
import { probeLineBot } from "../../line/probe.ts";
import {
  createQuickReplyItems,
  pushMessageLine,
  pushMessagesLine,
  pushFlexMessage,
  pushTemplateMessage,
  pushLocationMessage,
  pushTextMessageWithQuickReplies,
  sendMessageLine,
} from "../../line/send.ts";
import { buildTemplateMessageFromPayload } from "../../line/template-messages.ts";
import { getChildLogger } from "../../logging.ts";
import { normalizeLogLevel } from "../../logging/levels.ts";
import { convertMarkdownTables } from "../../markdown/tables.ts";
import { isVoiceCompatibleAudio } from "../../media/audio.ts";
import { mediaKindFromMime } from "../../media/constants.ts";
import { fetchRemoteMedia } from "../../media/fetch.ts";
import { getImageMetadata, resizeToJpeg } from "../../media/image-ops.ts";
import { detectMime } from "../../media/mime.ts";
import { saveMediaBuffer } from "../../media/store.ts";
import { buildPairingReply } from "../../pairing/pairing-messages.ts";
import {
  readChannelAllowFromStore,
  upsertChannelPairingRequest,
} from "../../pairing/pairing-store.ts";
import { runCommandWithTimeout } from "../../process/exec.ts";
import { resolveAgentRoute } from "../../routing/resolve-route.ts";
import { monitorSignalProvider } from "../../signal/index.ts";
import { probeSignal } from "../../signal/probe.ts";
import { sendMessageSignal } from "../../signal/send.ts";
import {
  listSlackDirectoryGroupsLive,
  listSlackDirectoryPeersLive,
} from "../../slack/directory-live.ts";
import { monitorSlackProvider } from "../../slack/index.ts";
import { probeSlack } from "../../slack/probe.ts";
import { resolveSlackChannelAllowlist } from "../../slack/resolve-channels.ts";
import { resolveSlackUserAllowlist } from "../../slack/resolve-users.ts";
import { sendMessageSlack } from "../../slack/send.ts";
import {
  auditTelegramGroupMembership,
  collectTelegramUnmentionedGroupIds,
} from "../../telegram/audit.ts";
import { monitorTelegramProvider } from "../../telegram/monitor.ts";
import { probeTelegram } from "../../telegram/probe.ts";
import { sendMessageTelegram, sendPollTelegram } from "../../telegram/send.ts";
import { resolveTelegramToken } from "../../telegram/token.ts";
import { textToSpeechTelephony } from "../../tts/tts.ts";
import { getActiveWebListener } from "../../web/active-listener.ts";
import {
  getWebAuthAgeMs,
  logoutWeb,
  logWebSelfId,
  readWebSelfId,
  webAuthExists,
} from "../../web/auth-store.ts";
import { loadWebMedia } from "../../web/media.ts";
import { formatNativeDependencyHint } from "./native-deps.ts";
import type { PluginRuntime } from "./types.ts";

let cachedVersion: string | null = null;

function resolveVersion(): string {
  if (cachedVersion) {
    return cachedVersion;
  }
  try {
    const require = createRequire(import.meta.url);
    const pkg = require("../../../package.json") as { version?: string };
    cachedVersion = pkg.version ?? "unknown";
    return cachedVersion;
  } catch {
    cachedVersion = "unknown";
    return cachedVersion;
  }
}

const sendMessageWhatsAppLazy: PluginRuntime["channel"]["whatsapp"]["sendMessageWhatsApp"] = async (
  ...args
) => {
  const { sendMessageWhatsApp } = await loadWebOutbound();
  return sendMessageWhatsApp(...args);
};

const sendPollWhatsAppLazy: PluginRuntime["channel"]["whatsapp"]["sendPollWhatsApp"] = async (
  ...args
) => {
  const { sendPollWhatsApp } = await loadWebOutbound();
  return sendPollWhatsApp(...args);
};

const loginWebLazy: PluginRuntime["channel"]["whatsapp"]["loginWeb"] = async (...args) => {
  const { loginWeb } = await loadWebLogin();
  return loginWeb(...args);
};

const startWebLoginWithQrLazy: PluginRuntime["channel"]["whatsapp"]["startWebLoginWithQr"] = async (
  ...args
) => {
  const { startWebLoginWithQr } = await loadWebLoginQr();
  return startWebLoginWithQr(...args);
};

const waitForWebLoginLazy: PluginRuntime["channel"]["whatsapp"]["waitForWebLogin"] = async (
  ...args
) => {
  const { waitForWebLogin } = await loadWebLoginQr();
  return waitForWebLogin(...args);
};

const monitorWebChannelLazy: PluginRuntime["channel"]["whatsapp"]["monitorWebChannel"] = async (
  ...args
) => {
  const { monitorWebChannel } = await loadWebChannel();
  return monitorWebChannel(...args);
};

const handleWhatsAppActionLazy: PluginRuntime["channel"]["whatsapp"]["handleWhatsAppAction"] =
  async (...args) => {
    const { handleWhatsAppAction } = await loadWhatsAppActions();
    return handleWhatsAppAction(...args);
  };

let webOutboundPromise: Promise<typeof import("../../web/outbound.ts")> | null = null;
let webLoginPromise: Promise<typeof import("../../web/login.ts")> | null = null;
let webLoginQrPromise: Promise<typeof import("../../web/login-qr.ts")> | null = null;
let webChannelPromise: Promise<typeof import("../../channels/web/index.ts")> | null = null;
let whatsappActionsPromise: Promise<
  typeof import("../../agents/tools/whatsapp-actions.ts")
> | null = null;

function loadWebOutbound() {
  webOutboundPromise ??= import("../../web/outbound.ts");
  return webOutboundPromise;
}

function loadWebLogin() {
  webLoginPromise ??= import("../../web/login.ts");
  return webLoginPromise;
}

function loadWebLoginQr() {
  webLoginQrPromise ??= import("../../web/login-qr.ts");
  return webLoginQrPromise;
}

function loadWebChannel() {
  webChannelPromise ??= import("../../channels/web/index.ts");
  return webChannelPromise;
}

function loadWhatsAppActions() {
  whatsappActionsPromise ??= import("../../agents/tools/whatsapp-actions.ts");
  return whatsappActionsPromise;
}

export function createPluginRuntime(): PluginRuntime {
  return {
    version: resolveVersion(),
    config: createRuntimeConfig(),
    system: createRuntimeSystem(),
    media: createRuntimeMedia(),
    tts: { textToSpeechTelephony },
    tools: createRuntimeTools(),
    channel: createRuntimeChannel(),
    logging: createRuntimeLogging(),
    state: { resolveStateDir },
  };
}

function createRuntimeConfig(): PluginRuntime["config"] {
  return {
    loadConfig,
    writeConfigFile,
  };
}

function createRuntimeSystem(): PluginRuntime["system"] {
  return {
    enqueueSystemEvent,
    runCommandWithTimeout,
    formatNativeDependencyHint,
  };
}

function createRuntimeMedia(): PluginRuntime["media"] {
  return {
    loadWebMedia,
    detectMime,
    mediaKindFromMime,
    isVoiceCompatibleAudio,
    getImageMetadata,
    resizeToJpeg,
  };
}

function createRuntimeTools(): PluginRuntime["tools"] {
  return {
    createMemoryGetTool,
    createMemorySearchTool,
    registerMemoryCli,
  };
}

function createRuntimeChannel(): PluginRuntime["channel"] {
  return {
    text: {
      chunkByNewline,
      chunkMarkdownText,
      chunkMarkdownTextWithMode,
      chunkText,
      chunkTextWithMode,
      resolveChunkMode,
      resolveTextChunkLimit,
      hasControlCommand,
      resolveMarkdownTableMode,
      convertMarkdownTables,
    },
    reply: {
      dispatchReplyWithBufferedBlockDispatcher,
      createReplyDispatcherWithTyping,
      resolveEffectiveMessagesConfig,
      resolveHumanDelayConfig,
      dispatchReplyFromConfig,
      finalizeInboundContext,
      formatAgentEnvelope,
      /** @deprecated Prefer `BodyForAgent` + structured user-context blocks (do not build plaintext envelopes for prompts). */
      formatInboundEnvelope,
      resolveEnvelopeFormatOptions,
    },
    routing: {
      resolveAgentRoute,
    },
    pairing: {
      buildPairingReply,
      readAllowFromStore: readChannelAllowFromStore,
      upsertPairingRequest: upsertChannelPairingRequest,
    },
    media: {
      fetchRemoteMedia,
      saveMediaBuffer,
    },
    activity: {
      record: recordChannelActivity,
      get: getChannelActivity,
    },
    session: {
      resolveStorePath,
      readSessionUpdatedAt,
      recordSessionMetaFromInbound,
      recordInboundSession,
      updateLastRoute,
    },
    mentions: {
      buildMentionRegexes,
      matchesMentionPatterns,
      matchesMentionWithExplicit,
    },
    reactions: {
      shouldAckReaction,
      removeAckReactionAfterReply,
    },
    groups: {
      resolveGroupPolicy: resolveChannelGroupPolicy,
      resolveRequireMention: resolveChannelGroupRequireMention,
    },
    debounce: {
      createInboundDebouncer,
      resolveInboundDebounceMs,
    },
    commands: {
      resolveCommandAuthorizedFromAuthorizers,
      isControlCommandMessage,
      shouldComputeCommandAuthorized,
      shouldHandleTextCommands,
    },
    discord: {
      messageActions: discordMessageActions,
      auditChannelPermissions: auditDiscordChannelPermissions,
      listDirectoryGroupsLive: listDiscordDirectoryGroupsLive,
      listDirectoryPeersLive: listDiscordDirectoryPeersLive,
      probeDiscord,
      resolveChannelAllowlist: resolveDiscordChannelAllowlist,
      resolveUserAllowlist: resolveDiscordUserAllowlist,
      sendMessageDiscord,
      sendPollDiscord,
      monitorDiscordProvider,
    },
    slack: {
      listDirectoryGroupsLive: listSlackDirectoryGroupsLive,
      listDirectoryPeersLive: listSlackDirectoryPeersLive,
      probeSlack,
      resolveChannelAllowlist: resolveSlackChannelAllowlist,
      resolveUserAllowlist: resolveSlackUserAllowlist,
      sendMessageSlack,
      monitorSlackProvider,
      handleSlackAction,
    },
    telegram: {
      auditGroupMembership: auditTelegramGroupMembership,
      collectUnmentionedGroupIds: collectTelegramUnmentionedGroupIds,
      probeTelegram,
      resolveTelegramToken,
      sendMessageTelegram,
      sendPollTelegram,
      monitorTelegramProvider,
      messageActions: telegramMessageActions,
    },
    signal: {
      probeSignal,
      sendMessageSignal,
      monitorSignalProvider,
      messageActions: signalMessageActions,
    },
    imessage: {
      monitorIMessageProvider,
      probeIMessage,
      sendMessageIMessage,
    },
    whatsapp: {
      getActiveWebListener,
      getWebAuthAgeMs,
      logoutWeb,
      logWebSelfId,
      readWebSelfId,
      webAuthExists,
      sendMessageWhatsApp: sendMessageWhatsAppLazy,
      sendPollWhatsApp: sendPollWhatsAppLazy,
      loginWeb: loginWebLazy,
      startWebLoginWithQr: startWebLoginWithQrLazy,
      waitForWebLogin: waitForWebLoginLazy,
      monitorWebChannel: monitorWebChannelLazy,
      handleWhatsAppAction: handleWhatsAppActionLazy,
      createLoginTool: createWhatsAppLoginTool,
    },
    line: {
      listLineAccountIds,
      resolveDefaultLineAccountId,
      resolveLineAccount,
      normalizeAccountId: normalizeLineAccountId,
      probeLineBot,
      sendMessageLine,
      pushMessageLine,
      pushMessagesLine,
      pushFlexMessage,
      pushTemplateMessage,
      pushLocationMessage,
      pushTextMessageWithQuickReplies,
      createQuickReplyItems,
      buildTemplateMessageFromPayload,
      monitorLineProvider,
    },
  };
}

function createRuntimeLogging(): PluginRuntime["logging"] {
  return {
    shouldLogVerbose,
    getChildLogger: (bindings, opts) => {
      const logger = getChildLogger(bindings, {
        level: opts?.level ? normalizeLogLevel(opts.level) : undefined,
      });
      return {
        debug: (message) => logger.debug?.(message),
        info: (message) => logger.info(message),
        warn: (message) => logger.warn(message),
        error: (message) => logger.error(message),
      };
    },
  };
}

export type { PluginRuntime } from "./types.ts";
