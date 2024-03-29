import { ComponentType } from "discord.js";

import type { ButtonAction } from "../types/action";
import type { SubscribeMessage } from "../types/prompt";

export const subscribeButtonInteraction =
  (customId: string): SubscribeMessage<ButtonAction> =>
  (message, emitAction) => {
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (button) => button.customId === customId,
    });

    collector.on("collect", async (interaction) => {
      emitAction({ type: "click", customId });
      await interaction.deferUpdate();
    });

    return () => {
      collector.stop();
    };
  };
