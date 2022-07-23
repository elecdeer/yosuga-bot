import { resolveLazy } from "../../../util/lazy";

import type { LazyParam } from "../../../util/lazy";
import type { OutputComponentParam } from "../../promptTypes";
import type { EmojiIdentifierResolvable } from "discord.js";

export type SelectParam<TOptionValue> = {
  options: SelectOption<TOptionValue>[];
  placeholder?: string;
  disabled?: boolean;
  maxValues?: number;
  minValues?: number;
};

export type LazySelectParam<TOptionValue, TResult> = LazyParam<
  Omit<SelectParam<unknown>, "options">,
  TResult,
  "placeholder" | "maxValues" | "disabled"
> & {
  options: LazySelectOption<TOptionValue, TResult>[];
};

export type SelectOption<TValue> = {
  label: string;
  value: TValue;
  default?: boolean;
  description?: string;
  emoji?: EmojiIdentifierResolvable;
  inactive?: boolean;
};

export type LazySelectOption<TOptionValue, TState> = LazyParam<
  SelectOption<TOptionValue>,
  TState,
  Exclude<keyof SelectOption<TOptionValue>, "value" | "default">
>;

//createSelectの引数とここのparamは別?
//stateの値によって表示するoptionをフィルタする
//optionのvalueとかの置換をどこでやるべきか...?
//変換テーブルもstateに載っけてしまうのがいい気がする
//valueにはMap等のイミュータブルな値が入っても問題無い
export const outputSelectComponent =
  <TOptionValue extends string, TResult>(
    customId: string,
    param: LazySelectParam<TOptionValue, TResult>
  ): OutputComponentParam<TOptionValue[], TResult> =>
  (state, result) => {
    const { options, ...restParam } = resolveSelectParam(param, result);
    return [
      [
        {
          ...restParam,
          options: options.map((option) => {
            return {
              ...option,
              default: state.includes(option.value),
            };
          }),
          type: "SELECT_MENU",
          customId: customId,
        },
      ],
    ];
  };

export const resolveSelectParam = <TState, TResult>(
  param: LazySelectParam<TState, TResult>,
  value: TResult
): SelectParam<TState> => {
  return {
    options: param.options.map((option) => resolveSelectOption(option, value)),
    placeholder: resolveLazy(param.placeholder, value),
    disabled: resolveLazy(param.disabled, value),
    maxValues: resolveLazy(param.maxValues, value),
    minValues: resolveLazy(param.minValues, value),
  };
};

export const resolveSelectOption = <TState, TResult>(
  param: LazySelectOption<TState, TResult>,
  value: TResult
): SelectOption<TState> => {
  return {
    label: resolveLazy(param.label, value),
    value: param.value,
    default: param.default,
    description: resolveLazy(param.description, value),
    emoji: resolveLazy(param.emoji, value),
    inactive: resolveLazy(param.inactive, value),
  };
};
