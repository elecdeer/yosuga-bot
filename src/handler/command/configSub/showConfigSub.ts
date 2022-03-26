import { Collection, MessageEmbed } from "discord.js";
import { ValueOf } from "type-fest";

import { CommandContext } from "../../../commandContext";
import { stringifyConfigEntry } from "../../../config/conifgUtil";
import { GuildLevel, MasterLevel, UnifiedConfig, UserLevel } from "../../../config/typesConfig";
import { ConfigSubCommandHandler } from "../../base/configSubCommandHandler";
import { SubCommandProps } from "../../base/subCommandHandler";

export class ShowConfigSub extends ConfigSubCommandHandler<MasterLevel | GuildLevel | UserLevel> {
  protected initCommandProps(): SubCommandProps {
    return {
      name: "show",
      description: "現在の設定を表示",
      permission: this.getPermissionLevel(),
    };
  }

  async execute(context: CommandContext): Promise<void> {
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

    await context.replyMulti({
      content: [configEmbed, ...speakerEmbeds],
    });
  }
}
