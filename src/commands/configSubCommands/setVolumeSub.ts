import { Snowflake } from "discord.js";

import { CommandContextSlash } from "../../commandContextSlash";
import { masterConfigDefault } from "../../configManager";
import { isInRange } from "../../util";
import { ConfigCommandLevel, ConfigSubCommand, isRequiredOption } from "./configSubCommand";

export class SetVolumeSub extends ConfigSubCommand {
  constructor(level: ConfigCommandLevel) {
    super(
      {
        name: "volume",
        description: "読み上げ音量の設定",
        options: [
          {
            name: "value",
            description: "音量（0 - 2）",
            type: "NUMBER",
            required: isRequiredOption(level),
          },
        ],
      },
      level
    );
  }

  override async execute(context: CommandContextSlash): Promise<void> {
    const options = context.getOptions();
    const configManager = context.configManager;

    const configKey = "masterVolume";
    const volume = options.getNumber("value") || undefined;

    if (volume && !isInRange(volume, 0, 2)) {
      await context.reply("error", "設定する値は0 ~ 2の範囲内である必要があります.");
      return;
    }

    const oldVolume = (await configManager.getMasterConfig())[configKey];

    const accessor:
      | { level: "MASTER" }
      | { level: "GUILD"; guildId: Snowflake }
      | { level: "USER"; userId: Snowflake } =
      this.level === "MASTER"
        ? {
            level: "MASTER",
          }
        : this.level === "GUILD"
        ? {
            level: "GUILD",
            guildId: context.guild.id,
          }
        : {
            level: "USER",
            userId: context.member.id,
          };

    await configManager.setConfig(accessor, configKey, volume);

    //この辺あんまり良くないけどしょうがない感じもする
    switch (this.level) {
      case "MASTER":
        await configManager.setMasterConfig(configKey, volume ?? masterConfigDefault[configKey]);
        break;
      case "GUILD":
        await configManager.setGuildConfig(context.guild.id, configKey, volume);
        break;
    }

    const newVolume = (await configManager.getMasterConfig())[configKey];

    await context.reply("plain", this.constructReplyEmbed(oldVolume, newVolume));
  }
}
