import { vi } from "vitest";
import { createEmptyPluginRegistry, type PluginRegistry } from "../plugins/registry.ts";
import { setActivePluginRegistry } from "../plugins/runtime.ts";

export const registryState: { registry: PluginRegistry } = {
  registry: createEmptyPluginRegistry(),
};

export function setRegistry(registry: PluginRegistry) {
  registryState.registry = registry;
  setActivePluginRegistry(registry);
}

vi.mock("./server-plugins.js", async () => {
  const { setActivePluginRegistry } = await import("../plugins/runtime.ts");
  return {
    loadGatewayPlugins: (params: { baseMethods: string[] }) => {
      setActivePluginRegistry(registryState.registry);
      return {
        pluginRegistry: registryState.registry,
        gatewayMethods: params.baseMethods ?? [],
      };
    },
  };
});
