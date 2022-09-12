import { Collection } from "discord.js";

import type { MessageParam, Messenger, ReplyTarget } from "./messenger";
import type { Message } from "discord.js";

type SendHistoryItem = {
  message: Message;
  target: ReplyTarget;
};

export const createMessengerBase = (
  sendMessage: (param: MessageParam, target: ReplyTarget) => Promise<Message>
): Messenger => {
  const sendHistoryCollection = new Collection<string, SendHistoryItem>();

  const editItem = async (historyItem: SendHistoryItem, param: MessageParam) => {
    if (
      historyItem.target.type === "commandInteraction" ||
      historyItem.target.type === "messageComponentInteraction"
    ) {
      //ephemeralなinteractionReplyの編集はmessageからではなく、interaction側から行う必要がある
      return await historyItem.target.interaction.editReply(param);
    } else {
      return await historyItem.message.edit(param);
    }
  };

  return {
    send: async (
      param,
      target = {
        type: "channel",
      }
    ) => {
      const message = await sendMessage(param, target);
      sendHistoryCollection.set(message.id, {
        message,
        target,
      });
      return message;
    },
    edit: async (param, message) => {
      const historyItem = sendHistoryCollection.get(message.id);
      if (historyItem !== undefined) {
        return await editItem(historyItem, param);
      } else {
        throw new Error(`このMessengerから送信されたMessageではないため編集できません`);
      }
    },
    editLatest: async (param) => {
      const historyItem = sendHistoryCollection.last();
      if (historyItem !== undefined) {
        return await editItem(historyItem, param);
      } else {
        throw new Error(`このMessengerから送信されたMessageがありません`);
      }
    },
    postedMessages: () => Array.from(sendHistoryCollection.values()).map((item) => item.message),
  };
};
