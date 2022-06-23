import { compositeComponentParts } from "./compositeComponent";
import { hookButtonInteraction } from "./hookInteraction";

import type {
  AnswerStatus,
  PromptFactory,
  PromptParamHook,
  OutputComponentParam,
  OutputResult,
  StateReducer,
} from "../promptTypes";
import type { ButtonParam } from "../wrapper/createButton";

type Action =
  | {
      type: "toggle";
    }
  | {
      type: "end";
    };

export const createToggle = (param: {
  customId?: string;
  button: (value: boolean) => Omit<ButtonParam, "customId" | "type">;
  initialState?: boolean;
}): PromptFactory<boolean> => {
  const { customId = "toggle", button, initialState } = param;
  return compositeComponentParts((hookParam) => ({
    initialState: initialState ?? false,
    hookMessages: [toggleHook(customId, hookParam)],
    stateReducer: booleanToggleReducer,
    outputResult: outputToggleState,
    outputComponentParam: outputToggleComponentParam(customId, button),
  }));
};

type State = boolean;

export const toggleHook = (customId: string, hookParam: PromptParamHook) => {
  return hookButtonInteraction<Action>(customId, hookParam, async (interaction, emitAction) => {
    await interaction.deferUpdate();
    emitAction({ type: "toggle" });
  });
};

export const booleanToggleReducer: StateReducer<State, Action> = (prev, action) => {
  if (action.type === "toggle") {
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

export const outputToggleComponentParam =
  (
    customId: string,
    param: (value: boolean) => Omit<ButtonParam, "customId" | "type">
  ): OutputComponentParam<State> =>
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
