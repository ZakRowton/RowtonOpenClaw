import type { OutboundSendDeps } from "../../../infra/outbound/deliver.ts";
import { sendMessageSignal } from "../../../signal/send.ts";
import {
  createScopedChannelMediaMaxBytesResolver,
  createDirectTextMediaOutbound,
} from "./direct-text-media.ts";

function resolveSignalSender(deps: OutboundSendDeps | undefined) {
  return deps?.sendSignal ?? sendMessageSignal;
}

export const signalOutbound = createDirectTextMediaOutbound({
  channel: "signal",
  resolveSender: resolveSignalSender,
  resolveMaxBytes: createScopedChannelMediaMaxBytesResolver("signal"),
  buildTextOptions: ({ maxBytes, accountId }) => ({
    maxBytes,
    accountId: accountId ?? undefined,
  }),
  buildMediaOptions: ({ mediaUrl, maxBytes, accountId, mediaLocalRoots }) => ({
    mediaUrl,
    maxBytes,
    accountId: accountId ?? undefined,
    mediaLocalRoots,
  }),
});
