import { Message } from "discord.js";
import log4js from "log4js";
import { maxLengthProcessor } from "./processor/maxLengthProcessor";
import { urlProcessor } from "./processor/urlProcessor";
import { ProcessorChain } from "./processor";
import { emojiProcessor } from "./processor/emojiProcessor";
import { codeBlockProcessor } from "./processor/codeBlockProcessor";
import { guildEmojiProcessor } from "./processor/guildEmojiProcessor";
import { Session } from "./session";
import { ServerConfig } from "./guildConfig";
import { SpeechText } from "./types";

const logger = log4js.getLogger("text");

const processor = new ProcessorChain()
  .use(maxLengthProcessor(150))
  .use(urlProcessor())
  .use(emojiProcessor())
  .use(guildEmojiProcessor())
  .use(codeBlockProcessor());

const nameOmitMs = 30000;

export const handleText = async (
  message: Message,
  session: Session,
  config: ServerConfig
): Promise<void> => {
  //読み上げ
  logger.debug("handleText");

  if (!session) return;

  // logger.debug(message);

  logger.debug(`content: ${message.content}  escape: ${escape(message.content)}`);
  logger.debug(`cleanContent: ${message.cleanContent}`);

  logger.debug(`embeds: ${message.embeds}`);
  logger.debug(`attachments: ${message.attachments}`);
  // logger.debug(`stickers] ${message.stickers}`);

  const baseText = message.cleanContent;

  // console.log("lastTime: " + session.textChannel.lastMessage?.createdTimestamp);
  // console.log("messageTime: " + message.createdTimestamp);

  logger.debug("baseText " + baseText);

  const speechTextBase = {
    speed: 1,
    volume: 1,
  };

  const speechTexts: SpeechText[] = [
    {
      ...speechTextBase,
      text: baseText,
    },
  ];

  //名前読み上げ
  const difMs = message.createdTimestamp - session.lastMessageTimestamp;
  logger.debug(`name omit? ${difMs} > ${nameOmitMs}`);
  if (session.lastMessageAuthorId !== message.author.id || difMs > nameOmitMs) {
    speechTexts.unshift({
      ...speechTextBase,
      text: session.getUsernamePronunciation(message.member),
    });
  }

  if (message.attachments.size > 0) {
    message.attachments
      .map((attachment) => ({
        ...speechTextBase,
        text: attachment.url,
      }))
      .forEach((item) => {
        speechTexts.push(item);
      });
  }

  const processedTexts = await processor.process(speechTexts, true);
  logger.debug(`text: ${processedTexts}`);

  processedTexts.forEach((item) => {
    session.pushSpeech(item, message.createdTimestamp, message.author.id);
  });
};
