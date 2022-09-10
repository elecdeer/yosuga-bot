import type { APIActionRowComponent, APIMessageActionRowComponent } from "discord-api-types/v10";
import type { Awaitable, Message } from "discord.js";

//個々のpromptに関する型

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

export type SubscribeCleaner = () => Awaitable<void> | void;
export type SubscribeMessage<TAction> = (
  message: Message,
  emitAction: (action: TAction) => void
) => Awaitable<SubscribeCleaner>;

export type StateReducer<TState, TAction> = (prev: TState, action: TAction) => TState;

export type OutputResult<TState, TResult> = (state: TState) => AnswerStatus<TResult>;

export type ComponentPayload = APIActionRowComponent<APIMessageActionRowComponent>;
export type OutputComponent<TState, TResult> = (
  state: TState,
  result: AnswerStatus<TResult>
) => ComponentPayload;

export interface PromptModules<TResult, TAction, TState> {
  initialState: TState;
  subscribeMessages: SubscribeMessage<TAction>[];
  stateReducer: StateReducer<TState, TAction>;
  outputResult: OutputResult<TState, TResult>;
  outputComponentParam: OutputComponent<TState, TResult>;
}

export type PromptFactory<TResult> = (
  updateStatus: () => void,
  updateComponent: () => void
) => Prompt<TResult>;

export interface Prompt<TResult> {
  getStatus: () => AnswerStatus<TResult>;
  getComponent: () => ComponentPayload;
  subscribeMessage: (message: Message) => Promise<SubscribeCleaner>;
}
