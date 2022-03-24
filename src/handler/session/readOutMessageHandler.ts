import { Message } from "discord.js";

import { UnifiedConfig } from "../../config/typesConfig";
import { codeBlockProcessor } from "../../processor/codeBlockProcessor";
import { emojiProcessor } from "../../processor/emojiProcessor";
import { englishProcessor } from "../../processor/englishProcessor";
import { guildEmojiProcessor } from "../../processor/guildEmojiProcessor";
import { maxLengthProcessor } from "../../processor/maxLengthProcessor";
import { nlSplitProcessor } from "../../processor/nlSplitProcessor";
import { omitSymbolProcessor } from "../../processor/omitSymbolProcessor";
import { ProcessorChain } from "../../processor/processorChain";
import { tildeReplaceProcessor } from "../../processor/tildeReplaceProcessor";
import { urlProcessor } from "../../processor/urlProcessor";
import { Session } from "../../session";
import { SpeechText } from "../../types";
import { YosugaClient } from "../../yosugaClient";
import { EventKeysUnion } from "../base/handler";
import { SessionContextHandler } from "../base/sessionContextHandler";
import { composeFilter, EventFilter, filterer } from "../filter/eventFilter";

export class ReadOutMessageHandler extends SessionContextHandler<["messageCreate"]> {
  protected processorCache: {
    processor: ProcessorChain;
    config: UnifiedConfig;
  } | null = null;

  constructor(yosuga: YosugaClient, session: Session) {
    super(["messageCreate"], yosuga, session);
  }

  protected createProcessor(config: UnifiedConfig): ProcessorChain {
    // this.logger.debug("processor config");
    // this.logger.debug(config);

    //ReDoS防止のために頭にも文字数制限入れてる

    return new ProcessorChain()
      .use(maxLengthProcessor(config.maxStringLength))
      .use(codeBlockProcessor())
      .use(nlSplitProcessor())
      .use(urlProcessor(config.fastSpeedScale))
      .use(guildEmojiProcessor())
      .use(emojiProcessor())
      .use(englishProcessor())
      .use(omitSymbolProcessor("!"))
      .use(omitSymbolProcessor("！"))
      .use(omitSymbolProcessor("?"))
      .use(omitSymbolProcessor("？"))
      .use(tildeReplaceProcessor())
      .use(maxLengthProcessor(config.maxStringLength));
  }

  protected getProcessor(config: UnifiedConfig): ProcessorChain {
    if (config === this.processorCache?.config) {
      return this.processorCache.processor;
    } else {
      const processor = this.createProcessor(config);
      this.processorCache = {
        processor: processor,
        config: config,
      };
      return processor;
    }
  }

  protected override filter(
    eventName: EventKeysUnion<["messageCreate"]>
  ): EventFilter<EventKeysUnion<["messageCreate"]>> {
    return composeFilter(
      super.filter(eventName),
      filterer(async (message) => {
        const config = await this.session.getConfig();
        if (message.cleanContent.startsWith(config.ignorePrefix)) {
          return false;
        }
        if (message.author.bot) return false;
        return message.channel.isText();
      })
    );
  }

  protected async onEvent(
    eventName: EventKeysUnion<["messageCreate"]>,
    message: Message
  ): Promise<void> {
    const config = await this.session.getConfig();

    this.logger.debug(`content: ${message.content}`);

    const baseText = message.cleanContent;

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

    const difMs = message.createdTimestamp - this.session.lastPushedSpeech.timestamp;
    this.logger.debug(`name omit? ${difMs} > ${config.timeToReadMemberNameSec * 1000}`);
    const isOverTime = difMs > config.timeToReadMemberNameSec * 1000;

    const isSpeechName =
      this.session.lastPushedSpeech.author.type !== "member" ||
      this.session.lastPushedSpeech.author.memberId !== message.author.id ||
      isOverTime;
    if (isSpeechName) {
      speechTexts.unshift({
        ...speechTextBase,
        text: this.session.getUsernamePronunciation(message.member),
      });
    }

    //TODO この辺Processorにしてしまってよいのでは？
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
          text: sticker.name ?? "スタンプ",
        }))
        .forEach((item) => {
          speechTexts.push(item);
        });
    }

    const processor = this.getProcessor(config);

    const processedTexts = await processor.process(speechTexts, true);

    this.logger.debug(`processedTexts: ${processedTexts.join(" ")}`);

    processedTexts.forEach((item) => {
      void this.session.pushSpeech(item, message.author.id, message.createdTimestamp);
    });
  }
}
