import {
  Awaitable,
  ButtonInteraction,
  MappedInteractionTypes,
  MessageComponentInteraction,
  MessageComponentType,
  ModalSubmitInteraction,
  SelectMenuInteraction,
} from "discord.js";

import { Lazy, resolveLazy } from "../../util/lazy";
import { AnswerStatus, PromptComponent } from "../promptTypes";

export const messageInteractionHook = <TValue, TComponent extends MessageComponentType>(
  customId: string,
  componentType: TComponent,
  reducer: (
    interaction: MappedInteractionTypes[TComponent],
    prevStatus: AnswerStatus<TValue>
  ) => Awaitable<AnswerStatus<TValue>>,
  initialState: Lazy<AnswerStatus<TValue>>
): Pick<PromptComponent<TValue>, "hook" | "getStatus"> => {
  let status: AnswerStatus<TValue> = resolveLazy(initialState);

  return {
    hook: (message, param, updateCallback) => {
      const collector = message.createMessageComponentCollector({
        time: param.time,
        idle: param.idle,
        componentType: componentType,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.customId !== customId) return;
        if (!isMappedInteractionType(componentType, interaction)) return;

        await interaction.deferUpdate();
        status = await reducer(interaction, status);
        updateCallback();
      });

      const stopReason = "cleanHook";
      collector.on("end", (_, reason) => {
        if (reason === stopReason) {
          return;
        }

        updateCallback();
      });

      return () => {
        collector.stop(stopReason);
      };
    },
    getStatus: () => status,
  };
};

const isMappedInteractionType = <T extends MessageComponentType>(
  componentType: T,
  interaction:
    | MessageComponentInteraction
    | ButtonInteraction
    | SelectMenuInteraction
    | ModalSubmitInteraction
): interaction is MappedInteractionTypes<true>[T] => {
  return (
    (componentType == "BUTTON" && interaction.isButton()) ||
    (componentType == "SELECT_MENU" && interaction.isSelectMenu()) ||
    (componentType == "ACTION_ROW" && interaction.isMessageComponent()) ||
    (componentType == "TEXT_INPUT" && interaction.isModalSubmit())
  );
};
