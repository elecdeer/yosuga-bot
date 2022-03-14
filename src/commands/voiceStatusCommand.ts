import assert from "assert";
import { MessageEmbed } from "discord.js";
import { getLogger } from "log4js";

import { CommandPermission } from "../application/permissionUtil";
import { CommandContext } from "../commandContext";
import { CommandBase } from "./commandBase";

const logger = getLogger("VoiceStatusCommand");

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
    const configManager = context.configManager;
    const config = configManager.getMasterConfigAccessor();
    const voices = await config.get("speakerBuildOptions");
    if (!voices || Object.values(voices).length < 1) {
      await context.reply("warn", "ボイスが登録されていません");
      return;
    }

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
