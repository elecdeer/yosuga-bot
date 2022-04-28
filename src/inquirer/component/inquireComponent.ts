import { Message, MessageActionRow } from "discord.js";

import { PromptParam } from "../inquirer";

export type ComponentParam<TId extends string> = {
  id: TId;
};

export type ComponentId<T> = T extends InquireComponent<infer TId, unknown> ? TId : never;
export type ComponentValue<T> = T extends InquireComponent<string, infer TValue> ? TValue : never;

export type AnswerCallback<TValue> = {
  answer: (value: TValue) => void;
  reject: (reason: string) => void;
};

export interface InquireComponent<TId extends string, TValue, TCollector = unknown> {
  readonly id: TId;

  createComponent(): MessageActionRow[];

  createCollector(message: Message, param: PromptParam): TCollector;

  hookCollector(callback: AnswerCallback<TValue>, collector: TCollector): void;
}
