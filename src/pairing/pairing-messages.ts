import { formatCliCommand } from "../cli/command-format.ts";
import type { PairingChannel } from "./pairing-store.ts";

export function buildPairingReply(params: {
  channel: PairingChannel;
  idLine: string;
  code: string;
}): string {
  const { channel, idLine, code } = params;
  return [
    "OpenClaw: access not configured.",
    "",
    idLine,
    "",
    `Pairing code: ${code}`,
    "",
    "Ask the bot owner to approve with:",
    formatCliCommand(`openclaw pairing approve ${channel} ${code}`),
  ].join("\n");
}
