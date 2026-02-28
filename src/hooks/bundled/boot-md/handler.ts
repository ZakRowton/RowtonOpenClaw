import { listAgentIds, resolveAgentWorkspaceDir } from "../../../agents/agent-scope.ts";
import { createDefaultDeps } from "../../../cli/deps.ts";
import { runBootOnce } from "../../../gateway/boot.ts";
import { createSubsystemLogger } from "../../../logging/subsystem.ts";
import type { HookHandler } from "../../hooks.ts";
import { isGatewayStartupEvent } from "../../internal-hooks.ts";

const log = createSubsystemLogger("hooks/boot-md");

const runBootChecklist: HookHandler = async (event) => {
  if (!isGatewayStartupEvent(event)) {
    return;
  }

  if (!event.context.cfg) {
    return;
  }

  const cfg = event.context.cfg;
  const deps = event.context.deps ?? createDefaultDeps();
  const agentIds = listAgentIds(cfg);

  for (const agentId of agentIds) {
    const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
    const result = await runBootOnce({ cfg, deps, workspaceDir, agentId });
    if (result.status === "failed") {
      log.warn("boot-md failed for agent startup run", {
        agentId,
        workspaceDir,
        reason: result.reason,
      });
      continue;
    }
    if (result.status === "skipped") {
      log.debug("boot-md skipped for agent startup run", {
        agentId,
        workspaceDir,
        reason: result.reason,
      });
    }
  }
};

export default runBootChecklist;
