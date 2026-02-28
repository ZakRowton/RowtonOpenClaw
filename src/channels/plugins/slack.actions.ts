import { handleSlackAction, type SlackActionContext } from "../../agents/tools/slack-actions.ts";
import { handleSlackMessageAction } from "../../plugin-sdk/slack-message-actions.ts";
import { extractSlackToolSend, listSlackMessageActions } from "../../slack/message-actions.ts";
import { resolveSlackChannelId } from "../../slack/targets.ts";
import type { ChannelMessageActionAdapter } from "./types.ts";

export function createSlackActions(providerId: string): ChannelMessageActionAdapter {
  return {
    listActions: ({ cfg }) => listSlackMessageActions(cfg),
    extractToolSend: ({ args }) => extractSlackToolSend(args),
    handleAction: async (ctx) => {
      return await handleSlackMessageAction({
        providerId,
        ctx,
        normalizeChannelId: resolveSlackChannelId,
        includeReadThreadId: true,
        invoke: async (action, cfg, toolContext) =>
          await handleSlackAction(action, cfg, toolContext as SlackActionContext | undefined),
      });
    },
  };
}
