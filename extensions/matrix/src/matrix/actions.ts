export type {
  MatrixActionClientOpts,
  MatrixMessageSummary,
  MatrixReactionSummary,
} from "./actions/types.ts";
export {
  sendMatrixMessage,
  editMatrixMessage,
  deleteMatrixMessage,
  readMatrixMessages,
} from "./actions/messages.ts";
export { listMatrixReactions, removeMatrixReactions } from "./actions/reactions.ts";
export { pinMatrixMessage, unpinMatrixMessage, listMatrixPins } from "./actions/pins.ts";
export { getMatrixMemberInfo, getMatrixRoomInfo } from "./actions/room.ts";
export { reactMatrixMessage } from "./send.ts";
