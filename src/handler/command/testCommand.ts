import { ChannelType, EmbedBuilder } from "discord.js";

import { buttonPrompt, inquire } from "../../inquirer";
import { createNewThreadMessenger } from "../../util/messenger/newThreadMessenger";

import type { CommandEvent, CommandProps } from "./index";

export const testCommandProps: CommandProps = {
  name: "test",
  description: "テスト",
  permission: "USER",
};

export const testCommandEvent: CommandEvent = {
  registerEvent: (eventFlow) => {
    eventFlow.on(async ({ interaction, yosuga, logger }) => {
      logger.debug("test command called");

      if (!interaction.inCachedGuild()) {
        return;
      }
      const channel = interaction.channel;

      if (channel === null || channel.type !== ChannelType.GuildText) return;

      const messenger = createNewThreadMessenger(
        channel,
        {
          name: "testThread",
        },
        (thread) => {
          if (thread !== null) {
            return {
              content: `<#${thread.id}>`,
            };
          } else {
            return {
              content: "スレッドを作成します",
            };
          }
        }
      );

      const { collector, controller } = await inquire(
        {
          button: buttonPrompt({
            button: {
              label: (value) => `Test ${value}`,
            },
          }),
        },
        {
          messenger: messenger,
          ephemeral: true,
          rootTarget: {
            type: "commandInteraction",
            interaction: interaction,
          },
          messageContent: new EmbedBuilder()
            .setTitle("Yosuga")
            .setDescription("Testコマンド")
            .toJSON(),
        }
      );

      const result = await collector.awaitAll();
      // await controller.repost({
      //   type: "channel",
      // });
      logger.trace("awaitAll()", result);
    });
  },
  slashOption: (builder) => builder,
};
