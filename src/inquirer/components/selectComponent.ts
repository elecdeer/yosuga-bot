import { ComponentType } from "discord-api-types/v10";
import { Collection } from "discord.js";

import { resolveLazy } from "../../util/lazy";

import type { LazyParam } from "../../util/lazy";
import type { AnswerStatus } from "../types/prompt";
import type { APIMessageComponentEmoji, APISelectMenuComponent } from "discord-api-types/v10";

//based APISelectMenuComponent
export type SelectMenuOption<T> = {
  label: string;
  value: T;
  description?: string;
  emoji?: APIMessageComponentEmoji;
  default?: boolean;
};

export type SelectParam = {
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
};

export type SelectParamWithOption<T> = SelectParam & {
  options: SelectMenuOption<T>[];
};

export type LazySelectParam<TOption, TValue> = SelectParam & {
  options: LazyParam<SelectMenuOption<TOption>, TValue, "label" | "description" | "emoji">[];
};

export const resolveSelectParam = <TOption, TValue>(
  param: LazySelectParam<TOption, TValue>,
  value: TValue
): SelectParamWithOption<TOption> => {
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

type ValueBase = AnswerStatus<
  {
    value: unknown;
    selected: boolean;
  }[]
>;

export const selectComponent = <TValue extends ValueBase>(
  customId: string,
  param: LazySelectParam<string, TValue>,
  value: TValue
): APISelectMenuComponent => {
  const { options, placeholder, minValues, maxValues, disabled } = resolveSelectParam(param, value);

  return {
    type: ComponentType.SelectMenu,
    custom_id: customId,
    options: options.map((option) => ({
      ...option,

      default:
        option.default ??
        value.value?.find((item) => item.value === option.value)?.selected ??
        false,
    })),
    placeholder: placeholder,
    min_values: minValues ?? 1,
    max_values: maxValues ?? 1,
    disabled: disabled ?? false,
  };
};

export const createValueTable = <TOption>(
  keyPrefix: string,
  options: Pick<SelectMenuOption<TOption>, "value">[]
) => {
  const entries = options.map((option, index) => [`${keyPrefix}-${index}`, option.value] as const);

  const keyToOptionTable = new Collection<string, TOption>(entries);
  const optionToKeyTable = new Collection<TOption, string>(
    entries.map(([key, option]) => [option, key])
  );

  const keyToOptionValue = (key: string): TOption => {
    const option = keyToOptionTable.get(key);
    if (option === undefined) throw new Error(`Invalid option key: ${key}`);
    return option;
  };

  const optionValueToKey = (option: TOption): string => {
    const key = optionToKeyTable.get(option);
    if (key === undefined) throw new Error(`Invalid option value: ${option}`);
    return key;
  };

  return {
    keyToOptionValue,
    optionValueToKey,
  };
};

//あんまりイケてない
//TODO テーブルの変換はprompt側でやった方がいいかも

export const valueTabledSelectComponent = <TOption, TValue extends ValueBase>(
  customId: string,
  param: LazySelectParam<TOption, TValue>
) => {
  return (value: TValue) => {
    const { optionValueToKey, keyToOptionValue } = createValueTable(customId, param.options);

    const resolved = resolveSelectParam(param, value);

    return {
      component: selectComponent(
        customId,
        {
          ...resolved,
          options: resolved.options.map((option) => ({
            ...option,
            value: optionValueToKey(option.value),
            default: value.value?.find((item) => item.value === option.value)?.selected ?? false,
          })),
        },
        value
      ),
      keyToOptionValue,
      optionValueToKey,
    };
  };
};
