import { buttonHook } from "./buttonPart/buttonHook";
import { outputButtonComponent } from "./buttonPart/outputButtonComponent";
import { compositeComponentParts } from "./compositeComponent";

import type { OutputResult, PromptFactory, StateReducer } from "../promptTypes";
import type { ButtonParam } from "../wrapper/createButton";
import type { ButtonAction } from "./buttonPart/buttonHook";

export const createButton = (param: {
  customId?: string;
  button: (value: boolean) => Omit<ButtonParam, "customId" | "type">;
  initialAnswered?: boolean;
}): PromptFactory<void> => {
  const { customId = "button", button, initialAnswered } = param;
  return compositeComponentParts((hookParam) => ({
    initialState: initialAnswered ?? false,
    hookMessages: [buttonHook(customId, hookParam)],
    stateReducer: buttonReducer,
    outputResult: outputButtonState,
    outputComponentParam: outputButtonComponent<boolean>(customId, button),
  }));
};

type State = boolean;
type Action = ButtonAction;

export const buttonReducer: StateReducer<State, Action> = (state, action) => {
  if (action.type === "click") {
    return true;
  }
  return state;
};

export const outputButtonState: OutputResult<State, void> = (state: State) => {
  if (state) {
    return {
      status: "answered",
      value: undefined,
    };
  } else {
    return {
      status: "unanswered",
    };
  }
};
