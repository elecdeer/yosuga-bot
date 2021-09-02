import { EmbedFieldData, MessageEmbed } from "discord.js";
import { getLogger } from "log4js";
import { ValueOf } from "type-fest";

import { CommandContextSlash } from "../../commandContextSlash";
import { MasterConfig, UnifiedConfig } from "../../configManager";
import { SpeakerBuildOption } from "../../speaker/voiceProvider";
import { SpeakerOption } from "../../types";
import { ConfigCommandLevel, ConfigSubCommand } from "./configSubCommand";

const logger = getLogger("command");

export class ShowConfigSub extends ConfigSubCommand {
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
    const config = await this.getLevelConfig(context);
    const configEntries = Object.entries(config);

    const embed = new MessageEmbed();
    embed.setDescription(`現在の設定（${this.level}）`);

    //最大25
    embed.addFields(configEntries.map((entry) => formatCommandEntry(entry)));

    await context.reply("plain", embed);
  }

  async getLevelConfig({
    guild,
    member,
    configManager,
  }: CommandContextSlash): Promise<Partial<UnifiedConfig>> {
    switch (this.level) {
      case "MASTER":
        return await configManager.getMasterConfig();
      case "GUILD":
        return (await configManager.getGuildConfig(guild.id)) ?? {};
      case "USER":
        return (await configManager.getUserConfig(member.id)) ?? {};
    }
  }
}

const formatCommandEntry = ([configKey, configValue]: [
  string,
  ValueOf<MasterConfig>
]): EmbedFieldData => {
  if (configKey === "speakerBuildOptions") {
    const obj = configValue as Record<string, SpeakerBuildOption>;
    return {
      name: configKey,
      value: JSON.stringify(
        obj,
        (key, value) => {
          if (key === "voiceName") return undefined;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return value;
        },
        2
      ),
    };
  }

  if (configKey === "speakerOption") {
    const option = configValue as SpeakerOption;
    return {
      name: configKey,
      value: `${option.speakerName} pitch: ${option.voiceParam.pitch} intonation: ${option.voiceParam.intonation}`,
    };
  }

  if (typeof configValue === "object") {
    return {
      name: configKey,
      value: JSON.stringify(configValue, null, 2),
    };
  }

  return {
    name: configKey,
    value: configValue.toString(),
  };
};
