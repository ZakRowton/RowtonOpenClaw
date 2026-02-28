import type { OpenClawConfig } from "../config/config.ts";
import type { RuntimeEnv } from "../runtime.ts";
import { requireValidConfigSnapshot } from "./config-validation.ts";

export function createQuietRuntime(runtime: RuntimeEnv): RuntimeEnv {
  return { ...runtime, log: () => {} };
}

export async function requireValidConfig(runtime: RuntimeEnv): Promise<OpenClawConfig | null> {
  return await requireValidConfigSnapshot(runtime);
}
