import {
  InteractionButtonOptions,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
} from "discord.js";

import { MessageInteractionComponent } from "./MessageInteractionComponent";

type ButtonParam = Partial<Omit<InteractionButtonOptions, "customId" | "type">>;

export class SelectComponent<TId extends string> extends MessageInteractionComponent<TId, number> {
  readonly buttonParam: ButtonParam;

  constructor(param: { id: TId } & ButtonParam) {
    super(param);
    this.buttonParam = param;
  }

  override createComponent(): MessageActionRow[] {
    const button = createButton(this.id, this.buttonParam);

    return [new MessageActionRow().addComponents([button])];
  }

  protected override onInteraction(interaction: MessageComponentInteraction): number | null {
    return Math.floor(Math.random() * 100);
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
