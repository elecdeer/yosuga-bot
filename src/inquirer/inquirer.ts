import {
  BaseCommandInteraction,
  Collection,
  Message,
  MessageComponentInteraction,
  MessageEmbed,
} from "discord.js";
import { getLogger } from "log4js";

import { Deferred } from "../util/deferred";
import { ComponentId, ComponentValue, InquireComponent } from "./inquireComponent";

export type PromptParam = {
  message: string | MessageEmbed;
  time?: number;
  idle?: number;
  ephemeral?: boolean;
  onTimeout?: () => void;
  onInteract?: (interaction: MessageComponentInteraction) => boolean;
};

export type InteractionInquirerParam = {
  replyRoot: BaseCommandInteraction<"cached"> | Message<true>;
  formatMessage?: (message: string | MessageEmbed) => string | MessageEmbed;
  splitMessage?: boolean;
};

type PromptResult<T extends InquireComponent<string, unknown>> = {
  [K in T["id"]]: {
    id: K;
    value: ComponentValue<Extract<T, InquireComponent<K, unknown>>>;
  };
};

const logger = getLogger("Inquirer");

export class InteractionInquirer {
  protected param: InteractionInquirerParam & PromptParam;

  constructor(param: InteractionInquirerParam & PromptParam) {
    this.param = param;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async prompt<T extends InquireComponent<string, any, any>>(
    components: T[],
    promptParam: PromptParam
  ): Promise<{
    collect: (handler: (id: ComponentId<T>, value: ComponentValue<T>) => void) => void;
    awaitAll: () => Promise<PromptResult<T>>;
  }> {
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

    type AnswerStatus<TComponent extends T> =
      | {
          id: ComponentId<TComponent>;
          state: "unanswered";
        }
      | {
          id: ComponentId<TComponent>;
          state: "answered";
          value: ComponentValue<TComponent>;
        }
      | {
          id: ComponentId<TComponent>;
          state: "timeout";
        };

    const entries: [ComponentId<T>, AnswerStatus<T>][] = components.map((com) => {
      const key = com.id as ComponentId<T>;
      const value = {
        id: com.id,
        state: "unanswered",
      } as AnswerStatus<T>;
      return [key, value];
    });
    const answerStatusCollection = new Collection<ComponentId<T>, AnswerStatus<T>>(entries);

    const allDiffered = new Deferred<PromptResult<T>>();

    const answer = <TComponent extends T>(
      id: ComponentId<TComponent>,
      value: ComponentValue<TComponent>
    ) => {
      answerStatusCollection.set(id, {
        id: id,
        state: "answered",
        value: value,
      });

      //全てansweredになったら
      if (answerStatusCollection.every((item) => item.state === "answered")) {
        allDiffered.resolve(
          answerStatusCollection.reduce((acc, cur) => {
            return {
              ...acc,
              [cur.id]: cur,
            };
          }, {} as PromptResult<T>)
        );
      }
    };

    const handlers: ((id: ComponentId<T>, value: ComponentValue<T>) => void)[] = [];

    components.forEach((com) => {
      com.hookMessage(message, applyParam, (value) => {
        const id = com.id as ComponentId<T>;
        const answerValue = value as ComponentValue<T>;
        answer(id, answerValue);
        handlers.forEach((handler) => {
          handler(id, answerValue);
        });
      });
    });

    const awaitAll = (): Promise<PromptResult<T>> => {
      return allDiffered.promise;
    };
    //TODO タイムアウト時の処理

    const collect = (handler: (id: ComponentId<T>, value: ComponentValue<T>) => void) => {
      handlers.push(handler);
    };

    return {
      awaitAll,
      collect,
    };
  }
}
