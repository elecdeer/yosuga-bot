import { InteractionButtonOptions, MessageActionRow, MessageButton } from "discord.js";

import { Lazy, resolveLazy } from "../../util/lazy";
import { AnswerStatus, PromptComponent } from "../promptTypes";

type ButtonParam = Partial<Omit<InteractionButtonOptions, "type">>;

export const createButtonComponent = (param: {
  button: ButtonParam;
  initial?: Lazy<boolean>;
}): PromptComponent<boolean> => {
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
            .setEmoji(status.value ? "👍" : "👎")
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
          value: status.value ?? false,
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

const createButton = (param: ButtonParam): MessageButton => {
  const button = new MessageButton();
  button.setCustomId(param.customId ?? "button");
  if (param.disabled) button.setDisabled(param.disabled);
  if (param.emoji) button.setEmoji(param.emoji);
  button.setLabel(param.label ?? "");
  button.setStyle(param.style ?? "PRIMARY");
  return button;
};
