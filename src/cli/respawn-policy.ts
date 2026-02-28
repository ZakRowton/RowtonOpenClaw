import { hasHelpOrVersion } from "./argv.ts";

export function shouldSkipRespawnForArgv(argv: string[]): boolean {
  return hasHelpOrVersion(argv);
}
