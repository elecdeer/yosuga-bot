import { compositeComponentParts } from "./compositeComponent";
import { outputSelectComponent } from "./selectPart/outputSelectComponent";
import { selectHook } from "./selectPart/selectHook";

import type { AnswerStatus, PromptFactory } from "../promptTypes";
import type { LazySelectParam } from "./selectPart/outputSelectComponent";
import type { SelectAction } from "./selectPart/selectHook";

//TODO optionのvalueを置き換える高階関数を作る

export const createSelect = <TOptionValue extends string>(param: {
  customId?: string;
  select: LazySelectParam<TOptionValue, TOptionValue[]>;
  //TODO 回答数0でも回答済みにするかどうかのパラメータを追加する
}): PromptFactory<TOptionValue[]> => {
  const { customId = "select", select } = param;

  return compositeComponentParts<TOptionValue[], Action, TOptionValue[]>((hookParam) => ({
    initialState: select.options
      .filter((option) => option.default === true)
      .map((option) => option.value),
    hookMessages: [selectHook(customId, hookParam)],
    stateReducer: selectReducer,
    outputResult: outputSelectState(select.minValues ?? 1),
    outputComponentParam: outputSelectComponent<TOptionValue>(customId, select),
  }));
};

type Action = SelectAction;

export const selectReducer = <TState extends string[]>(state: TState, action: Action): TState => {
  if (action.type === "select") {
    return action.selectedItems as TState;
  }
  return state;
};

export const outputSelectState =
  (minValues: number) =>
  <TState extends string[]>(state: TState): AnswerStatus<TState> => {
    if (state.length >= minValues) {
      return {
        status: "answered",
        value: state,
      };
    } else {
      return {
        status: "unanswered",
      };
    }
  };
