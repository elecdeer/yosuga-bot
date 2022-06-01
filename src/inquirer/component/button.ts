import { InteractionButtonOptions, MessageActionRow, MessageButton } from "discord.js";

import { Lazy } from "../../util/lazy";
import { PromptComponent } from "../promptTypes";
import { messageInteractionHook } from "./messageInteractionHook";

type ButtonParam = Partial<Omit<InteractionButtonOptions, "customId" | "type">>;

export const createButtonComponent = (param: {
  button: ButtonParam;
  customId?: string;
  initial?: Lazy<boolean>;
}): PromptComponent<true> => {
  const customId = param.customId ?? "button";
  const { getStatus, hook } = messageInteractionHook<true, "BUTTON">(customId, "BUTTON", () => {
    return true;
  });

  return {
    getStatus: getStatus,
    renderComponent: () => {
      return [new MessageActionRow().addComponents(createButton(customId, param.button))];
    },
    hook: hook,
  };
};

const createButton = (customId: string, param: ButtonParam): MessageButton => {
  const button = new MessageButton();
  button.setCustomId(customId);
  if (param.disabled) button.setDisabled(param.disabled);
  if (param.emoji) button.setEmoji(param.emoji);
  button.setLabel(param.label ?? "");
  button.setStyle(param.style ?? "PRIMARY");
  return button;
};
