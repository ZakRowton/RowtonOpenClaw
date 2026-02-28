import { deriveSessionTotalTokens, type NormalizedUsage } from "../../agents/usage.ts";
import { incrementCompactionCount } from "./session-updates.ts";
import { persistSessionUsageUpdate } from "./session-usage.ts";

type PersistRunSessionUsageParams = Parameters<typeof persistSessionUsageUpdate>[0];

type IncrementRunCompactionCountParams = Omit<
  Parameters<typeof incrementCompactionCount>[0],
  "tokensAfter"
> & {
  lastCallUsage?: NormalizedUsage;
  contextTokensUsed?: number;
};

export async function persistRunSessionUsage(params: PersistRunSessionUsageParams): Promise<void> {
  await persistSessionUsageUpdate(params);
}

export async function incrementRunCompactionCount(
  params: IncrementRunCompactionCountParams,
): Promise<number | undefined> {
  const tokensAfterCompaction = params.lastCallUsage
    ? deriveSessionTotalTokens({
        usage: params.lastCallUsage,
        contextTokens: params.contextTokensUsed,
      })
    : undefined;
  return incrementCompactionCount({
    sessionEntry: params.sessionEntry,
    sessionStore: params.sessionStore,
    sessionKey: params.sessionKey,
    storePath: params.storePath,
    tokensAfter: tokensAfterCompaction,
  });
}
