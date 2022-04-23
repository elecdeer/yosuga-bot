import { BaseCommandInteraction, Message, MessageEmbed } from "discord.js";
import { getLogger } from "log4js";

import { AnswerCollector } from "./answerCollector";
import { InquireComponent } from "./inquireComponent";

export type PromptParam = {
  message: string | MessageEmbed;
  time?: number;
  idle?: number;
  ephemeral?: boolean;
  onTimeout?: () => void;
  // onInteract?: (interaction: MessageComponentInteraction) => boolean;
};

export type InteractionInquirerParam = {
  replyRoot: BaseCommandInteraction<"cached"> | Message<true>;
  formatMessage?: (message: string | MessageEmbed) => string | MessageEmbed;
  splitMessage?: boolean;
};

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

    const formattedMessage = this.param.formatMessage
      ? this.param.formatMessage(applyParam.message)
      : applyParam.message;

    const messageOption =
      typeof formattedMessage === "string"
        ? {
            content: formattedMessage,
          }
        : {
            embeds: [formattedMessage],
          };

    const message = await this.param.replyRoot.reply({
      ...messageOption,
      fetchReply: true,
      ephemeral: applyParam.ephemeral,
      components: components.map((com) => com.createComponent()).flat(),
    });

    type CollectorType<T> = T[] extends InquireComponent<string, unknown, infer U>[] ? U : never;

    return new AnswerCollector<TId, TValue, TCollector, T>(
      components.map((com) => {
        const collector = com.createCollector(message, applyParam);
        return {
          component: com,
          collector: collector,
        };
      })
    );
  }
}
