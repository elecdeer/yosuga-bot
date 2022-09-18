import { ComponentType } from "discord.js";

import { useEffect } from "./useEffect";

import type { SelectMenuInteraction, Awaitable } from "discord.js";

export const useSelectInteraction = (
  customId: string,
  callback: (interaction: SelectMenuInteraction) => Awaitable<void>
) => {
  useEffect((message) => {
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.SelectMenu,
      filter: (component) => component.customId === customId,
    });

    collector.on("collect", async (interaction) => {
      await callback(interaction);
    });

    return () => {
      collector.stop();
    };
  });
};
