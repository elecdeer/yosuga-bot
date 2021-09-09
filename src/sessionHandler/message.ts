import { getLogger } from "log4js";

import { UnifiedConfig } from "../config/configManager";
import { codeBlockProcessor } from "../processor/codeBlockProcessor";
import { emojiProcessor } from "../processor/emojiProcessor";
import { guildEmojiProcessor } from "../processor/guildEmojiProcessor";
import { maxLengthProcessor } from "../processor/maxLengthProcessor";
import { nlSplitProcessor } from "../processor/nlSplitProcessor";
import { omitSymbolProcessor } from "../processor/omitSymbolProcessor";
import { ProcessorChain } from "../processor/processorChain";
import { tildeReplaceProcessor } from "../processor/tildeReplaceProcessor";
import { urlProcessor } from "../processor/urlProcessor";
import { SessionEventHandlerRegistrant, SpeechText } from "../types";

const logger = getLogger("text");

let processorCache: {
  processor: ProcessorChain;
  config: UnifiedConfig;
} | null;

const createProcessor = (config: UnifiedConfig) => {
  //なんかもったいない気がするのでCacheしてるけどしなくてもいいかも
  if (config === processorCache?.config) {
    return processorCache.processor;
  }

  logger.debug("processor config");
  logger.debug(config);

  const processor = new ProcessorChain()
    .use(codeBlockProcessor())
    .use(nlSplitProcessor())
    .use(urlProcessor(config.fastSpeedScale))
    .use(guildEmojiProcessor())
    .use(emojiProcessor())
    .use(omitSymbolProcessor("!"))
    .use(omitSymbolProcessor("！"))
    .use(omitSymbolProcessor("?"))
    .use(omitSymbolProcessor("？"))
    .use(tildeReplaceProcessor())
    .use(maxLengthProcessor(config.maxStringLength));

  processorCache = {
    processor: processor,
    config: config,
  };

  return processor;
};

export const registerMessageHandler: SessionEventHandlerRegistrant = (session) => {
  session.on("message", async (message) => {
    logger.debug(`content: ${message.content}  escape: ${escape(message.content)}`);
    logger.debug(`cleanContent: ${message.cleanContent}`);

    logger.debug(`embeds: ${message.embeds}`);
    logger.debug(`attachments: ${message.attachments}`);
    logger.debug(`stickers: ${message.stickers}`);

    const baseText = message.cleanContent;
    const config = await session.getConfig();
    if (baseText.startsWith(config.ignorePrefix)) {
      logger.debug("ignored");
      return;
    }

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

    //attachments
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

    //stickers
    if (message.stickers.size > 0) {
      message.stickers
        .map((sticker) => ({
          ...speechTextBase,
          text: sticker.name ?? "スンプ",
        }))
        .forEach((item) => {
          speechTexts.push(item);
        });
    }

    const processor = createProcessor(config);

    const processedTexts = await processor.process(speechTexts, true);
    logger.debug(`text: ${processedTexts}`);
    processedTexts.forEach((item) => {
      void session.pushSpeech(item, message.author.id, message.createdTimestamp);
    });
  });
};
