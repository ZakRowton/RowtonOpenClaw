import type { OpenClawConfig } from "../../config/config.ts";
import type { MsgContext } from "../templating.ts";
import { buildCommandTestParams as buildBaseCommandTestParams } from "./commands.test-harness.ts";

export function buildCommandTestParams(
  commandBody: string,
  cfg: OpenClawConfig,
  ctxOverrides?: Partial<MsgContext>,
) {
  return buildBaseCommandTestParams(commandBody, cfg, ctxOverrides);
}
