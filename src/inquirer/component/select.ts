import { compositeComponentParts } from "./compositeComponent";
import { outputSelectComponent } from "./selectPart/outputSelectComponent";
import { selectHook } from "./selectPart/selectHook";

import type { AnswerStatus, PromptFactory } from "../promptTypes";
import type { LazySelectParam } from "./selectPart/outputSelectComponent";
import type { SelectAction } from "./selectPart/selectHook";
import { withObjectValueOption } from "./selectPart/withObjectValueOption";

//TODO optionのvalueを置き換える高階関数を作る

export const createSelect = <TOptionValue>(param: {
  customId?: string;
  select: LazySelectParam<TOptionValue, TOptionValue[]>;
}): PromptFactory<TOptionValue[]> => {
  const entries: [string, TOptionValue][] = param.select.options.map((option, index) => [
    `${param.customId}-${index}`,
    option.value,
  ]);

  const replacedParam: LazySelectParam<string, TOptionValue[]> = {
    ...param.select,
    options: param.select.options.map((option, index) => ({
      ...option,
      value: `${param.customId}-${index}`,
    })),
  };
  return withObjectValueOption<string[], TOptionValue>(
    createStringSelect({
      ...param,
      select: replacedParam,
    }),
    entries
  );
};

export const createStringSelect = <TOptionValue extends string, TResult>(param: {
  customId?: string;
  select: LazySelectParam<TOptionValue, TResult>;
  //TODO 回答数0でも回答済みにするかどうかのパラメータを追加する
}): PromptFactory<TResult> => {
  const { customId = "select", select } = param;

  return compositeComponentParts<TResult, Action, TOptionValue[]>((hookParam) => ({
    initialState: select.options
      .filter((option) => option.default === true)
      .map((option) => option.value),
    hookMessages: [selectHook(customId, hookParam)],
    stateReducer: selectReducer,
    outputResult: outputSelectState(select.minValues ?? 1),
    outputComponentParam: outputSelectComponent<TOptionValue, TResult>(customId, select),
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
