import type { Command } from "commander";
import {
  CONFIGURE_WIZARD_SECTIONS,
  configureCommandFromSectionsArg,
} from "../../commands/configure.ts";
import { defaultRuntime } from "../../runtime.ts";
import { formatDocsLink } from "../../terminal/links.ts";
import { theme } from "../../terminal/theme.ts";
import { runCommandWithRuntime } from "../cli-utils.ts";

export function registerConfigureCommand(program: Command) {
  program
    .command("configure")
    .description("Interactive setup wizard for credentials, channels, gateway, and agent defaults")
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/configure", "docs.openclaw.ai/cli/configure")}\n`,
    )
    .option(
      "--section <section>",
      `Configuration sections (repeatable). Options: ${CONFIGURE_WIZARD_SECTIONS.join(", ")}`,
      (value: string, previous: string[]) => [...previous, value],
      [] as string[],
    )
    .action(async (opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await configureCommandFromSectionsArg(opts.section, defaultRuntime);
      });
    });
}
