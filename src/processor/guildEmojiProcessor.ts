//サーバのカスタム絵文字

import { ProcessorProvider } from "../types";
import { processorLogger } from "./processor";
import { Util } from "discord.js";

const guildEmojiReg = /<\w?:\w+:\d+>/g;
export const guildEmojiProcessor: ProcessorProvider<void> = () => async (speechText) => {
  return {
    ...speechText,
    text: speechText.text.replace(guildEmojiReg, (str) => {
      const emojiData = Util.parseEmoji(str);

      if (!emojiData) return " ";

      processorLogger.debug(emojiData.id, emojiData.name);

      return (emojiData.name ?? "emoji") + " ";
    }),
  };
};

const emojiIdReg = /\d+/;
const pickEmojiId = (emojiNotation: string): string => {
  const match = emojiIdReg.exec(emojiNotation);
  if (!match) return emojiNotation;
  return match[0];
};
