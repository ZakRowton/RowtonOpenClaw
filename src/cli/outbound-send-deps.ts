import type { OutboundSendDeps } from "../infra/outbound/deliver.ts";
import {
  createOutboundSendDepsFromCliSource,
  type CliOutboundSendSource,
} from "./outbound-send-mapping.ts";

export type CliDeps = Required<CliOutboundSendSource>;

export function createOutboundSendDeps(deps: CliDeps): OutboundSendDeps {
  return createOutboundSendDepsFromCliSource(deps);
}
