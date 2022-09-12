import type { Message } from "discord.js";

export const summarizeMessage = (message: Message) => {
  return {
    id: message.id,
    channelId: message.channelId,
    guildId: message.guildId,
    authorId: message.author.id,
    content: message.content,
  };
};
