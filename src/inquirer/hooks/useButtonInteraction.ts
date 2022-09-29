import { ComponentType } from "discord.js";

import { getLogger } from "../../logger";
import { summarizeMessage } from "../../util/summarize";
import { useEffect } from "./useEffect";

import type { ButtonInteraction, Awaitable } from "discord.js";

const logger = getLogger("useButtonInteraction");

export const useButtonInteraction = (
  customId: string,
  callback: (interaction: ButtonInteraction) => Awaitable<void>
) => {
  useEffect((message) => {
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (component) => component.customId === customId,
    });
    logger.trace("hook button interaction", {
      customId,
      message: summarizeMessage(message),
    });

    collector.on("collect", async (interaction) => {
      await callback(interaction);
    });

    return () => {
      collector.stop();
    };
  });
};
