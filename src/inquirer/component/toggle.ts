import { buttonHook } from "./buttonPart/buttonHook";
import { outputButtonComponent } from "./buttonPart/outputButtonComponent";
import { compositeComponentParts } from "./compositeComponent";

import type { AnswerStatus, PromptFactory, OutputResult, StateReducer } from "../promptTypes";
import type { ButtonParam } from "../wrapper/createButton";
import type { ButtonAction } from "./buttonPart/buttonHook";

export const createToggle = (param: {
  customId?: string;
  button: (value: boolean) => Omit<ButtonParam, "customId" | "type">;
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
