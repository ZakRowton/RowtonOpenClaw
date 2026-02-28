import { ErrorCodes, errorShape } from "../protocol/index.ts";
import type { GatewayRequestHandlers } from "./types.ts";

export const connectHandlers: GatewayRequestHandlers = {
  connect: ({ respond }) => {
    respond(
      false,
      undefined,
      errorShape(ErrorCodes.INVALID_REQUEST, "connect is only valid as the first request"),
    );
  },
};
