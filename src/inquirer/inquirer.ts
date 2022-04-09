import {
  BaseCommandInteraction,
  Collection,
  Message,
  MessageComponentInteraction,
  MessageEmbed,
} from "discord.js";
import EventEmitter from "events";
import { getLogger } from "log4js";

import { TypedEventEmitter } from "../util/typedEventEmitter";
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

type InquireComponentBase = InquireComponent<string, unknown>;

/**
 * promptの返り値
 */
type PromptResult<T extends InquireComponentBase> = {
  [K in T["id"]]: {
    id: K;
    value: ComponentValue<Extract<T, InquireComponent<K, unknown>>>;
  };
};

/**
 * 各コンポーネントの回答状態
 */
type AnswerStatus<T extends InquireComponentBase> =
  | {
      id: ComponentId<T>;
      state: "unanswered";
    }
  | {
      id: ComponentId<T>;
      state: "answered";
      value: ComponentValue<T>;
    }
  | {
      id: ComponentId<T>;
      state: "timeout";
    };

/**
 * promptの状態
 */
type Context<T extends InquireComponentBase> = {
  answers: Collection<ComponentId<T>, AnswerStatus<T>>;
};

/**
 * 回答を得られたときのイベントハンドラ
 */
type AnswerEventHandler<T extends InquireComponentBase> = (
  context: Context<T>,
  id: ComponentId<T>,
  value: ComponentValue<T>
) => void;

const logger = getLogger("Inquirer");

export class InteractionInquirer {
  protected param: InteractionInquirerParam & PromptParam;

  constructor(param: InteractionInquirerParam & PromptParam) {
    this.param = param;
  }

  async prompt<T extends InquireComponent<string, unknown>>(
    components: T[],
    promptParam: PromptParam
  ): Promise<{
    awaitAll: () => Promise<PromptResult<T>>;
    awaitAnswer: <TId extends ComponentId<T>>(
      id: TId
    ) => Promise<{ id: TId; value: ComponentValue<Extract<T, InquireComponent<TId, unknown>>> }>;
    collect: (handler: AnswerEventHandler<T>) => void;
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

    const entries: [ComponentId<T>, AnswerStatus<T>][] = components.map((com) => {
      const key = com.id as ComponentId<T>;
      const value = {
        id: com.id,
        state: "unanswered",
      } as AnswerStatus<T>;
      return [key, value];
    });
    const answerStatusCollection = new Collection<ComponentId<T>, AnswerStatus<T>>(entries);

    const context: Context<T> = {
      answers: answerStatusCollection,
    };

    // const allDiffered = new Deferred<PromptResult<T>>();

    const answerEvent = new EventEmitter() as TypedEventEmitter<{
      answered: Parameters<AnswerEventHandler<T>>;
    }>;

    answerEvent.on("answered", (context, id, value) => {
      answerStatusCollection.set(id, {
        id: id,
        state: "answered",
        value: value,
      });
    });

    components.forEach((com) => {
      com.hookMessage(message, applyParam, (value) => {
        const id = com.id as ComponentId<T>;
        const answerValue = value as ComponentValue<T>;

        answerEvent.emit("answered", context, id, answerValue);
      });
    });

    const awaitAll = (): Promise<PromptResult<T>> => {
      return new Promise<PromptResult<T>>((resolve) => {
        answerEvent.on("answered", (context) => {
          if (context.answers.every((item) => item.state === "answered")) {
            resolve(
              answerStatusCollection.reduce((acc, cur) => {
                return {
                  ...acc,
                  [cur.id]: cur,
                };
              }, {} as PromptResult<T>)
            );
          }
        });
      });
    };
    //TODO タイムアウト時の処理

    const awaitAnswer = <TId extends ComponentId<T>>(id: TId) => {
      return new Promise<{
        id: TId;
        value: ComponentValue<Extract<T, InquireComponent<TId, unknown>>>;
      }>((resolve) => {
        answerEvent.on("answered", (context, idEvent, valueEvent) => {
          if (idEvent !== id) return;
          resolve({
            id: id,
            value: valueEvent,
          });
        });
      });
    };

    const collect = (handler: AnswerEventHandler<T>) => {
      answerEvent.on("answered", handler);
    };

    return {
      awaitAll,
      collect,
      awaitAnswer,
    };

    //やっぱhandler周りはイベントにした方がよさそう
  }
}
