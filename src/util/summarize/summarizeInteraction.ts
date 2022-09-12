import { ChannelType } from "discord-api-types/payloads/v10";
import { InteractionType } from "discord-api-types/v10";

import type { BaseInteraction } from "discord.js";

export const summarizeInteraction = (interaction: BaseInteraction) => {
  const base = {
    id: interaction.id,
    type: InteractionType[interaction.type],
    guildId: interaction.guildId,
    channelId: interaction.channelId,
    channelType: interaction.channel && ChannelType[interaction.channel.type],
    userId: interaction.user.id,
  };

  if (interaction.isCommand()) {
    return {
      ...base,
      commandName: interaction.commandName,
      commandId: interaction.commandId,
      options: interaction.options.data,
    };
  }

  if (interaction.isSelectMenu()) {
    return {
      ...base,
      customId: interaction.customId,
      values: interaction.values,
    };
  }

  if (interaction.isButton()) {
    return {
      ...base,
      customId: interaction.customId,
      componentType: interaction.componentType,
    };
  }

  if (interaction.isModalSubmit()) {
    return {
      ...base,
      customId: interaction.customId,
      values: interaction.fields.fields,
    };
  }

  return base;
};
