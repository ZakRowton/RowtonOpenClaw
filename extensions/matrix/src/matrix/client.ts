export type { MatrixAuth, MatrixResolvedConfig } from "./client/types.ts";
export { isBunRuntime } from "./client/runtime.ts";
export {
  resolveMatrixConfig,
  resolveMatrixConfigForAccount,
  resolveMatrixAuth,
} from "./client/config.ts";
export { createMatrixClient } from "./client/create-client.ts";
export {
  resolveSharedMatrixClient,
  waitForMatrixSync,
  stopSharedClient,
  stopSharedClientForAccount,
} from "./client/shared.ts";
