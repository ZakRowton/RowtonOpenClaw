import { createNonExitingRuntime, type RuntimeEnv } from "../../runtime.ts";
import { normalizeStringEntries } from "../../shared/string-normalization.ts";
import type { MonitorIMessageOpts } from "./types.ts";

export function resolveRuntime(opts: MonitorIMessageOpts): RuntimeEnv {
  return opts.runtime ?? createNonExitingRuntime();
}

export function normalizeAllowList(list?: Array<string | number>) {
  return normalizeStringEntries(list);
}
