import { composePrompt } from "../composePrompt";
import { outputButtonComponent } from "../modules/buttonComponent";
import { outputButtonResult } from "../modules/buttonResult";
import { subscribeButtonInteraction } from "../modules/buttonSubscribeInteraction";
import { monoButtonReducer } from "../modules/monoButtonReducer";

import type { LazyParam } from "../../util/lazy";
import type { ButtonParam } from "../modules/buttonComponent";
import type { PromptFactory } from "../types/prompt";

export const buttonPrompt = (param: {
  customId?: string;
  button: LazyParam<ButtonParam, number>;
  initialClickCount?: number;
}): PromptFactory<void> => {
  const { customId = "button", button, initialClickCount = 0 } = param;
  return composePrompt({
    initialState: initialClickCount,
    subscribeMessages: [subscribeButtonInteraction(customId)],
    stateReducer: monoButtonReducer,
    outputResult: outputButtonResult,
    outputComponentParam: outputButtonComponent(customId, button),
  });
};
