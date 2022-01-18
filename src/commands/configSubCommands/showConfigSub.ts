import { Collection, MessageEmbed } from "discord.js";
import { getLogger } from "log4js";
import { ValueOf } from "type-fest";

import { CommandContextSlash } from "../../commandContextSlash";
import { stringifyConfigEntry } from "../../config/conifgUtil";
import {
  ConfigCommandLevel,
  GuildLevel,
  MasterLevel,
  UnifiedConfig,
  UserLevel,
} from "../../config/typesConfig";
import { ConfigSubCommand } from "./configSubCommand";

const logger = getLogger("command");

export class ShowConfigSub extends ConfigSubCommand<MasterLevel | GuildLevel | UserLevel> {
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

    //as微妙かも
    const configCollection = new Collection(
      Object.entries(config) as [keyof UnifiedConfig, ValueOf<UnifiedConfig>][]
    );

    const configEmbed = new MessageEmbed();
    configEmbed.setDescription(`現在の設定（${this.level}）`);

    const configEntriesWithoutSpeaker = configCollection.filter(
      (_, key) => key !== "speakerBuildOptions"
    );

    //最大25
    configEmbed.addFields(
      configEntriesWithoutSpeaker
        .map((value, key) => stringifyConfigEntry(key, value))
        .filter((item) => !!item && item.value.length > 0)
    );

    const configSpeaker = config.speakerBuildOptions ?? {};
    const configEntriesSpeaker = Object.entries(configSpeaker);

    const speakerEmbeds = configEntriesSpeaker.map(([name, item], index) => {
      const embed = new MessageEmbed();
      embed.setTitle(`SpeakerBuildOption (${index + 1}/${configEntriesSpeaker.length})`);
      embed.setDescription(name);

      const optionEntries = Object.entries(item);
      embed.addFields(
        optionEntries.map(([key, value]) => ({
          name: key,
          value: value,
          inline: true,
        }))
      );
      return embed;
    });

    await context.reply("plain", [configEmbed, ...speakerEmbeds]);
  }
}
