import { normalizeAccountId } from "openclaw/plugin-sdk/account-id";
import { getMatrixRuntime } from "../../runtime.ts";
import type { CoreConfig } from "../../types.ts";
import { getActiveMatrixClient } from "../active-client.ts";
import { createPreparedMatrixClient } from "../client-bootstrap.ts";
import { isBunRuntime, resolveMatrixAuth, resolveSharedMatrixClient } from "../client.ts";
import type { MatrixActionClient, MatrixActionClientOpts } from "./types.ts";

export function ensureNodeRuntime() {
  if (isBunRuntime()) {
    throw new Error("Matrix support requires Node (bun runtime not supported)");
  }
}

export async function resolveActionClient(
  opts: MatrixActionClientOpts = {},
): Promise<MatrixActionClient> {
  ensureNodeRuntime();
  if (opts.client) {
    return { client: opts.client, stopOnDone: false };
  }
  // Normalize accountId early to ensure consistent keying across all lookups
  const accountId = normalizeAccountId(opts.accountId);
  const active = getActiveMatrixClient(accountId);
  if (active) {
    return { client: active, stopOnDone: false };
  }
  const shouldShareClient = Boolean(process.env.OPENCLAW_GATEWAY_PORT);
  if (shouldShareClient) {
    const client = await resolveSharedMatrixClient({
      cfg: getMatrixRuntime().config.loadConfig() as CoreConfig,
      timeoutMs: opts.timeoutMs,
      accountId,
    });
    return { client, stopOnDone: false };
  }
  const auth = await resolveMatrixAuth({
    cfg: getMatrixRuntime().config.loadConfig() as CoreConfig,
    accountId,
  });
  const client = await createPreparedMatrixClient({
    auth,
    timeoutMs: opts.timeoutMs,
    accountId,
  });
  return { client, stopOnDone: true };
}
