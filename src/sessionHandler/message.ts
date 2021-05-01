import { SessionEventHandlerRegistrant, SpeechText } from "../types";
import { getLogger } from "log4js";
import { ProcessorChain } from "../processor/processor";
import { maxLengthProcessor } from "../processor/maxLengthProcessor";
import { urlProcessor } from "../processor/urlProcessor";
import { emojiProcessor } from "../processor/emojiProcessor";
import { guildEmojiProcessor } from "../processor/guildEmojiProcessor";
import { codeBlockProcessor } from "../processor/codeBlockProcessor";
import { omitExclamationProcessor } from "../processor/omitExclamationProcessor";

const logger = getLogger("text");

const processor = new ProcessorChain()
  .use(maxLengthProcessor(150))
  .use(urlProcessor())
  .use(emojiProcessor())
  .use(guildEmojiProcessor())
  .use(codeBlockProcessor())
  .use(omitExclamationProcessor());

export const registerMessageHandler: SessionEventHandlerRegistrant = (session) => {
  session.on("message", (message) => {
    logger.debug(`content: ${message.content}  escape: ${escape(message.content)}`);
    logger.debug(`cleanContent: ${message.cleanContent}`);

    logger.debug(`embeds: ${message.embeds}`);
    logger.debug(`attachments: ${message.attachments}`);

    const baseText = message.cleanContent;
    const config = session.getConfig();

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

    const difMs = message.createdTimestamp - session.lastPushedSpeech.timestamp;
    logger.debug(`name omit? ${difMs} > ${config.timeToReadMemberNameSec * 1000}`);
    const isOverTime = difMs > config.timeToReadMemberNameSec * 1000;

    const isSpeechName =
      session.lastPushedSpeech.author.type !== "member" ||
      session.lastPushedSpeech.author.memberId !== message.author.id ||
      isOverTime;
    if (isSpeechName) {
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

    void processor.process(speechTexts, true).then((processedTexts) => {
      logger.debug(`text: ${processedTexts}`);
      processedTexts.forEach((item) => {
        session.pushSpeech(item, message.author.id, message.createdTimestamp);
      });
    });
  });
};
