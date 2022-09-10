import { createMessengerBase } from "./messengerBase";

import type { MessageParam, Messenger, ReplyTarget } from "./messenger";
import type { Message, ThreadChannel } from "discord.js";

export const createThreadMessenger = (thread: ThreadChannel): Messenger => {
  return createMessengerBase(sendThreadMessage(thread));
};

export const sendThreadMessage =
  (thread: ThreadChannel) =>
  (param: MessageParam, target: ReplyTarget): Promise<Message> => {
    if (target.type === "channel") {
      return thread.send(param);
    }
    if (target.type === "message") {
      if (target.message.thread?.id === thread.id) {
        //これだとだめかも
        return target.message.reply(param);
      } else {
        return thread.send(param);
      }
    }
    if (target.type === "commandInteraction" || target.type === "messageComponentInteraction") {
      return target.interaction.reply({
        ...param,
        fetchReply: true,
        threadId: thread.id,
      });
    }
    throw new Error(`Unknown reply target type`);
  };
