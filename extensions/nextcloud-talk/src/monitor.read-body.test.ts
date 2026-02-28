import { describe, expect, it } from "vitest";
import { createMockIncomingRequest } from "../../../test/helpers/mock-incoming-request.ts";
import { readNextcloudTalkWebhookBody } from "./monitor.ts";

describe("readNextcloudTalkWebhookBody", () => {
  it("reads valid body within max bytes", async () => {
    const req = createMockIncomingRequest(['{"type":"Create"}']);
    const body = await readNextcloudTalkWebhookBody(req, 1024);
    expect(body).toBe('{"type":"Create"}');
  });

  it("rejects when payload exceeds max bytes", async () => {
    const req = createMockIncomingRequest(["x".repeat(300)]);
    await expect(readNextcloudTalkWebhookBody(req, 128)).rejects.toThrow("PayloadTooLarge");
  });
});
