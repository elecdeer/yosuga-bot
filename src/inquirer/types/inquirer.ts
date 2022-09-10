import type { Lazy } from "../../util/lazy";
import type { Messenger, ReplyTarget } from "../../util/messenger/messenger";
import type { AnswerStatus, Prompt } from "./prompt";
import type { APIEmbed } from "discord-api-types/v10";
import type { Awaitable } from "discord.js";

export type InquirerOptionTimer = {
  /**
   * 最初にinquirerを送信してからタイムアウトするまでの時間
   */
  time?: number;

  /**
   * 最後に回答状態かコンポーネントの状態が変化してからタイムアウトするまでの時間
   */
  idle?: number;
};

export type InquirerOptionMessage = {
  /**
   * 送信するMessageに含まれるコンテント
   */
  messageContent: Lazy<APIEmbed>;

  /**
   * promptを送信するためのMessenger
   */
  messenger: Messenger;

  /**
   * 最初のMessageの送信先
   */
  rootTarget: ReplyTarget;

  /**
   * 送信するMessageがそのユーザにしか見えないかどうか
   */
  ephemeral?: boolean;
};

export type InquirerOption = InquirerOptionTimer & InquirerOptionMessage;

export interface InquirerController {
  close: (rerender?: boolean) => Promise<void>;
  repost: (target: ReplyTarget, rerender?: boolean) => Promise<void>;
  edit: () => Promise<void>;
}

export interface InquirerCollector<T extends Record<string, Prompt<unknown>>> {
  /**
   * 現在の回答状態を取得
   */
  getStatus: () => PromptsStatus<T>;

  /**
   * 任意のコンポーネントの回答状態変化時のイベントをセット
   */
  onUpdateAny: (callback: (status: PromptsStatus<T>, key: keyof T) => Awaitable<void>) => void;

  /**
   * 特定のコンポーネントの回答状態変化時のイベントをセット
   */
  onUpdateOne: <TKey extends keyof T>(
    key: TKey,
    callback: (status: PromptsStatus<T>[TKey], key: TKey) => Awaitable<void>
  ) => void;

  /**
   * 全てのコンポーネントへの回答を待ち値を返す
   */
  awaitAll: () => Promise<PromptsResult<T>>;

  /**
   * 特定のコンポーネントへの回答を待ち値を返す
   */
  awaitOne: <TKey extends keyof T>(key: TKey) => Promise<PromptsResult<T>[TKey]>;
}

export type PromptValue<TPrompt> = TPrompt extends Prompt<infer TValue> ? TValue : never;
export type PromptsResult<T extends Record<string, Prompt<unknown>>> = {
  [K in keyof T]: PromptValue<T[K]>;
};
export type PromptsStatus<T extends Record<string, Prompt<unknown>>> = {
  [K in keyof T]: AnswerStatus<PromptValue<T[K]>>;
};
