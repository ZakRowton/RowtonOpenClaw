import type { MediaUnderstandingProvider } from "../../types.ts";
import { describeImageWithModel } from "../image.ts";
import { describeMoonshotVideo } from "./video.ts";

export const moonshotProvider: MediaUnderstandingProvider = {
  id: "moonshot",
  capabilities: ["image", "video"],
  describeImage: describeImageWithModel,
  describeVideo: describeMoonshotVideo,
};
