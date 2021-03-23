//サーバのカスタム絵文字
import {
  processorLogger,
  ProcessorProvider,
  TextProcessor,
} from "../processor";
import { client } from "../index";

const guildEmojiReg = /<\w?:\w+:\d+>/g;
export const guildEmojiProcessor: ProcessorProvider<void> = () => async (
  text
) => {
  return text.replace(guildEmojiReg, (str) => {
    const match = str.match(/\d+/);
    if (!match) return str;
    const emojiId = match[0];
    const emoji = client.emojis.resolve(emojiId);

    processorLogger.debug(emojiId, emoji?.name);

    return (emoji?.name ?? "emoji") + " ";
  });
};
