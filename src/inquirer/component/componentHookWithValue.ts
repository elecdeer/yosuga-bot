import { resolveLazy } from "../../util/lazy";

import type { Lazy } from "../../util/lazy";
import type { PromptComponent } from "../promptTypes";
import type {
  Awaitable,
  ButtonInteraction,
  MappedInteractionTypes,
  MessageComponentInteraction,
  MessageComponentType,
  ModalSubmitInteraction,
  SelectMenuInteraction,
} from "discord.js";

export const componentHookWithValue =
  <TComponent extends MessageComponentType>(componentType: TComponent) =>
  <TValue>(param: {
    customId: string;
    reducer: (
      interaction: MappedInteractionTypes[TComponent],
      prevStatus: TValue | null
    ) => Awaitable<TValue | null>;
    initialState?: Lazy<TValue | null>;
  }): Pick<PromptComponent<TValue>, "hook" | "getStatus"> & {
    getRawValue: () => TValue | null;
  } => {
    const { customId, reducer, initialState } = param;
    let status: TValue | null = initialState === undefined ? null : resolveLazy(initialState);

    return {
      hook: (message, hookParam, updateCallback) => {
        const collector = message.createMessageComponentCollector({
          time: hookParam.time,
          idle: hookParam.idle,
          componentType: componentType,
        });

        collector.on("collect", async (interaction) => {
          if (interaction.customId !== customId) return;
          if (!isMappedInteractionType(componentType, interaction)) return;

          status = await reducer(interaction, status);
          if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();
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
      getRawValue: () => status,
      getStatus: () => {
        if (status !== null) {
          return {
            status: "answered",
            value: status,
          };
        } else {
          return {
            status: "unanswered",
          };
        }
      },
    };
  };

export const buttonInteractionHookValue = componentHookWithValue("BUTTON");
export const selectMenuInteractionHookValue = componentHookWithValue("SELECT_MENU");
export const textInputInteractionHookValue = componentHookWithValue("TEXT_INPUT");

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
