import { logConfigUpdated } from "../../config/logging.ts";
import { resolveAgentModelPrimaryValue } from "../../config/model-input.ts";
import type { RuntimeEnv } from "../../runtime.ts";
import { applyDefaultModelPrimaryUpdate, updateConfig } from "./shared.ts";

export async function modelsSetCommand(modelRaw: string, runtime: RuntimeEnv) {
  const updated = await updateConfig((cfg) => {
    return applyDefaultModelPrimaryUpdate({ cfg, modelRaw, field: "model" });
  });

  logConfigUpdated(runtime);
  runtime.log(
    `Default model: ${resolveAgentModelPrimaryValue(updated.agents?.defaults?.model) ?? modelRaw}`,
  );
}
