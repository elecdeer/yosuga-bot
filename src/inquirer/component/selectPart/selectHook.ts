import { hookSelectInteraction } from "../hookInteraction";

import type { PromptParamHook } from "../../promptTypes";

export type SelectAction = {
  type: "select";
  selectedItems: string[];
  customId: string;
};

export const selectHook = (customId: string, hookParam: PromptParamHook) => {
  return hookSelectInteraction<SelectAction>(
    customId,
    hookParam,
    async (interaction, emitAction) => {
      emitAction({ type: "select", selectedItems: interaction.values, customId });
      await interaction.deferUpdate();
    }
  );
};
