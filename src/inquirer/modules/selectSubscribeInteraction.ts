import { ComponentType } from "discord.js";

import type { SelectAction } from "../types/action";
import type { SubscribeMessage } from "../types/prompt";

export const selectSubscribeInteraction =
  (customId: string): SubscribeMessage<SelectAction> =>
  (message, emitAction) => {
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.SelectMenu,
      filter: (button) => button.customId === customId,
    });

    collector.on("collect", async (interaction) => {
      emitAction({ type: "select", customId, selectedItems: interaction.values });
      await interaction.deferUpdate();
    });

    return () => {
      collector.stop();
    };
  };
