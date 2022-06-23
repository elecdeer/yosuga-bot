import { hookSelectInteraction } from "../hookInteraction";

import type { PromptParamHook } from "../../promptTypes";

export type SelectAction = {
  type: "select";
  selectedItems: string[];
};

export const selectHook = (customId: string, hookParam: PromptParamHook) => {
  return hookSelectInteraction(customId, hookParam, async (interaction, emitAction) => {
    emitAction({ type: "select", selectedItems: interaction.values });
    await interaction.deferUpdate();
  });
};
