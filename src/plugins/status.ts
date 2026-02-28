import { resolveAgentWorkspaceDir, resolveDefaultAgentId } from "../agents/agent-scope.ts";
import { resolveDefaultAgentWorkspaceDir } from "../agents/workspace.ts";
import { loadConfig } from "../config/config.ts";
import { createSubsystemLogger } from "../logging/subsystem.ts";
import { loadOpenClawPlugins } from "./loader.ts";
import { createPluginLoaderLogger } from "./logger.ts";
import type { PluginRegistry } from "./registry.ts";

export type PluginStatusReport = PluginRegistry & {
  workspaceDir?: string;
};

const log = createSubsystemLogger("plugins");

export function buildPluginStatusReport(params?: {
  config?: ReturnType<typeof loadConfig>;
  workspaceDir?: string;
}): PluginStatusReport {
  const config = params?.config ?? loadConfig();
  const workspaceDir = params?.workspaceDir
    ? params.workspaceDir
    : (resolveAgentWorkspaceDir(config, resolveDefaultAgentId(config)) ??
      resolveDefaultAgentWorkspaceDir());

  const registry = loadOpenClawPlugins({
    config,
    workspaceDir,
    logger: createPluginLoaderLogger(log),
  });

  return {
    workspaceDir,
    ...registry,
  };
}
