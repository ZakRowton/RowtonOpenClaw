import { stripInboundMetadata } from "../../../../src/auto-reply/reply/strip-inbound-meta.ts";
import { stripEnvelope } from "../../../../src/shared/chat-envelope.ts";
import { stripThinkingTags } from "../format.ts";

const textCache = new WeakMap<object, string | null>();
const thinkingCache = new WeakMap<object, string | null>();

/** Replace known proxy/container error HTML so we don't render it as assistant text. */
function replaceErrorPageHtml(text: string): string {
  const t = text.trim();
  if (!t) return text;
  if (/<\s*!?\s*DOCTYPE\s+html\s*>/i.test(t) && /Azure Container App\s*-\s*Unavailable/i.test(t)) {
    return "The gateway is unavailable (404). Check that the app is running and ingress is configured — see .deploy/README.md.";
  }
  if (/<\s*!?\s*DOCTYPE\s+html\s*>/i.test(t) && /\b404\b/i.test(t)) {
    return "The server returned a 404 error page. Check the gateway URL and that the backend is reachable.";
  }
  return text;
}

export function extractText(message: unknown): string | null {
  const m = message as Record<string, unknown>;
  const role = typeof m.role === "string" ? m.role : "";
  const shouldStripInboundMetadata = role.toLowerCase() === "user";
  const content = m.content;
  if (typeof content === "string") {
    let processed =
      role === "assistant"
        ? stripThinkingTags(content)
        : shouldStripInboundMetadata
          ? stripInboundMetadata(stripEnvelope(content))
          : stripEnvelope(content);
    if (role === "assistant") processed = replaceErrorPageHtml(processed);
    return processed;
  }
  if (Array.isArray(content)) {
    const parts = content
      .map((p) => {
        const item = p as Record<string, unknown>;
        if (item.type === "text" && typeof item.text === "string") {
          return item.text;
        }
        return null;
      })
      .filter((v): v is string => typeof v === "string");
    if (parts.length > 0) {
      const joined = parts.join("\n");
      let processed =
        role === "assistant"
          ? stripThinkingTags(joined)
          : shouldStripInboundMetadata
            ? stripInboundMetadata(stripEnvelope(joined))
            : stripEnvelope(joined);
      if (role === "assistant") processed = replaceErrorPageHtml(processed);
      return processed;
    }
  }
  if (typeof m.text === "string") {
    let processed =
      role === "assistant"
        ? stripThinkingTags(m.text)
        : shouldStripInboundMetadata
          ? stripInboundMetadata(stripEnvelope(m.text))
          : stripEnvelope(m.text);
    if (role === "assistant") processed = replaceErrorPageHtml(processed);
    return processed;
  }
  return null;
}

export function extractTextCached(message: unknown): string | null {
  if (!message || typeof message !== "object") {
    return extractText(message);
  }
  const obj = message;
  if (textCache.has(obj)) {
    return textCache.get(obj) ?? null;
  }
  const value = extractText(message);
  textCache.set(obj, value);
  return value;
}

export function extractThinking(message: unknown): string | null {
  const m = message as Record<string, unknown>;
  const content = m.content;
  const parts: string[] = [];
  if (Array.isArray(content)) {
    for (const p of content) {
      const item = p as Record<string, unknown>;
      if (item.type === "thinking" && typeof item.thinking === "string") {
        const cleaned = item.thinking.trim();
        if (cleaned) {
          parts.push(cleaned);
        }
      }
    }
  }
  if (parts.length > 0) {
    return parts.join("\n");
  }

  // Back-compat: older logs may still have <think> tags inside text blocks.
  const rawText = extractRawText(message);
  if (!rawText) {
    return null;
  }
  const matches = [
    ...rawText.matchAll(/<\s*think(?:ing)?\s*>([\s\S]*?)<\s*\/\s*think(?:ing)?\s*>/gi),
  ];
  const extracted = matches.map((m) => (m[1] ?? "").trim()).filter(Boolean);
  return extracted.length > 0 ? extracted.join("\n") : null;
}

export function extractThinkingCached(message: unknown): string | null {
  if (!message || typeof message !== "object") {
    return extractThinking(message);
  }
  const obj = message;
  if (thinkingCache.has(obj)) {
    return thinkingCache.get(obj) ?? null;
  }
  const value = extractThinking(message);
  thinkingCache.set(obj, value);
  return value;
}

export function extractRawText(message: unknown): string | null {
  const m = message as Record<string, unknown>;
  const content = m.content;
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    const parts = content
      .map((p) => {
        const item = p as Record<string, unknown>;
        if (item.type === "text" && typeof item.text === "string") {
          return item.text;
        }
        return null;
      })
      .filter((v): v is string => typeof v === "string");
    if (parts.length > 0) {
      return parts.join("\n");
    }
  }
  if (typeof m.text === "string") {
    return m.text;
  }
  return null;
}

export function formatReasoningMarkdown(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return "";
  }
  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `_${line}_`);
  return lines.length ? ["_Reasoning:_", ...lines].join("\n") : "";
}
