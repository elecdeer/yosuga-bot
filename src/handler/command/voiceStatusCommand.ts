import assert from "assert";
import { MessageEmbed } from "discord.js";

import { CommandPermission } from "../../application/permission";
import { CommandContext } from "../../commandContext";
import { YosugaClient } from "../../yosugaClient";
import { CommandHandler, CommandProps } from "../base/commandHandler";

export class VoiceStatusCommand extends CommandHandler {
  constructor(yosuga: YosugaClient) {
    super(yosuga);
  }

  protected initCommandProps(): CommandProps {
    return {
      name: "voice-status",
      description: "現在登録されているボイスを表示する.",
      permission: CommandPermission.Everyone,
    };
  }

  async execute(context: CommandContext): Promise<void> {
    const configManager = context.configManager;
    const config = configManager.getMasterConfigAccessor();
    const voices = await config.get("speakerBuildOptions");
    if (!voices || Object.values(voices).length < 1) {
      await context.reply({
        type: "warn",
        content: "ボイスが登録されていません",
      });
      return;
    }

    if (context.session) {
      const voiceProvider = context.session.voiceProvider;
      const status = await voiceProvider.getSpeakersStatus();

      const embed = new MessageEmbed();
      embed.setDescription("現在のセッションでのボイスステータス");
      embed.setFields(
        status.map((item) => ({
          name: item.name,
          value: item.status,
          inline: true,
        }))
      );

      await context.reply({
        content: embed,
      });
    } else {
      assert(voices);

      const embed = new MessageEmbed();
      embed.setDescription("登録されているボイス名");
      embed.setFields(
        Object.values(voices).map((item) => ({
          name: item.voiceName,
          value: item.type,
          inline: true,
        }))
      );
      await context.reply({
        content: embed,
      });
    }
  }
}
