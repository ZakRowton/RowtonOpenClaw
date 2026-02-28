export {
  downloadMSTeamsAttachments,
  /** @deprecated Use `downloadMSTeamsAttachments` instead. */
  downloadMSTeamsImageAttachments,
} from "./attachments/download.ts";
export { buildMSTeamsGraphMessageUrls, downloadMSTeamsGraphMedia } from "./attachments/graph.ts";
export {
  buildMSTeamsAttachmentPlaceholder,
  summarizeMSTeamsHtmlAttachments,
} from "./attachments/html.ts";
export { buildMSTeamsMediaPayload } from "./attachments/payload.ts";
export type {
  MSTeamsAccessTokenProvider,
  MSTeamsAttachmentLike,
  MSTeamsGraphMediaResult,
  MSTeamsHtmlAttachmentSummary,
  MSTeamsInboundMedia,
} from "./attachments/types.ts";
