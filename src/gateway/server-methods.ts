import { formatControlPlaneActor, resolveControlPlaneActor } from "./control-plane-audit.ts";
import { consumeControlPlaneWriteBudget } from "./control-plane-rate-limit.ts";
import { ADMIN_SCOPE, authorizeOperatorScopesForMethod } from "./method-scopes.ts";
import { ErrorCodes, errorShape } from "./protocol/index.ts";
import { isRoleAuthorizedForMethod, parseGatewayRole } from "./role-policy.ts";
import { agentHandlers } from "./server-methods/agent.ts";
import { agentsHandlers } from "./server-methods/agents.ts";
import { browserHandlers } from "./server-methods/browser.ts";
import { channelsHandlers } from "./server-methods/channels.ts";
import { chatHandlers } from "./server-methods/chat.ts";
import { configHandlers } from "./server-methods/config.ts";
import { connectHandlers } from "./server-methods/connect.ts";
import { cronHandlers } from "./server-methods/cron.ts";
import { deviceHandlers } from "./server-methods/devices.ts";
import { doctorHandlers } from "./server-methods/doctor.ts";
import { execApprovalsHandlers } from "./server-methods/exec-approvals.ts";
import { healthHandlers } from "./server-methods/health.ts";
import { logsHandlers } from "./server-methods/logs.ts";
import { modelsHandlers } from "./server-methods/models.ts";
import { nodeHandlers } from "./server-methods/nodes.ts";
import { pushHandlers } from "./server-methods/push.ts";
import { sendHandlers } from "./server-methods/send.ts";
import { sessionsHandlers } from "./server-methods/sessions.ts";
import { skillsHandlers } from "./server-methods/skills.ts";
import { systemHandlers } from "./server-methods/system.ts";
import { talkHandlers } from "./server-methods/talk.ts";
import { toolsCatalogHandlers } from "./server-methods/tools-catalog.ts";
import { ttsHandlers } from "./server-methods/tts.ts";
import type { GatewayRequestHandlers, GatewayRequestOptions } from "./server-methods/types.ts";
import { updateHandlers } from "./server-methods/update.ts";
import { usageHandlers } from "./server-methods/usage.ts";
import { voicewakeHandlers } from "./server-methods/voicewake.ts";
import { webHandlers } from "./server-methods/web.ts";
import { wizardHandlers } from "./server-methods/wizard.ts";

const CONTROL_PLANE_WRITE_METHODS = new Set(["config.apply", "config.patch", "update.run"]);
function authorizeGatewayMethod(method: string, client: GatewayRequestOptions["client"]) {
  if (!client?.connect) {
    return null;
  }
  if (method === "health") {
    return null;
  }
  const roleRaw = client.connect.role ?? "operator";
  const role = parseGatewayRole(roleRaw);
  if (!role) {
    return errorShape(ErrorCodes.INVALID_REQUEST, `unauthorized role: ${roleRaw}`);
  }
  const scopes = client.connect.scopes ?? [];
  if (!isRoleAuthorizedForMethod(role, method)) {
    return errorShape(ErrorCodes.INVALID_REQUEST, `unauthorized role: ${role}`);
  }
  if (role === "node") {
    return null;
  }
  if (scopes.includes(ADMIN_SCOPE)) {
    return null;
  }
  const scopeAuth = authorizeOperatorScopesForMethod(method, scopes);
  if (!scopeAuth.allowed) {
    return errorShape(ErrorCodes.INVALID_REQUEST, `missing scope: ${scopeAuth.missingScope}`);
  }
  return null;
}

export const coreGatewayHandlers: GatewayRequestHandlers = {
  ...connectHandlers,
  ...logsHandlers,
  ...voicewakeHandlers,
  ...healthHandlers,
  ...channelsHandlers,
  ...chatHandlers,
  ...cronHandlers,
  ...deviceHandlers,
  ...doctorHandlers,
  ...execApprovalsHandlers,
  ...webHandlers,
  ...modelsHandlers,
  ...configHandlers,
  ...wizardHandlers,
  ...talkHandlers,
  ...toolsCatalogHandlers,
  ...ttsHandlers,
  ...skillsHandlers,
  ...sessionsHandlers,
  ...systemHandlers,
  ...updateHandlers,
  ...nodeHandlers,
  ...pushHandlers,
  ...sendHandlers,
  ...usageHandlers,
  ...agentHandlers,
  ...agentsHandlers,
  ...browserHandlers,
};

export async function handleGatewayRequest(
  opts: GatewayRequestOptions & { extraHandlers?: GatewayRequestHandlers },
): Promise<void> {
  const { req, respond, client, isWebchatConnect, context } = opts;
  const authError = authorizeGatewayMethod(req.method, client);
  if (authError) {
    respond(false, undefined, authError);
    return;
  }
  if (CONTROL_PLANE_WRITE_METHODS.has(req.method)) {
    const budget = consumeControlPlaneWriteBudget({ client });
    if (!budget.allowed) {
      const actor = resolveControlPlaneActor(client);
      context.logGateway.warn(
        `control-plane write rate-limited method=${req.method} ${formatControlPlaneActor(actor)} retryAfterMs=${budget.retryAfterMs} key=${budget.key}`,
      );
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.UNAVAILABLE,
          `rate limit exceeded for ${req.method}; retry after ${Math.ceil(budget.retryAfterMs / 1000)}s`,
          {
            retryable: true,
            retryAfterMs: budget.retryAfterMs,
            details: {
              method: req.method,
              limit: "3 per 60s",
            },
          },
        ),
      );
      return;
    }
  }
  const handler = opts.extraHandlers?.[req.method] ?? coreGatewayHandlers[req.method];
  if (!handler) {
    respond(
      false,
      undefined,
      errorShape(ErrorCodes.INVALID_REQUEST, `unknown method: ${req.method}`),
    );
    return;
  }
  await handler({
    req,
    params: (req.params ?? {}) as Record<string, unknown>,
    client,
    isWebchatConnect,
    respond,
    context,
  });
}
