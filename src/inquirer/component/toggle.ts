import { MessageActionRow } from "discord.js";
import { getLogger } from "log4js";

import { buttonComponentHookValue } from "./componentHookWithValue";
import { resolveLazyParam } from "../../util/lazy";
import { createButton } from "../wrapper/createButton";

import type { LazyParam } from "../../util/lazy";
import type { PromptComponent } from "../promptTypes";
import type { ButtonParam } from "../wrapper/createButton";

const resolveButtonParamLazy = (param: LazyParam<ButtonParam>) =>
  resolveLazyParam(param, ["label", "emoji", "style", "disabled"]);

const logger = getLogger("toggle");
export const createToggleComponent = <T>(param: {
  button: LazyParam<ButtonParam>;
  toggleOptions: T[];
  customId?: string;
  initial?: T;
}): PromptComponent<T> => {
  const customId = param.customId ?? "toggle";

  const calcInitialValue = () => {
    if (param.initial === undefined) return 0;
    const index = param.toggleOptions.indexOf(param.initial);
    if (index === -1) return 0;
    return index;
  };

  const { getRawValue, hook } = buttonComponentHookValue<number>({
    customId: customId,
    reducer: (_, prevStatus) => {
      return ((prevStatus ?? 0) + 1) % param.toggleOptions.length;
    },
    initialState: calcInitialValue(),
  });

  return {
    getStatus: () => {
      return {
        status: "answered",
        value: param.toggleOptions[getRawValue() ?? 0],
      };
    },
    renderComponent: () => {
      const buttonParam = resolveButtonParamLazy(param.button);
      return [new MessageActionRow().addComponents(createButton(customId, buttonParam))];
    },
    hook: hook,
  };
};
