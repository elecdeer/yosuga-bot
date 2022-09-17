import { ChannelType, EmbedBuilder } from "discord.js";

import { buttonPrompt, inquire } from "../../inquirer";
import { createTextChannelMessenger } from "../../util/messenger/textChannelMessenger";
import { withLog } from "../../util/messenger/withLog";

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

      const messenger = withLog(createTextChannelMessenger(channel), logger);

      const { collector } = inquire(
        {
          button: buttonPrompt(),
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

      collector.all.on((status) => {
        logger.debug("all", status);
      });

      collector.one.button.on((state) => {
        logger.debug("one.button", state);
      });

      collector.some.on((value) => {
        logger.debug("some", value);
      });

      const result = await collector.allAnswered.wait();
      logger.debug("allAnswered", result);

    });
  },
  slashOption: (builder) => builder,
};
