import { summarizeInteraction } from "./summarizeInteraction";
import { summarizeMessage } from "./summarizeMessage";

import type { ReplyTarget } from "../messenger/messenger";

export const summarizeReplyTarget = (target: ReplyTarget) => {
  if (target.type === "channel") {
    return target;
  }

  if (target.type === "message") {
    return {
      ...target,
      message: summarizeMessage(target.message),
    };
  }

  if (target.type === "commandInteraction" || target.type === "messageComponentInteraction") {
    return {
      ...target,
      interaction: summarizeInteraction(target.interaction),
    };
  }
};
