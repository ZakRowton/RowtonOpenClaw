import path from "node:path";
import { safePathSegmentHashed } from "../../infra/install-safe-path.ts";
import { resolveConfigDir } from "../../utils.ts";
import { resolveSkillKey } from "./frontmatter.ts";
import type { SkillEntry } from "./types.ts";

export function resolveSkillToolsRootDir(entry: SkillEntry): string {
  const key = resolveSkillKey(entry.skill, entry);
  const safeKey = safePathSegmentHashed(key);
  return path.join(resolveConfigDir(), "tools", safeKey);
}
