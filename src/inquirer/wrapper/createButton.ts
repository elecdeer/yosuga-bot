import { MessageButton } from "discord.js";

import type { InteractionButtonOptions } from "discord.js";
import type { SetRequired } from "type-fest";

export type ButtonParam = SetRequired<Partial<InteractionButtonOptions>, "customId"> & {
  type: "BUTTON";
};

export const createButton = (param: ButtonParam): MessageButton => {
  const button = new MessageButton();
  button.setCustomId(param.customId);
  if (param.disabled !== undefined) button.setDisabled(param.disabled);
  if (param.emoji !== undefined) button.setEmoji(param.emoji);
  button.setLabel(param.label ?? "");
  button.setStyle(param.style ?? "PRIMARY");
  return button;
};
