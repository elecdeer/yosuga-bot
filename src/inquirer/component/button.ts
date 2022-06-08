import { MessageActionRow } from "discord.js";

import { Lazy, LazyParam, resolveLazyParam } from "../../util/lazy";
import { PromptComponent } from "../promptTypes";
import { ButtonParam, createButton } from "../wrapper/createButton";
import { buttonInteractionHook } from "./messageInteractionHook";

const resolveButtonParamLazy = (param: LazyParam<ButtonParam>) =>
  resolveLazyParam(param, ["label", "emoji", "style", "disabled"]);

export const createButtonComponent = (param: {
  button: LazyParam<ButtonParam>;
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
        new MessageActionRow().addComponents(
          createButton(customId, resolveButtonParamLazy(param.button))
        ),
      ];
    },
    hook: hook,
  };
};
