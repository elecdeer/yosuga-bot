import { MessageEmbed } from "discord.js";
import { getLogger } from "log4js";

import { CommandContextSlash } from "../../commandContextSlash";
import { stringifyConfigEntry } from "../../config/conifgUtil";
import { ConfigCommandLevel, UserConfig } from "../../config/typesConfig";
import { ConfigSubCommand } from "./configSubCommand";

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
    embed.addFields(
      configEntries
        .map(([key, value]) => stringifyConfigEntry(key, value))
        .filter((item) => !!item && item.value.length > 0)
    );

    await context.reply("plain", embed);
  }
}
