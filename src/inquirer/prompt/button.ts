import { composePrompt } from "../composePrompt";
import { outputButtonComponent } from "../modules/buttonComponent";
import { buttonReducer } from "../modules/buttonReducer";
import { outputButtonResult } from "../modules/buttonResult";
import { subscribeButtonInteraction } from "../modules/buttonSubscribeInteraction";

import type { LazyParam } from "../../util/lazy";
import type { ButtonParam } from "../modules/buttonComponent";
import type { PromptFactory } from "../types/prompt";

export const buttonPrompt = (param: {
  customId?: string;
  button: LazyParam<ButtonParam, number>;
  initialNumber?: number;
}): PromptFactory<void> => {
  const { customId = "button", button, initialNumber = 0 } = param;
  return composePrompt({
    initialState: initialNumber,
    subscribeMessages: [subscribeButtonInteraction(customId)],
    stateReducer: buttonReducer,
    outputResult: outputButtonResult,
    outputComponentParam: outputButtonComponent(customId, button),
  });
};
