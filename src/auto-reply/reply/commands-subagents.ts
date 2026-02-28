import { listSubagentRunsForRequester } from "../../agents/subagent-registry.ts";
import { logVerbose } from "../../globals.ts";
import { handleSubagentsAgentsAction } from "./commands-subagents/action-agents.ts";
import { handleSubagentsFocusAction } from "./commands-subagents/action-focus.ts";
import { handleSubagentsHelpAction } from "./commands-subagents/action-help.ts";
import { handleSubagentsInfoAction } from "./commands-subagents/action-info.ts";
import { handleSubagentsKillAction } from "./commands-subagents/action-kill.ts";
import { handleSubagentsListAction } from "./commands-subagents/action-list.ts";
import { handleSubagentsLogAction } from "./commands-subagents/action-log.ts";
import { handleSubagentsSendAction } from "./commands-subagents/action-send.ts";
import { handleSubagentsSpawnAction } from "./commands-subagents/action-spawn.ts";
import { handleSubagentsUnfocusAction } from "./commands-subagents/action-unfocus.ts";
import {
  type SubagentsCommandContext,
  extractMessageText,
  resolveHandledPrefix,
  resolveRequesterSessionKey,
  resolveSubagentsAction,
  stopWithText,
} from "./commands-subagents/shared.ts";
import type { CommandHandler } from "./commands-types.ts";

export { extractMessageText };

export const handleSubagentsCommand: CommandHandler = async (params, allowTextCommands) => {
  if (!allowTextCommands) {
    return null;
  }

  const normalized = params.command.commandBodyNormalized;
  const handledPrefix = resolveHandledPrefix(normalized);
  if (!handledPrefix) {
    return null;
  }

  if (!params.command.isAuthorizedSender) {
    logVerbose(
      `Ignoring ${handledPrefix} from unauthorized sender: ${params.command.senderId || "<unknown>"}`,
    );
    return { shouldContinue: false };
  }

  const rest = normalized.slice(handledPrefix.length).trim();
  const restTokens = rest.split(/\s+/).filter(Boolean);
  const action = resolveSubagentsAction({ handledPrefix, restTokens });
  if (!action) {
    return handleSubagentsHelpAction();
  }

  const requesterKey = resolveRequesterSessionKey(params, {
    preferCommandTarget: action === "spawn",
  });
  if (!requesterKey) {
    return stopWithText("⚠️ Missing session key.");
  }

  const ctx: SubagentsCommandContext = {
    params,
    handledPrefix,
    requesterKey,
    runs: listSubagentRunsForRequester(requesterKey),
    restTokens,
  };

  switch (action) {
    case "help":
      return handleSubagentsHelpAction();
    case "agents":
      return handleSubagentsAgentsAction(ctx);
    case "focus":
      return await handleSubagentsFocusAction(ctx);
    case "unfocus":
      return handleSubagentsUnfocusAction(ctx);
    case "list":
      return handleSubagentsListAction(ctx);
    case "kill":
      return await handleSubagentsKillAction(ctx);
    case "info":
      return handleSubagentsInfoAction(ctx);
    case "log":
      return await handleSubagentsLogAction(ctx);
    case "send":
      return await handleSubagentsSendAction(ctx, false);
    case "steer":
      return await handleSubagentsSendAction(ctx, true);
    case "spawn":
      return await handleSubagentsSpawnAction(ctx);
    default:
      return handleSubagentsHelpAction();
  }
};
