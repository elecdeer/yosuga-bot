import { Message, MessageActionRow, MessageEmbed } from "discord.js";

import { Lazy } from "../util/lazy";
import { ReplyDestination } from "../util/replyHelper";
import { Awaited } from "../util/typedEventEmitter";

//TODO AwaitedはTS標準の型と名前が被っているのでやめる
//TODO Toggle, ModalTextInput,

export type PromptEvent<T extends Record<string, PromptComponent<unknown>>> = {
  update: {
    key: keyof T;
    status: AnswerStatus<PromptComponentValue<T[keyof T]>>;
  };
  close: Record<string, never>;
};

export type PromptParamHook = {
  /**
   * Messageを送信してからタイムアウトするまでの時間
   */
  time?: number;

  /**
   * 最後にInteractionを受信してからタイムアウトするまでの時間
   */
  idle?: number;

  /**
   * 送信するMessageがそのユーザにしか見えないかどうか
   */
  ephemeral?: boolean;
};

export type PromptParamMessage = {
  /**
   * 送信するMessageに含まれるコンテント
   */
  messageContent: Lazy<MessageEmbed>;
};

export type PromptParam = PromptParamHook & PromptParamMessage;

export interface PromptController {
  close: (rerender?: boolean) => Promise<void>;
  repost: (destination: ReplyDestination, rerender?: boolean) => Promise<void>;
  edit: () => Promise<void>;
}

export interface PromptCollector<T extends Record<string, PromptComponent<unknown>>> {
  /**
   * 現在の回答状態を取得
   */
  getStatus: () => PromptStatus<T>;

  /**
   * 任意のコンポーネントの回答状態変化時のイベントをセット
   */
  onUpdateAny: (callback: (status: PromptStatus<T>, key: keyof T) => Awaited) => void;

  /**
   * 特定のコンポーネントの回答状態変化時のイベントをセット
   */
  onUpdateOne: <TKey extends keyof T>(
    key: TKey,
    callback: (status: PromptStatus<T>[TKey], key: TKey) => Awaited
  ) => void;

  /**
   * 全てのコンポーネントへの回答を待ち値を返す
   */
  awaitAll: () => Promise<PromptResult<T>>;

  /**
   * 特定のコンポーネントへの回答を待ち値を返す
   */
  awaitOne: <TKey extends keyof T>(key: TKey) => Promise<PromptResult<T>[TKey]>;
}

export type PromptComponentValue<TComponent> = TComponent extends PromptComponent<infer TValue>
  ? TValue
  : never;
export type PromptResult<T extends Record<string, PromptComponent<unknown>>> = {
  [K in keyof T]: PromptComponentValue<T[K]>;
};
export type PromptStatus<T extends Record<string, PromptComponent<unknown>>> = {
  [K in keyof T]: AnswerStatus<PromptComponentValue<T[K]>>;
};

export type ValidateResult =
  | {
      result: "ok";
    }
  | {
      result: "reject";
      reason: string;
    };

export interface PromptComponent<TValue> {
  /**
   * 送信するMessageに含めるMessageActionRowを返す
   */
  renderComponent: () => MessageActionRow[];

  /**
   * MessageへのInteractionを拾うhookを掛ける
   */
  hook: (
    message: Message,
    param: PromptParamHook,
    updateCallback: () => void
  ) => void | (() => Awaited);

  getStatus: () => AnswerStatus<TValue>;
}

export type AnswerStatus<T> =
  | {
      status: "unanswered";
      value?: undefined;
      reason?: undefined;
    }
  | {
      status: "answered";
      value: T;
      reason?: undefined;
    }
  | {
      status: "rejected";
      value?: undefined;
      reason: string;
    };
