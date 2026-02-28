import type { CommandHandlerResult } from "../commands-types.ts";
import { buildSubagentsHelp, stopWithText } from "./shared.ts";

export function handleSubagentsHelpAction(): CommandHandlerResult {
  return stopWithText(buildSubagentsHelp());
}
