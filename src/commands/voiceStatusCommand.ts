import assert from "assert";
import { MessageEmbed } from "discord.js";

import { CommandContext } from "../commandContext";
import { CommandPermission } from "../permissionUtil";
import { CommandBase } from "./commandBase";

export class VoiceStatusCommand extends CommandBase {
  constructor() {
    super({
      name: "voice-status",
      description: "現在登録されているボイスを表示.",
      permission: CommandPermission.Everyone,
      messageCommand: {},
      interactionCommand: {},
    });
  }

  async execute(context: CommandContext): Promise<void> {
    if (context.session) {
      const voiceProvider = context.session.getVoiceProvider();
      const status = await voiceProvider.getSpeakersStatus();

      const embed = new MessageEmbed();
      embed.setDescription("現在のセッションでのボイスステータス");
      embed.setFields(
        status.map((item) => ({
          name: item.name,
          value: item.status,
        }))
      );

      await context.reply("plain", embed);
    } else {
      const configManager = context.configManager;
      const config = configManager.getMasterConfigAccessor();
      const voices = await config.get("speakerBuildOptions");
      assert(voices);

      const embed = new MessageEmbed();
      embed.setDescription("登録されているボイス名");
      embed.setFields(
        Object.values(voices).map((item) => ({
          name: item.voiceName,
          value: item.type,
        }))
      );
      await context.reply("plain", embed);
    }
  }
}
