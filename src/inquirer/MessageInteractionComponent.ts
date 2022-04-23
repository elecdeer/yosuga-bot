import {
  InteractionCollector,
  Message,
  MessageActionRow,
  MessageComponentInteraction,
} from "discord.js";

import { AnswerCallback, ComponentParam, InquireComponent } from "./inquireComponent";
import { PromptParam } from "./inquirer";

export abstract class MessageInteractionComponent<TId extends string, TValue>
  implements InquireComponent<TId, TValue, InteractionCollector<MessageComponentInteraction>>
{
  readonly id: TId;

  protected constructor({ id }: ComponentParam<TId>) {
    this.id = id;
  }

  abstract createComponent(): MessageActionRow[];

  hookMessage(context: AnswerCallback<TValue>, message: Message, param: PromptParam): void {
    const collector = this.createCollector(message, param);
    this.hookCollector(context, collector);
  }

  public createCollector(
    message: Message,
    param: PromptParam
  ): InteractionCollector<MessageComponentInteraction> {
    return message.createMessageComponentCollector({
      filter: (interaction) => interaction.customId === this.id,
      time: param.time,
      idle: param.idle,
    });
  }

  public hookCollector(
    context: AnswerCallback<TValue>,
    collector: InteractionCollector<MessageComponentInteraction>
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

  protected abstract onInteraction(interaction: MessageComponentInteraction): TValue | null;
}
