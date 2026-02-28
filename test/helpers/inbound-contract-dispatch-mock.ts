import { vi } from "vitest";
import { createInboundContextCapture } from "./inbound-contract-capture.ts";
import { buildDispatchInboundContextCapture } from "./inbound-contract-capture.ts";

export const inboundCtxCapture = createInboundContextCapture();

vi.mock("../../src/auto-reply/dispatch.js", async (importOriginal) => {
  return await buildDispatchInboundContextCapture(importOriginal, inboundCtxCapture);
});
