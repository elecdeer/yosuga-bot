import {
  BaseCommandInteraction,
  Message,
  MessageComponentInteraction,
  MessageEmbed,
} from "discord.js";
import { getLogger } from "log4js";

import { InquireComponent, InquirerResolver } from "./inquireComponent";

export type PromptParam = {
  message: string | MessageEmbed;
  time?: number;
  idle?: number;
  ephemeral?: boolean;
  onTimeout?: () => void;
  onReceiveInteraction?: (interaction: MessageComponentInteraction) => void;
};

export type InteractionInquirerParam = {
  replyRoot: BaseCommandInteraction<"cached"> | Message<true>;
  formatMessage?: (message: string | MessageEmbed) => string | MessageEmbed;
  splitMessage?: boolean;
};

type PromptResult<T extends InquireComponent<string, unknown>[]> = {
  [K in T[number]["id"]]: {
    id: K;
    value: Extract<T[number], InquirerResolver<InquireComponent<K, unknown>>>;
  };
};

const logger = getLogger("Inquirer");

export class InteractionInquirer {
  protected param: InteractionInquirerParam & PromptParam;

  constructor(param: InteractionInquirerParam & PromptParam) {
    this.param = param;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async prompt<T extends InquireComponent<string, any, any>[]>(
    components: T,
    promptParam: PromptParam
  ): Promise<PromptResult<T>> {
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

    const componentsPromises: Promise<{
      id: T[number]["id"];
      value: InquirerResolver<T[number]>;
    }>[] = components.map((com) => {
      return new Promise((resolve) => {
        com.hookMessage(message, applyParam, (value) => {
          logger.trace(`resolve: ${com.id} ${value}`);
          resolve({
            id: com.id,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value: value,
          });
        });
      });
    });

    const resultArray = await Promise.all(componentsPromises);

    const result = resultArray.reduce((acc, cur) => {
      return {
        ...acc,
        [cur.id]: cur,
      };
    }, {} as PromptResult<T>);
    logger.trace(JSON.stringify(result));
    return result;
  }
}
