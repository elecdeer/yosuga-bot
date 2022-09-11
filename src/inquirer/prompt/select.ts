import { composePrompt } from "../composePrompt";
import { outputMonoSelectComponent } from "../modules/monoSelectComponent";
import { monoSelectReducer } from "../modules/monoSelectReducer";
import { outputSelectResult } from "../modules/selectResult";
import { selectSubscribeInteraction } from "../modules/selectSubscribeInteraction";

import type { LazySelectParam } from "../modules/monoSelectComponent";
import type { PromptFactory } from "../types/prompt";

export const selectPrompt = <TOption extends string>(param: {
  customId?: string;
  select: LazySelectParam<TOption, SelectState>;
}): PromptFactory<SelectResult<TOption>> => {
  const { customId = "select", select } = param;
  const initialState: SelectState<TOption> = {
    select: select.options.map((option) => ({
      value: option.value,
      selected: option.default ?? false,
    })),
  };

  return composePrompt({
    initialState: initialState,
    subscribeMessages: [selectSubscribeInteraction(customId)],
    stateReducer: monoSelectReducer,
    outputResult: outputSelectResult<TOption>(select.minValues, select.maxValues),
    outputComponentParam: outputMonoSelectComponent(customId, select),
  });
};

export type OptionSelectedState<T = string> = {
  selected: boolean;
  value: T;
}[];

export type SelectState<T = string> = {
  select: OptionSelectedState<T>;
};
export type SelectResult<T = string> = OptionSelectedState<T>;
