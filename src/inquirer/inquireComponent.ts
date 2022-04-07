import {
  InteractionCollector,
  Message,
  MessageActionRow,
  MessageCollector,
  MessageComponentInteraction,
  ReactionCollector,
} from "discord.js";

import { PromptParam } from "./inquirer";

export type ComponentParam<TId extends string> = {
  id: TId;
};

export type ComponentId<T> = T extends InquireComponent<infer TId, unknown> ? TId : never;
export type ComponentValue<T> = T extends InquireComponent<string, infer TValue> ? TValue : never;

export abstract class InquireComponent<
  TId extends string,
  TValue,
  TCollector extends
    | InteractionCollector<MessageComponentInteraction>
    | MessageCollector
    | ReactionCollector = InteractionCollector<MessageComponentInteraction>
> {
  readonly id: TId;
  protected constructor({ id }: ComponentParam<TId>) {
    this.id = id;
  }

  abstract createComponent(): MessageActionRow[];

  hookMessage(message: Message, param: PromptParam, resolve: (value: TValue) => void): void {
    const collector = this.createCollector(message, param);
    this.hookCollector(collector, resolve);
  }

  protected abstract createCollector(message: Message, param: PromptParam): TCollector;
  protected abstract hookCollector(collector: TCollector, resolve: (value: TValue) => void): void;
}
