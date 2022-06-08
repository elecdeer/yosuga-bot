import { MessageActionRow } from "discord.js";

import { LazyParam, resolveLazyParam } from "../../util/lazy";
import { PromptComponent } from "../promptTypes";
import { ButtonParam, createButton } from "../wrapper/createButton";
import { buttonInteractionHook } from "./messageInteractionHook";

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

  const { getRawValue, hook } = buttonInteractionHook<number>({
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
      return [
        new MessageActionRow().addComponents(
          createButton(customId, resolveLazyParam(param.button))
        ),
      ];
    },
    hook: hook,
  };
};
