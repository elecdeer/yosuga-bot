import { resolveLazy } from "../../../util/lazy";

import type { LazyParam } from "../../../util/lazy";
import type { OutputComponentParam } from "../../promptTypes";
import type { EmojiIdentifierResolvable } from "discord.js";

export type SelectParam<TValue extends string> = {
  options: SelectOption<TValue>[];
  placeholder?: string;
  disabled?: boolean;
  maxValues?: number;
  minValues?: number;
};

export type LazySelectParam<TValue extends string, TState> = LazyParam<
  Omit<SelectParam<TValue>, "options">,
  TState,
  "placeholder" | "maxValues" | "disabled"
> & {
  options: LazySelectOption<TValue, TState>[];
};

export type SelectOption<TValue extends string> = {
  label: string;
  value: TValue;
  default?: boolean;
  description?: string;
  emoji?: EmojiIdentifierResolvable;
  inactive?: boolean;
};

export type LazySelectOption<TValue extends string, TState> = LazyParam<
  SelectOption<TValue>,
  TState,
  Exclude<keyof SelectOption<TValue>, "value" | "default">
>;

//createSelectの引数とここのparamは別?
//stateの値によって表示するoptionをフィルタする
//optionのvalueとかの置換をどこでやるべきか...?
//変換テーブルもstateに載っけてしまうのがいい気がする
//valueにはMap等のイミュータブルな値が入っても問題無い
export const outputSelectComponent =
  <TState extends string>(
    customId: string,
    param: LazySelectParam<TState, TState[]>
  ): OutputComponentParam<TState[]> =>
  (state) => {
    const { options, ...restParam } = resolveSelectParam(param, state);
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

export const resolveSelectParam = <TState extends string>(
  param: LazySelectParam<TState, TState[]>,
  value: TState[]
): SelectParam<TState> => {
  return {
    options: param.options.map((option) => resolveSelectOption(option, value)),
    placeholder: resolveLazy(param.placeholder, value),
    disabled: resolveLazy(param.disabled, value),
    maxValues: resolveLazy(param.maxValues, value),
    minValues: resolveLazy(param.minValues, value),
  };
};

export const resolveSelectOption = <TState extends string>(
  param: LazySelectOption<TState, TState[]>,
  value: TState[]
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
