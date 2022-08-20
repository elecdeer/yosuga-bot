import { Collection } from "discord.js";

import type { MessageParam, Messenger, ReplyTarget } from "./messenger";
import type { Message } from "discord.js";

export const createMessengerBase = (
  sendMessage: (param: MessageParam, target: ReplyTarget) => Promise<Message>
): Messenger => {
  const messageCollection = new Collection<string, Message>();

  return {
    send: async (
      param,
      target = {
        type: "channel",
      }
    ) => {
      const message = await sendMessage(param, target);
      messageCollection.set(message.id, message);
      return message;
    },
    edit: async (param, message) => {
      if (messageCollection.has(message.id)) {
        return await message.edit(param);
      } else {
        throw new Error(`このMessengerから送信されたMessageではないため編集できません`);
      }
    },
    editLatest: async (param) => {
      const message = messageCollection.last();
      if (message) {
        return await message.edit(param);
      } else {
        throw new Error("送信したメッセージがありません");
      }
    },
    postedMessages: () => Array.from(messageCollection.values()),
  };
};
