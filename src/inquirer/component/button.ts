import { InteractionButtonOptions, MessageActionRow, MessageButton } from "discord.js";

import { Lazy, resolveLazy } from "../../util/lazy";
import { PromptComponent } from "../promptTypes";
import { buttonInteractionHook } from "./messageInteractionHook";

export type ButtonParam = Partial<Omit<InteractionButtonOptions, "customId" | "type">>;

export const createButtonComponent = (param: {
  button: Lazy<ButtonParam>;
  customId?: string;
  initial?: Lazy<boolean>;
}): PromptComponent<true> => {
  const customId = param.customId ?? "button";
  const { getStatus, hook } = buttonInteractionHook<true>({
    customId: customId,
    reducer: () => true,
  });

  return {
    getStatus: getStatus,
    renderComponent: () => {
      return [
        new MessageActionRow().addComponents(createButton(customId, resolveLazy(param.button))),
      ];
    },
    hook: hook,
  };
};

export const createButton = (customId: string, param: ButtonParam): MessageButton => {
  const button = new MessageButton();
  button.setCustomId(customId);
  if (param.disabled) button.setDisabled(param.disabled);
  if (param.emoji) button.setEmoji(param.emoji);
  button.setLabel(param.label ?? "");
  button.setStyle(param.style ?? "PRIMARY");
  return button;
};
