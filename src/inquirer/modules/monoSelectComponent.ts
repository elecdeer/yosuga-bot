import { ComponentType } from "discord-api-types/payloads/v10/channel";

import { resolveLazy } from "../../util/lazy";

import type { LazyParam } from "../../util/lazy";
import type { SelectResult } from "../prompt/select";
import type { ComponentPayload, OutputComponent } from "../types/prompt";
import type { APIMessageComponentEmoji } from "discord-api-types/payloads/v10/channel";

export type SelectMenuOption<T> = {
  label: string;
  value: T;
  description?: string;
  emoji?: APIMessageComponentEmoji;
  default?: boolean;
};

//based APISelectMenuComponent
export type SelectParam<T> = {
  options: SelectMenuOption<T>[];
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
};

export const outputSelectComponent = <TState, TOption extends string>(
  customId: string,
  param: LazySelectParam<TOption, TState>
): OutputComponent<TState, SelectResult<TOption>> => {
  return (state, result) => {
    const { options, placeholder, minValues, maxValues, disabled } = resolveSelectParam<
      TState,
      TOption
    >(param, state);

    const payload: ComponentPayload = {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.SelectMenu,
          custom_id: customId,
          options: options,
          placeholder: placeholder,
          min_values: minValues,
          max_values: maxValues,
          disabled: disabled ?? false,
        },
      ],
    };

    return payload;
  };
};

export type LazySelectParam<TOption, TValue> = LazyParam<
  Omit<SelectParam<unknown>, "options">,
  TValue
> & {
  options: LazyParam<SelectMenuOption<TOption>, TValue, "label" | "description" | "emoji">[];
};

export const resolveSelectParam = <TState, TOption>(
  param: LazySelectParam<TOption, TState>,
  value: TState
): SelectParam<TOption> => {
  return {
    options: param.options.map((option) => ({
      label: resolveLazy(option.label, value),
      value: option.value,
      description: resolveLazy(option.description, value),
      emoji: resolveLazy(option.emoji, value),
      default: option.default,
    })),
    placeholder: resolveLazy(param.placeholder, value),
    minValues: resolveLazy(param.minValues, value),
    maxValues: resolveLazy(param.maxValues, value),
    disabled: resolveLazy(param.disabled, value),
  };
};
