//サーバのカスタム絵文字
import { processorLogger } from "processor";
import { client } from "index";
import { ProcessorProvider } from "types";

const guildEmojiReg = /<\w?:\w+:\d+>/g;
export const guildEmojiProcessor: ProcessorProvider<void> = () => async(speechText) => {
  return {
    ...speechText,
    text: speechText.text.replace(guildEmojiReg, (str) => {
      const emojiId = pickEmojiId(str);
      const emoji = client.emojis.resolve(emojiId);

      processorLogger.debug(emojiId, emoji?.name);

      return (emoji?.name ?? "emoji") + " ";
    })
  };
};

const emojiIdReg = /\d+/;
const pickEmojiId = (emojiNotation: string): string => {
  const match = emojiIdReg.exec(emojiNotation);
  if (!match) return emojiNotation;
  return match[0];
};
