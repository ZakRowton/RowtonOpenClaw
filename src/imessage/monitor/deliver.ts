import { chunkTextWithMode, resolveChunkMode } from "../../auto-reply/chunk.ts";
import type { ReplyPayload } from "../../auto-reply/types.ts";
import { loadConfig } from "../../config/config.ts";
import { resolveMarkdownTableMode } from "../../config/markdown-tables.ts";
import { convertMarkdownTables } from "../../markdown/tables.ts";
import type { RuntimeEnv } from "../../runtime.ts";
import type { createIMessageRpcClient } from "../client.ts";
import { sendMessageIMessage } from "../send.ts";
import type { SentMessageCache } from "./echo-cache.ts";

export async function deliverReplies(params: {
  replies: ReplyPayload[];
  target: string;
  client: Awaited<ReturnType<typeof createIMessageRpcClient>>;
  accountId?: string;
  runtime: RuntimeEnv;
  maxBytes: number;
  textLimit: number;
  sentMessageCache?: Pick<SentMessageCache, "remember">;
}) {
  const { replies, target, client, runtime, maxBytes, textLimit, accountId, sentMessageCache } =
    params;
  const scope = `${accountId ?? ""}:${target}`;
  const cfg = loadConfig();
  const tableMode = resolveMarkdownTableMode({
    cfg,
    channel: "imessage",
    accountId,
  });
  const chunkMode = resolveChunkMode(cfg, "imessage", accountId);
  for (const payload of replies) {
    const mediaList = payload.mediaUrls ?? (payload.mediaUrl ? [payload.mediaUrl] : []);
    const rawText = payload.text ?? "";
    const text = convertMarkdownTables(rawText, tableMode);
    if (!text && mediaList.length === 0) {
      continue;
    }
    if (mediaList.length === 0) {
      sentMessageCache?.remember(scope, { text });
      for (const chunk of chunkTextWithMode(text, textLimit, chunkMode)) {
        const sent = await sendMessageIMessage(target, chunk, {
          maxBytes,
          client,
          accountId,
          replyToId: payload.replyToId,
        });
        sentMessageCache?.remember(scope, { text: chunk, messageId: sent.messageId });
      }
    } else {
      let first = true;
      for (const url of mediaList) {
        const caption = first ? text : "";
        first = false;
        const sent = await sendMessageIMessage(target, caption, {
          mediaUrl: url,
          maxBytes,
          client,
          accountId,
          replyToId: payload.replyToId,
        });
        sentMessageCache?.remember(scope, {
          text: caption || undefined,
          messageId: sent.messageId,
        });
      }
    }
    runtime.log?.(`imessage: delivered reply to ${target}`);
  }
}
