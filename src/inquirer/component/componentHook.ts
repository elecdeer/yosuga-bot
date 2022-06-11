import type { PromptComponent, PromptController } from "../promptTypes";
import type {
  Awaitable,
  ButtonInteraction,
  MappedInteractionTypes,
  MessageComponentInteraction,
  MessageComponentType,
  ModalSubmitInteraction,
  SelectMenuInteraction,
} from "discord.js";

export const componentHook =
  <TComponent extends MessageComponentType>(componentType: TComponent) =>
  (param: {
    customId: string;
    onInteraction: (param: {
      interaction: MappedInteractionTypes[TComponent];
      updateCallback: () => void;
      controller: PromptController;
    }) => Awaitable<boolean>;
    onEnd: (reason: string) => Awaitable<boolean>;
  }): PromptComponent<unknown>["hook"] => {
    const { customId, onInteraction, onEnd } = param;

    return ({ message, promptParam, updateCallback, controller }) => {
      const collector = message.createMessageComponentCollector({
        time: promptParam.time,
        idle: promptParam.idle,
        componentType: componentType,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.customId !== customId) return;
        if (!isMappedInteractionType(componentType, interaction)) return;

        const shouldUpdate = await onInteraction({
          interaction: interaction,
          updateCallback: updateCallback,
          controller: controller,
        });
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();
        if (shouldUpdate) {
          updateCallback();
        }
      });

      const stopReason = `${customId}-cleanHook`;
      collector.on("end", async (_, reason) => {
        if (reason === stopReason) {
          return;
        }

        const shouldUpdate = await onEnd(reason);
        if (shouldUpdate) {
          updateCallback();
        }
      });

      return () => {
        collector.stop(stopReason);
      };
    };
  };

export const buttonComponentHook = componentHook("BUTTON");
export const selectMenuComponentHook = componentHook("SELECT_MENU");
export const textInputComponentHook = componentHook("TEXT_INPUT");

export const isMappedInteractionType = <T extends MessageComponentType>(
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
