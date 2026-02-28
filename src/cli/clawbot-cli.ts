import type { Command } from "commander";
import { formatDocsLink } from "../terminal/links.ts";
import { theme } from "../terminal/theme.ts";
import { registerQrCli } from "./qr-cli.ts";

export function registerClawbotCli(program: Command) {
  const clawbot = program
    .command("clawbot")
    .description("Legacy clawbot command aliases")
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/clawbot", "docs.openclaw.ai/cli/clawbot")}\n`,
    );
  registerQrCli(clawbot);
}
