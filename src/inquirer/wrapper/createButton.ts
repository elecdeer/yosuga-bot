import { InteractionButtonOptions, MessageButton } from "discord.js";

export type ButtonParam = Partial<Omit<InteractionButtonOptions, "customId" | "type">>;

export const createButton = (customId: string, param: ButtonParam): MessageButton => {
  const button = new MessageButton();
  button.setCustomId(customId);
  if (param.disabled) button.setDisabled(param.disabled);
  if (param.emoji) button.setEmoji(param.emoji);
  button.setLabel(param.label ?? "");
  button.setStyle(param.style ?? "PRIMARY");
  return button;
};
