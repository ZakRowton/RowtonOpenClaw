import { createSubsystemLogger } from "../logging/subsystem.ts";
import { loadOpenClawPlugins, type PluginLoadOptions } from "./loader.ts";
import { createPluginLoaderLogger } from "./logger.ts";
import type { ProviderPlugin } from "./types.ts";

const log = createSubsystemLogger("plugins");

export function resolvePluginProviders(params: {
  config?: PluginLoadOptions["config"];
  workspaceDir?: string;
}): ProviderPlugin[] {
  const registry = loadOpenClawPlugins({
    config: params.config,
    workspaceDir: params.workspaceDir,
    logger: createPluginLoaderLogger(log),
  });

  return registry.providers.map((entry) => entry.provider);
}
