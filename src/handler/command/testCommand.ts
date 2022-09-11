import { ChannelType, EmbedBuilder } from "discord.js";

import { buttonPrompt, inquire, selectPrompt } from "../../inquirer";
import { createTextChannelMessenger } from "../../util/messenger/textChannelMessenger";

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

      const messenger = createTextChannelMessenger(channel);

      const { collector, controller } = await inquire(
        {
          button: buttonPrompt({
            button: {
              label: (value) => `Test ${value}`,
            },
          }),
          select: selectPrompt({
            select: {
              options: [
                {
                  label: "ItemA",
                  value: "A",
                  description: "This is ItemA",
                  default: true,
                },
                {
                  label: "ItemB",
                  value: "B",
                  description: "This is ItemB",
                  default: false,
                },
              ],
              minValues: 1,
              maxValues: 2,
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

      collector.onUpdateOne("select", (state) => {
        logger.trace("select state updated", state);
      });

      const result = await collector.awaitAll();
      // await controller.repost({
      //   type: "channel",
      // });
      logger.trace("awaitAll()", result);
    });
  },
  slashOption: (builder) => builder,
};
