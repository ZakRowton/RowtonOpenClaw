import { vi } from "vitest";

vi.mock("./accounts.js", async () => {
  const { createBlueBubblesAccountsMockModule } = await import("./test-harness.ts");
  return createBlueBubblesAccountsMockModule();
});

vi.mock("./probe.js", async () => {
  const { createBlueBubblesProbeMockModule } = await import("./test-harness.ts");
  return createBlueBubblesProbeMockModule();
});
