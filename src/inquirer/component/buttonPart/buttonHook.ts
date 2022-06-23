import { hookButtonInteraction } from "../hookInteraction";

import type { PromptParamHook } from "../../promptTypes";

export type ButtonAction = {
  type: "click";
};

export const buttonHook = (customId: string, hookParam: PromptParamHook) => {
  return hookButtonInteraction<ButtonAction>(
    customId,
    hookParam,
    async (interaction, emitAction) => {
      emitAction({ type: "click" });
      await interaction.deferUpdate();
    }
  );
};
