import { yosugaEnv } from "../../environment";

import type { Message } from "discord.js";

export const summarizeMessage = (message: Message) => {
  const general = {
    id: message.id,
    channelId: message.channelId,
    guildId: message.guildId,
    authorId: message.author.id,
  };

  if (yosugaEnv.envMode === "development") {
    return {
      ...general,
      content: message.content,
      embeds: message.embeds.map((embed) => embed.toJSON()),
      attachments: message.attachments.map((attachment) => attachment.toJSON()),
      stickers: message.stickers.map((sticker) => sticker.toJSON()),
      components: message.components.map((component) => component.toJSON()),
    };
  } else {
    return general;
  }
};
