import {
  InteractionButtonOptions,
  InteractionCollector,
  Message,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
} from "discord.js";

import { InquireComponent } from "./inquireComponent";
import { PromptParam } from "./inquirer";

type ButtonParam = Partial<Omit<InteractionButtonOptions, "customId" | "type">>;

export class ButtonComponent<TId extends string> extends InquireComponent<TId, void> {
  readonly buttonParam: ButtonParam;

  constructor(param: { id: TId } & ButtonParam) {
    super(param);
    this.buttonParam = param;
  }

  override createComponent(): MessageActionRow[] {
    const button = createButton(this.id, this.buttonParam);

    return [new MessageActionRow().addComponents([button])];
  }

  protected override createCollector(
    message: Message,
    param: PromptParam
  ): InteractionCollector<MessageComponentInteraction> {
    return message.createMessageComponentCollector({
      filter: (interaction) => interaction.customId === this.id,
      time: param.time,
      idle: param.idle,
    });
  }

  protected override hookCollector(
    collector: InteractionCollector<MessageComponentInteraction>,
    resolve: (value: void) => void
  ): void {
    collector.on("collect", async (interaction) => {
      await interaction.deferUpdate();
      resolve();
      //
    });

    collector.on("end", (collected, reason) => {
      //
    });
  }
}

const createButton = (id: string, param: ButtonParam): MessageButton => {
  const button = new MessageButton();
  button.setCustomId(id);
  if (param.disabled) button.setDisabled(param.disabled);
  if (param.emoji) button.setEmoji(param.emoji);
  button.setLabel(param.label ?? id);
  button.setStyle(param.style ?? "PRIMARY");
  return button;
};
