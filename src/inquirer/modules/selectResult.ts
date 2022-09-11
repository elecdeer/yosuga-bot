import { resolveLazy } from "../../util/lazy";

import type { Lazy } from "../../util/lazy";
import type { SelectResult, SelectState } from "../prompt/select";
import type { AnswerStatus } from "../types/prompt";

export const outputSelectResult =
  <TOption>(
    minValuesLazy: Lazy<number | undefined, SelectState<TOption>>,
    maxValuesLazy: Lazy<number | undefined, SelectState<TOption>>
  ) =>
  (state: SelectState<TOption>): AnswerStatus<SelectResult<TOption>> => {
    const selectedNum = state.select.filter((item) => item.selected).length;
    const minValues = resolveLazy(minValuesLazy, state) ?? 0;
    const maxValues = resolveLazy(maxValuesLazy, state) ?? state.select.length;

    if (selectedNum >= minValues && selectedNum <= maxValues) {
      return {
        status: "answered",
        value: state.select,
      };
    } else {
      return {
        status: "unanswered",
      };
    }
  };
