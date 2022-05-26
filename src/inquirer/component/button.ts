import { MessageActionRow, MessageButton } from "discord.js";

import { resolveLazy } from "../../util/lazy";
import { AnswerStatus, PromptComponentFactory } from "../promptTypes";

export const createButtonComponent: PromptComponentFactory<boolean> = (param) => {
  let status: AnswerStatus<boolean> = {
    status: "answered",
    value: resolveLazy(param.initial) ?? false,
  };

  return {
    getStatus: () => status,
    renderComponent: () => {
      return [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId("primary")
            .setStyle("PRIMARY")
            .setEmoji(status.status === "answered" && status.value ? "👍" : "👎")
        ),
      ];
    },
    hook: (message, hookParam, updateCallback) => {
      const collector = message.createMessageComponentCollector({
        time: hookParam.time,
        idle: hookParam.idle,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.customId !== "primary") {
          return;
        }

        status = {
          status: "answered",
          value: status.status === "answered" ? !status.value : true,
        };
        await interaction.deferUpdate();

        updateCallback();
      });

      collector.on("end", (_, reason) => {
        if (reason === "cleanHook") {
          return;
        }
        status = {
          status: "rejected",
          reason: "end",
        };
        updateCallback();
      });

      return () => {
        collector.stop("cleanHook");
      };
    },
  };
};
