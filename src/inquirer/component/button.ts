import { MessageActionRow } from "discord.js";

import { buttonComponentHookValue } from "./componentHookWithValue";
import { resolveLazyParam } from "../../util/lazy";
import { createButton } from "../wrapper/createButton";

import type { Lazy, LazyParam } from "../../util/lazy";
import type { PromptComponent } from "../promptTypes";
import type { ButtonParam } from "../wrapper/createButton";

const resolveButtonParamLazy = (param: LazyParam<ButtonParam>) =>
  resolveLazyParam(param, ["label", "emoji", "style", "disabled"]);

export const createButtonComponent = (param: {
  button: LazyParam<ButtonParam>;
  customId?: string;
  initial?: Lazy<boolean>;
}): PromptComponent<true> => {
  const customId = param.customId ?? "button";
  const { getStatus, hook } = buttonComponentHookValue<true>({
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
