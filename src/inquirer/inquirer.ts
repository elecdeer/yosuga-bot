import { BaseCommandInteraction, Collection, Message, MessageEmbed, Snowflake } from "discord.js";
import { getLogger } from "log4js";

import { AnswerCollector } from "./answerCollector";
import { InquireComponent } from "./component/inquireComponent";

export type PromptParam = {
  message: MessageContent;
  time?: number;
  idle?: number;
  ephemeral?: boolean;
  // onInteract?: (interaction: MessageComponentInteraction) => boolean;
};

export type InteractionInquirerParam = {
  replyRoot: BaseCommandInteraction<"cached"> | Message<true>;
  formatMessage?: (message: MessageContent) => MessageContent;
  splitMessage?: boolean;
};

type MessageContent = string | MessageEmbed;

const logger = getLogger("Inquirer");

export class InteractionInquirer {
  protected param: InteractionInquirerParam & PromptParam;

  constructor(param: InteractionInquirerParam & PromptParam) {
    this.param = param;
  }

  async prompt<
    TId extends string,
    TValue,
    TCollector,
    T extends InquireComponent<TId, TValue, TCollector>
  >(
    components: T[],
    promptParam: PromptParam
  ): Promise<AnswerCollector<TId, TValue, TCollector, T>> {
    const applyParam: PromptParam = {
      ...this.param,
      ...promptParam,
    };

    const createMessageContent = (messageContent: MessageContent) => {
      const formattedMessage = this.param.formatMessage
        ? this.param.formatMessage(messageContent)
        : messageContent;

      if (typeof formattedMessage === "string") {
        return {
          content: formattedMessage,
        };
      } else {
        return {
          embeds: [formattedMessage],
        };
      }
    };

    const createMessageOption = (messageContent: MessageContent) => {
      return {
        ...createMessageContent(messageContent),
        fetchReply: true as const,
        ephemeral: applyParam.ephemeral,
        components: components.map((com) => com.createComponent()).flat(),
      };
    };

    const firstMessageOption = createMessageOption(this.param.message);
    const firstMessage = await this.param.replyRoot.reply(firstMessageOption);

    // const messages: Message[] = [firstMessage];
    const messages = new Collection<Snowflake, Message>();
    messages.set(firstMessage.id, firstMessage);

    // TODO 実装予定のpromptController
    // const promptController = {
    //   close: async (messageContent?: MessageContent) => {
    //     //送ったMessageを削除/コンポーネントを削除するようeditする
    //
    //     const latestMessage = messages.last();
    //     if (!latestMessage) {
    //       logger.warn("Messageが一度も送信されていないのにCloseを呼び出しました");
    //       return;
    //     }
    //     const messageOption: MessageEditOptions = messageContent
    //       ? {
    //           ...createMessageContent(messageContent),
    //           components: [],
    //         }
    //       : {
    //           content: latestMessage?.content,
    //           embeds: latestMessage?.embeds,
    //           components: [],
    //         };
    //
    //     await latestMessage.edit(messageOption);
    //
    //     //TODO AnswerCollector側にcloseしたことを知らせる必要がある
    //   },
    //   repost: async (messageContent?: MessageContent) => {
    //     //新しくMessageを作りpostする
    //   },
    //   reconstruct: async (messageContent?: MessageContent) => {
    //     //送ったMessageをeditする
    //
    //     const latestMessage = messages.last();
    //     if (!latestMessage) {
    //       logger.warn("Messageが一度も送信されていないのにCloseを呼び出しました");
    //       return;
    //     }
    //     const messageOption: MessageEditOptions = messageContent
    //       ? {
    //           ...createMessageContent(messageContent),
    //           components: [],
    //         }
    //       : {
    //           content: latestMessage?.content,
    //           embeds: latestMessage?.embeds,
    //           components: [],
    //         };
    //
    //     await latestMessage.edit(messageOption);
    //   },
    // };
    //いずれもcollector作り直してhookし直す必要がある

    const constructCollectorPairs = () => {
      return components.map((com) => {
        const collector = com.createCollector(firstMessage, applyParam);
        return {
          component: com,
          collector: collector,
        };
      });
    };

    const answerCollector = new AnswerCollector<TId, TValue, TCollector, T>(
      constructCollectorPairs()
    );
    return answerCollector;
  }
}
