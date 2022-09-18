import { ComponentType } from "discord.js";

import { useEffect } from "./useEffect";

import type { ButtonInteraction, Awaitable } from "discord.js";

export const useButtonInteraction = (
  customId: string,
  callback: (interaction: ButtonInteraction) => Awaitable<void>
) => {
  useEffect((message) => {
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
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
