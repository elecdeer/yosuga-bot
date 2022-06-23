import type { HookMessage, PromptParamHook } from "../promptTypes";
import type { Awaitable, MappedInteractionTypes, MessageComponentType } from "discord.js";

export const hookInteraction =
  <TComponent extends MessageComponentType>(componentType: TComponent) =>
  <TAction>(
    customId: string,
    hookParam: PromptParamHook,
    onInteraction: (
      interaction: MappedInteractionTypes[TComponent],
      emitAction: (action: TAction) => void
    ) => Awaitable<void>,
    onEnd: (emitAction: (action: TAction) => void) => Awaitable<void>
  ): HookMessage<TAction> =>
  (message, emitAction) => {
    const collector = message.createMessageComponentCollector({
      time: hookParam.time,
      idle: hookParam.idle,
      componentType: componentType,
    });

    collector.on("collect", async (interaction) => {
      if (interaction.customId !== customId) return;
      await onInteraction(interaction, emitAction);
    });

    const stopReason = `${customId}-cleanHook`;
    collector.on("end", async (collected, reason) => {
      if (reason === stopReason) return;
      await onEnd(emitAction);
    });

    return () => {
      collector.stop(stopReason);
    };
  };

export const hookButtonInteraction = hookInteraction("BUTTON");
export const hookSelectInteraction = hookInteraction("SELECT_MENU");
export const hookInputInteraction = hookInteraction("TEXT_INPUT");
