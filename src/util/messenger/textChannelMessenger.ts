import { createMessengerBase } from "./messengerBase";

import type { MessageParam, Messenger, ReplyTarget } from "./messenger";
import type { DMChannel, Message, TextChannel } from "discord.js";

export const createTextChannelMessenger = (channel: TextChannel | DMChannel): Messenger => {
  return createMessengerBase(sendTextChannelMessage(channel));
};

export const sendTextChannelMessage =
  (channel: TextChannel | DMChannel) =>
  async (param: MessageParam, target: ReplyTarget): Promise<Message> => {
    if (target.type === "channel") {
      return channel.send(param);
    }
    if (target.type === "message") {
      return target.message.reply(param);
    }
    if (target.type === "commandInteraction" || target.type === "messageComponentInteraction") {
      return target.interaction.reply({
        ...param,
        fetchReply: true,
      });
    }
    throw new Error(`Unknown reply target type`);
  };
