import type { sendMessageWhatsApp } from "../channels/web/index.ts";
import type { sendMessageDiscord } from "../discord/send.ts";
import type { sendMessageIMessage } from "../imessage/send.ts";
import type { OutboundSendDeps } from "../infra/outbound/deliver.ts";
import type { sendMessageSignal } from "../signal/send.ts";
import type { sendMessageSlack } from "../slack/send.ts";
import type { sendMessageTelegram } from "../telegram/send.ts";
import { createOutboundSendDepsFromCliSource } from "./outbound-send-mapping.ts";

export type CliDeps = {
  sendMessageWhatsApp: typeof sendMessageWhatsApp;
  sendMessageTelegram: typeof sendMessageTelegram;
  sendMessageDiscord: typeof sendMessageDiscord;
  sendMessageSlack: typeof sendMessageSlack;
  sendMessageSignal: typeof sendMessageSignal;
  sendMessageIMessage: typeof sendMessageIMessage;
};

export function createDefaultDeps(): CliDeps {
  return {
    sendMessageWhatsApp: async (...args) => {
      const { sendMessageWhatsApp } = await import("../channels/web/index.ts");
      return await sendMessageWhatsApp(...args);
    },
    sendMessageTelegram: async (...args) => {
      const { sendMessageTelegram } = await import("../telegram/send.ts");
      return await sendMessageTelegram(...args);
    },
    sendMessageDiscord: async (...args) => {
      const { sendMessageDiscord } = await import("../discord/send.ts");
      return await sendMessageDiscord(...args);
    },
    sendMessageSlack: async (...args) => {
      const { sendMessageSlack } = await import("../slack/send.ts");
      return await sendMessageSlack(...args);
    },
    sendMessageSignal: async (...args) => {
      const { sendMessageSignal } = await import("../signal/send.ts");
      return await sendMessageSignal(...args);
    },
    sendMessageIMessage: async (...args) => {
      const { sendMessageIMessage } = await import("../imessage/send.ts");
      return await sendMessageIMessage(...args);
    },
  };
}

export function createOutboundSendDeps(deps: CliDeps): OutboundSendDeps {
  return createOutboundSendDepsFromCliSource(deps);
}

export { logWebSelfId } from "../web/auth-store.ts";
