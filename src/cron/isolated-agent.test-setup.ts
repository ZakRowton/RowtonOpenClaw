import { vi } from "vitest";
import { loadModelCatalog } from "../agents/model-catalog.ts";
import { runEmbeddedPiAgent } from "../agents/pi-embedded.ts";
import { runSubagentAnnounceFlow } from "../agents/subagent-announce.ts";
import { telegramOutbound } from "../channels/plugins/outbound/telegram.ts";
import { setActivePluginRegistry } from "../plugins/runtime.ts";
import { createOutboundTestPlugin, createTestRegistry } from "../test-utils/channel-plugins.ts";

export function setupIsolatedAgentTurnMocks(params?: { fast?: boolean }): void {
  if (params?.fast) {
    vi.stubEnv("OPENCLAW_TEST_FAST", "1");
  }
  vi.mocked(runEmbeddedPiAgent).mockReset();
  vi.mocked(loadModelCatalog).mockResolvedValue([]);
  vi.mocked(runSubagentAnnounceFlow).mockReset().mockResolvedValue(true);
  setActivePluginRegistry(
    createTestRegistry([
      {
        pluginId: "telegram",
        plugin: createOutboundTestPlugin({ id: "telegram", outbound: telegramOutbound }),
        source: "test",
      },
    ]),
  );
}
