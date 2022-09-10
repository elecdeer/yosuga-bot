import { ButtonStyle, ComponentType } from "discord.js";

import { resolveLazy } from "../../util/lazy";

import type { LazyParam } from "../../util/lazy";
import type { ComponentPayload, OutputComponent } from "../types/prompt";
import type { APIMessageComponentEmoji } from "discord.js";

//based APIButtonComponentBase
export type ButtonParam = {
  style?: ButtonStyle.Primary | ButtonStyle.Secondary | ButtonStyle.Success | ButtonStyle.Danger;
  disabled?: boolean;
  emoji?: APIMessageComponentEmoji;
  label?: string;
};

export const outputButtonComponent = <TState>(
  customId: string,
  param: LazyParam<ButtonParam, TState>
): OutputComponent<TState, void> => {
  return (state, _) => {
    const { style, disabled, emoji, label } = resolveButtonParam(param, state);

    const payload: ComponentPayload = {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.Button,
          custom_id: customId,
          style: style ?? ButtonStyle.Primary,
          label: label,
          disabled: disabled ?? false,
          emoji: emoji,
        },
      ],
    };
    return payload;
  };
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
