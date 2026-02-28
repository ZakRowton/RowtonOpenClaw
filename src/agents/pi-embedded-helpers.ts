export {
  buildBootstrapContextFiles,
  DEFAULT_BOOTSTRAP_MAX_CHARS,
  DEFAULT_BOOTSTRAP_TOTAL_MAX_CHARS,
  ensureSessionHeader,
  resolveBootstrapMaxChars,
  resolveBootstrapTotalMaxChars,
  stripThoughtSignatures,
} from "./pi-embedded-helpers/bootstrap.ts";
export {
  BILLING_ERROR_USER_MESSAGE,
  formatBillingErrorMessage,
  classifyFailoverReason,
  formatRawAssistantErrorForUi,
  formatAssistantErrorText,
  getApiErrorPayloadFingerprint,
  isAuthAssistantError,
  isAuthErrorMessage,
  isModelNotFoundErrorMessage,
  isBillingAssistantError,
  parseApiErrorInfo,
  sanitizeUserFacingText,
  isBillingErrorMessage,
  isCloudflareOrHtmlErrorPage,
  isCloudCodeAssistFormatError,
  isCompactionFailureError,
  isContextOverflowError,
  isLikelyContextOverflowError,
  isFailoverAssistantError,
  isFailoverErrorMessage,
  isImageDimensionErrorMessage,
  isImageSizeError,
  isOverloadedErrorMessage,
  isRawApiErrorPayload,
  isRateLimitAssistantError,
  isRateLimitErrorMessage,
  isTransientHttpError,
  isTimeoutErrorMessage,
  parseImageDimensionError,
  parseImageSizeError,
} from "./pi-embedded-helpers/errors.ts";
export { isGoogleModelApi, sanitizeGoogleTurnOrdering } from "./pi-embedded-helpers/google.ts";

export { downgradeOpenAIReasoningBlocks } from "./pi-embedded-helpers/openai.ts";
export {
  isEmptyAssistantMessageContent,
  sanitizeSessionMessagesImages,
} from "./pi-embedded-helpers/images.ts";
export {
  isMessagingToolDuplicate,
  isMessagingToolDuplicateNormalized,
  normalizeTextForComparison,
} from "./pi-embedded-helpers/messaging-dedupe.ts";

export { pickFallbackThinkingLevel } from "./pi-embedded-helpers/thinking.ts";

export {
  mergeConsecutiveUserTurns,
  validateAnthropicTurns,
  validateGeminiTurns,
} from "./pi-embedded-helpers/turns.ts";
export type { EmbeddedContextFile, FailoverReason } from "./pi-embedded-helpers/types.ts";

export type { ToolCallIdMode } from "./tool-call-id.ts";
export { isValidCloudCodeAssistToolId, sanitizeToolCallId } from "./tool-call-id.ts";
