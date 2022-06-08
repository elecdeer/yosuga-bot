//サーバのカスタム絵文字

import { Util } from "discord.js";

import { processorLogger } from "./processorChain";

import type { ProcessorProvider } from "./processorChain";

const guildEmojiReg = /<\w?:\w+:\d+>/g;
export const guildEmojiProcessor: ProcessorProvider<void> = () => async (speechText) => {
  return {
    ...speechText,
    text: speechText.text.replace(guildEmojiReg, (str) => {
      const emojiData = Util.parseEmoji(str);

      if (!emojiData) return " ";

      processorLogger.debug(`guildEmoji ${str} id: ${emojiData.id} name:${emojiData.name}`);

      const emojiRead = emojiData.name.replace("_", " ");
      return emojiRead + " ";
    }),
  };
};

const emojiIdReg = /\d+/;
const pickEmojiId = (emojiNotation: string): string => {
  const match = emojiIdReg.exec(emojiNotation);
  if (!match) return emojiNotation;
  return match[0];
};
