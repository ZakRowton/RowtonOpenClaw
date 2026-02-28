export type {
  ThreadBindingManager,
  ThreadBindingRecord,
  ThreadBindingTargetKind,
} from "./thread-bindings.types.ts";

export {
  formatThreadBindingTtlLabel,
  resolveThreadBindingIntroText,
  resolveThreadBindingThreadName,
} from "./thread-bindings.messages.ts";

export { isRecentlyUnboundThreadWebhookMessage } from "./thread-bindings.state.ts";

export {
  autoBindSpawnedDiscordSubagent,
  listThreadBindingsBySessionKey,
  listThreadBindingsForAccount,
  setThreadBindingTtlBySessionKey,
  unbindThreadBindingsBySessionKey,
} from "./thread-bindings.lifecycle.ts";

export {
  __testing,
  createNoopThreadBindingManager,
  createThreadBindingManager,
  getThreadBindingManager,
} from "./thread-bindings.manager.ts";
