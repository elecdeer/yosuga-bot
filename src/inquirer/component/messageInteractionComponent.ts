import {
  InteractionCollector,
  MappedInteractionTypes,
  Message,
  MessageActionRow,
  MessageComponentTypeResolvable,
} from "discord.js";

import { PromptParam } from "../inquirer";
import { AnswerCallback, ComponentParam, InquireComponent } from "./inquireComponent";

export abstract class MessageInteractionComponent<
  TId extends string,
  TValue,
  TInteractionType extends MessageComponentTypeResolvable
> implements
    InquireComponent<TId, TValue, InteractionCollector<MappedInteractionTypes[TInteractionType]>>
{
  readonly id: TId;
  readonly interactionType: TInteractionType;

  protected constructor({ id }: ComponentParam<TId>, type: TInteractionType) {
    this.id = id;
    this.interactionType = type;
  }

  abstract createComponent(): MessageActionRow[];

  public createCollector(
    message: Message,
    param: PromptParam
  ): InteractionCollector<MappedInteractionTypes[TInteractionType]> {
    return message.createMessageComponentCollector({
      componentType: this.interactionType,
      filter: (interaction) => interaction.customId === this.id,
      time: param.time,
      idle: param.idle,
    });
  }

  public hookCollector(
    context: AnswerCallback<TValue>,
    collector: InteractionCollector<MappedInteractionTypes[TInteractionType]>
  ): void {
    collector.on("collect", async (interaction) => {
      await interaction.deferUpdate();
      const res = this.onInteraction(interaction);
      if (res !== null) {
        context.answer(res);
      }
    });

    collector.on("end", (collected, reason) => {
      context.reject(reason);
    });
  }

  protected abstract onInteraction(
    interaction: MappedInteractionTypes[TInteractionType]
  ): TValue | null;
}
