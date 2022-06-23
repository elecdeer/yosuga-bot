import { compositeComponentParts } from "./compositeComponent";
import { hookButtonInteraction } from "./hookInteraction";

import type {
  OutputComponentParam,
  OutputResult,
  PromptFactory,
  PromptParamHook,
  StateReducer,
} from "../promptTypes";
import type { ButtonParam } from "../wrapper/createButton";

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
    outputComponentParam: outputButtonComponent(customId, button),
  }));
};

type State = boolean;

type Action = {
  type: "click";
};

const buttonHook = (customId: string, hookParam: PromptParamHook) => {
  return hookButtonInteraction<Action>(customId, hookParam, async (interaction, emitAction) => {
    await interaction.deferUpdate();
    emitAction({ type: "click" });
  });
};

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

export const outputButtonComponent =
  <TState>(
    customId: string,
    param: (value: TState) => Omit<ButtonParam, "customId" | "type">
  ): OutputComponentParam<TState> =>
  (value) => {
    return [
      [
        {
          ...param(value),
          type: "BUTTON",
          customId: customId,
        },
      ],
    ];
  };
