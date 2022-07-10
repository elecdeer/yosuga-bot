import { buttonHook } from "./buttonPart/buttonHook";
import { outputButtonComponent } from "./buttonPart/outputButtonComponent";
import { compositeComponentParts } from "./compositeComponent";

import type { LazyParam } from "../../util/lazy";
import type { AnswerStatus, PromptFactory, OutputResult, StateReducer } from "../promptTypes";
import type { ButtonAction } from "./buttonPart/buttonHook";
import type { ButtonParam } from "./buttonPart/outputButtonComponent";

export const createToggle = (param: {
  customId?: string;
  button: LazyParam<ButtonParam, State>;
  initialState?: boolean;
}): PromptFactory<boolean> => {
  const { customId = "toggle", button, initialState } = param;
  return compositeComponentParts((hookParam) => ({
    initialState: initialState ?? false,
    hookMessages: [buttonHook(customId, hookParam)],
    stateReducer: booleanToggleReducer,
    outputResult: outputToggleState,
    outputComponentParam: outputButtonComponent(customId, button),
  }));
};

type State = boolean;
type Action = ButtonAction;

export const booleanToggleReducer: StateReducer<State, Action> = (prev, action) => {
  if (action.type === "click") {
    return !prev;
  }
  return prev;
};

export const outputToggleState: OutputResult<State, boolean> = (
  value: boolean
): AnswerStatus<boolean> => {
  return {
    status: "answered",
    value,
  };
};
