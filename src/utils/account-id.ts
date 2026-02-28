import { normalizeOptionalAccountId } from "../routing/account-id.ts";

export function normalizeAccountId(value?: string): string | undefined {
  return normalizeOptionalAccountId(value);
}
