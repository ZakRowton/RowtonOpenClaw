import type { RuntimeEnv } from "../runtime.ts";
import { defaultRuntime } from "../runtime.ts";
import { restoreTerminalState } from "../terminal/restore.ts";
import { createClackPrompter } from "../wizard/clack-prompter.ts";
import { runOnboardingWizard } from "../wizard/onboarding.ts";
import { WizardCancelledError } from "../wizard/prompts.ts";
import type { OnboardOptions } from "./onboard-types.ts";

export async function runInteractiveOnboarding(
  opts: OnboardOptions,
  runtime: RuntimeEnv = defaultRuntime,
) {
  const prompter = createClackPrompter();
  let exitCode: number | null = null;
  try {
    await runOnboardingWizard(opts, runtime, prompter);
  } catch (err) {
    if (err instanceof WizardCancelledError) {
      // Best practice: cancellation is not a successful completion.
      exitCode = 1;
      return;
    }
    throw err;
  } finally {
    // Keep stdin paused so non-daemon runs can exit cleanly (e.g. Docker setup).
    restoreTerminalState("onboarding finish", { resumeStdinIfPaused: false });
    if (exitCode !== null) {
      runtime.exit(exitCode);
    }
  }
}
