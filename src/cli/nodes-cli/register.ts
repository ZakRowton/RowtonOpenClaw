import type { Command } from "commander";
import { formatDocsLink } from "../../terminal/links.ts";
import { theme } from "../../terminal/theme.ts";
import { formatHelpExamples } from "../help-format.ts";
import { registerNodesCameraCommands } from "./register.camera.ts";
import { registerNodesCanvasCommands } from "./register.canvas.ts";
import { registerNodesInvokeCommands } from "./register.invoke.ts";
import { registerNodesLocationCommands } from "./register.location.ts";
import { registerNodesNotifyCommand } from "./register.notify.ts";
import { registerNodesPairingCommands } from "./register.pairing.ts";
import { registerNodesPushCommand } from "./register.push.ts";
import { registerNodesScreenCommands } from "./register.screen.ts";
import { registerNodesStatusCommands } from "./register.status.ts";

export function registerNodesCli(program: Command) {
  const nodes = program
    .command("nodes")
    .description("Manage gateway-owned nodes (pairing, status, invoke, and media)")
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n${formatHelpExamples([
          ["openclaw nodes status", "List known nodes with live status."],
          ["openclaw nodes pairing pending", "Show pending node pairing requests."],
          ['openclaw nodes run --node <id> --raw "uname -a"', "Run a shell command on a node."],
          ["openclaw nodes camera snap --node <id>", "Capture a photo from a node camera."],
        ])}\n\n${theme.muted("Docs:")} ${formatDocsLink("/cli/nodes", "docs.openclaw.ai/cli/nodes")}\n`,
    );

  registerNodesStatusCommands(nodes);
  registerNodesPairingCommands(nodes);
  registerNodesInvokeCommands(nodes);
  registerNodesNotifyCommand(nodes);
  registerNodesPushCommand(nodes);
  registerNodesCanvasCommands(nodes);
  registerNodesCameraCommands(nodes);
  registerNodesScreenCommands(nodes);
  registerNodesLocationCommands(nodes);
}
