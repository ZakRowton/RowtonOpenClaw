import { getPairingAdapter } from "../channels/plugins/pairing.ts";
import type { PairingChannel } from "./pairing-store.ts";

export function resolvePairingIdLabel(channel: PairingChannel): string {
  return getPairingAdapter(channel)?.idLabel ?? "userId";
}
