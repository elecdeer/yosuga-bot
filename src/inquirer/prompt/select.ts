import { composePrompt } from "../composePrompt";
import { outputSelectComponent } from "../modules/monoSelectComponent";
import { selectSubscribeInteraction } from "../modules/selectSubscribeInteraction";

import type { LazySelectParam } from "../modules/monoSelectComponent";
import type { PromptFactory } from "../types/prompt";

export const selectPrompt = <TOption extends string>(param: {
  customId?: string;
  select: LazySelectParam<TOption, SelectState>;
}): PromptFactory<SelectResult> => {
  const { customId = "select", select } = param;
  const initialState: SelectState = select.options.map((option) => ({
    value: option.value,
    selected: option.default ?? false,
  }));

  return composePrompt({
    initialState: initialState,
    subscribeMessages: [selectSubscribeInteraction(customId)],
    stateReducer: selectReducer,
    outputResult: outputSelectResult,
    outputComponentParam: outputSelectComponent(customId, select),
  });
};

type SelectState = SelectResult;

export type SelectResult<T = string> = {
  selected: boolean;
  value: T;
}[];
