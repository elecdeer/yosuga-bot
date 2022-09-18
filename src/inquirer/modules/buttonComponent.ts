import { ButtonStyle } from "discord-api-types/v10";
import { ComponentType } from "discord.js";

import { resolveLazy } from "../../util/lazy";

import type { LazyParam } from "../../util/lazy";
import type { APIButtonComponent, APIMessageComponentEmoji } from "discord-api-types/v10";

//based APIButtonComponentBase
export type ButtonParam = {
  style?: ButtonStyle.Primary | ButtonStyle.Secondary | ButtonStyle.Success | ButtonStyle.Danger;
  disabled?: boolean;
  emoji?: APIMessageComponentEmoji;
  label?: string;
};

export const resolveButtonParam = <TValue>(
  param: LazyParam<ButtonParam, TValue>,
  value: TValue
): ButtonParam => {
  return {
    style: resolveLazy(param.style, value),
    disabled: resolveLazy(param.disabled, value),
    emoji: resolveLazy(param.emoji, value),
    label: resolveLazy(param.label, value),
  };
};

export const buttonComponent = <TValue>(
  customId: string,
  param: LazyParam<ButtonParam, TValue>,
  value: TValue
): APIButtonComponent => {
  const resolvedParam = resolveButtonParam(param, value);

  return {
    type: ComponentType.Button,
    custom_id: customId,
    style: resolvedParam.style ?? ButtonStyle.Primary,
    label: resolvedParam.label,
    disabled: resolvedParam.disabled ?? false,
    emoji: resolvedParam.emoji,
  };
};
