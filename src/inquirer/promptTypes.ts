import type { Lazy } from "../util/lazy";
import type { ReplyScene, ReplyTarget } from "../util/replyHelpter";
import type { MessageButtonParam } from "./wrapper/createButton";
import type { MessageSelectParam } from "./wrapper/createSelectMenu";
import type { Message, MessageEmbed, Awaitable } from "discord.js";

export type PromptEvent<T extends Record<string, Prompt<unknown>>> = {
  update: {
    key: keyof T;
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
};

export type PromptParamMessage = {
  /**
   * 送信するMessageに含まれるコンテント
   */
  messageContent: Lazy<MessageEmbed>;

  /**
   * promptの送信先
   */
  scene: ReplyScene;

  /**
   * 最初のMessageの送信先
   */
  rootTarget: ReplyTarget;

  /**
   * 送信するMessageがそのユーザにしか見えないかどうか
   */
  ephemeral?: boolean;
};

export type PromptParam = PromptParamHook & PromptParamMessage;

export interface PromptController {
  close: (rerender?: boolean) => Promise<void>;
  repost: (target: ReplyTarget, rerender?: boolean) => Promise<void>;
  edit: () => Promise<void>;
}

export interface PromptCollector<T extends Record<string, Prompt<unknown>>> {
  /**
   * 現在の回答状態を取得
   */
  getStatus: () => PromptStatus<T>;

  /**
   * 任意のコンポーネントの回答状態変化時のイベントをセット
   */
  onUpdateAny: (callback: (status: PromptStatus<T>, key: keyof T) => Awaitable<void>) => void;

  /**
   * 特定のコンポーネントの回答状態変化時のイベントをセット
   */
  onUpdateOne: <TKey extends keyof T>(
    key: TKey,
    callback: (status: PromptStatus<T>[TKey], key: TKey) => Awaitable<void>
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

export type PromptValue<TComponent> = TComponent extends Prompt<infer TValue> ? TValue : never;
export type PromptResult<T extends Record<string, Prompt<unknown>>> = {
  [K in keyof T]: PromptValue<T[K]>;
};
export type PromptStatus<T extends Record<string, Prompt<unknown>>> = {
  [K in keyof T]: AnswerStatus<PromptValue<T[K]>>;
};

export type ValidateResultOk = {
  result: "ok";
  reason?: undefined;
};

export type ValidateResultReject = {
  result: "reject";
  reason: string;
};

export type ValidateResult = ValidateResultOk | ValidateResultReject;

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

//==============
export type ComponentParam = MessageButtonParam | MessageSelectParam;

export type ComponentRow = ComponentParam[];
export type ComponentRowList = ComponentRow[];

export type HookCleaner = () => Awaitable<void> | void;

export type HookMessage<TAction> = (
  message: Message,
  emitAction: (action: TAction) => void
) => Awaitable<HookCleaner>;

export type StateReducer<TState, TAction> = (prev: TState, action: TAction) => TState;

export type OutputResult<TState, TResult> = (state: TState) => AnswerStatus<TResult>;

export type OutputComponentParam<TState, TResult> = (
  state: TState,
  result: AnswerStatus<TResult>
) => ComponentRowList;

//TODO hookからsubscribeに命名変更
export interface PromptParts<TResult, TAction, TState> {
  initialState: TState;
  hookMessages: HookMessage<TAction>[];
  stateReducer: StateReducer<TState, TAction>;
  outputResult: OutputResult<TState, TResult>;
  outputComponentParam: OutputComponentParam<TState, TResult>;
}

export type PromptFactory<TResult> = (
  hookParam: PromptParamHook,
  updateStatus: () => void,
  updateComponent: () => void
) => Prompt<TResult>;

export interface Prompt<TResult> {
  getStatus: () => AnswerStatus<TResult>;
  getComponent: () => ComponentRowList;
  hookMessage: (message: Message) => Promise<HookCleaner>;
}
