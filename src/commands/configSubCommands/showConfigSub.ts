import { EmbedFieldData, MessageEmbed } from "discord.js";
import { getLogger } from "log4js";
import { ValueOf } from "type-fest";

import { CommandContextSlash } from "../../commandContextSlash";
import { MasterConfig, UserConfig } from "../../config/configManager";
import { stringifyConfigEntry } from "../../config/conifgUtil";
import { SpeakerBuildOption } from "../../speaker/voiceProvider";
import { SpeakerOption } from "../../types";
import { ConfigSubCommand } from "./configSubCommand";
import { ConfigCommandLevel } from "./setConfigSubCommand";

const logger = getLogger("command");

export class ShowConfigSub extends ConfigSubCommand<UserConfig> {
  constructor(level: ConfigCommandLevel) {
    super(
      {
        name: "show",
        description: "現在の設定を表示",
      },
      level
    );
  }

  async execute(context: CommandContextSlash): Promise<void> {
    const accessor = this.getConfigAccessor(context);
    const config = await accessor.getAllValue();
    const configEntries = Object.entries(config);

    const embed = new MessageEmbed();
    embed.setDescription(`現在の設定（${this.level}）`);

    //最大25
    embed.addFields(configEntries.map(([key, value]) => stringifyConfigEntry(key, value)));

    await context.reply("plain", embed);
  }
}
