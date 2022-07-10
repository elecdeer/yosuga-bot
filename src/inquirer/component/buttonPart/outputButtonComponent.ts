import { resolveLazy } from "../../../util/lazy";

import type { LazyParam } from "../../../util/lazy";
import type { OutputComponentParam } from "../../promptTypes";
import type { EmojiIdentifierResolvable, ExcludeEnum } from "discord.js";
import type { MessageButtonStyles } from "discord.js/typings/enums";

export type ButtonParam = {
  style?: ExcludeEnum<typeof MessageButtonStyles, "LINK">;
  disabled?: boolean;
  emoji?: EmojiIdentifierResolvable;
  label?: string;
};

export const outputButtonComponent =
  <TState>(customId: string, param: LazyParam<ButtonParam, TState>): OutputComponentParam<TState> =>
  (state) => {
    return [
      [
        {
          ...resolveButtonParam(param, state),
          type: "BUTTON",
          customId: customId,
        },
      ],
    ];
  };

export const resolveButtonParam = <TState>(
  param: LazyParam<ButtonParam, TState>,
  value: TState
): ButtonParam => {
  return {
    style: resolveLazy(param.style, value),
    disabled: resolveLazy(param.disabled, value),
    emoji: resolveLazy(param.emoji, value),
    label: resolveLazy(param.label, value),
  };
};
