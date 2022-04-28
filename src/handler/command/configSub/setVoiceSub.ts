import {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
  MessageSelectOptionData,
} from "discord.js";

import { CommandContextSlash } from "../../../commandContextSlash";
import { ConfigAccessor } from "../../../config/accessor/configAccessor";
import { ConfigEachLevel, GuildLevel, MasterLevel, UserLevel } from "../../../config/typesConfig";
import { createYosugaEmbed } from "../../../util/createEmbed";
import { range } from "../../../util/range";
import { YosugaClient } from "../../../yosugaClient";
import { ConfigSubCommandHandler } from "../../base/configSubCommandHandler";
import { SubCommandProps } from "../../base/subCommandHandler";

type SpeakerParams = {
  name: string | null;
  pitch: number | null;
  intonation: number | null;
};

export class SetVoiceSub extends ConfigSubCommandHandler<MasterLevel | GuildLevel | UserLevel> {
  constructor(yosuga: YosugaClient, level: MasterLevel | GuildLevel | UserLevel) {
    super(yosuga, level);
  }

  protected override initCommandProps(): SubCommandProps {
    return {
      name: "voice",
      description: "読み上げボイスの設定",
      permission: this.getPermissionLevel(),
    };
  }

  protected async getCurrentConfigValue(
    accessor: ConfigAccessor<ConfigEachLevel<"MASTER" | "GUILD" | "USER">, true>
  ): Promise<SpeakerParams> {
    return {
      name: (await accessor.get("speakerName")) ?? null,
      pitch: (await accessor.get("speakerPitch")) ?? null,
      intonation: (await accessor.get("speakerIntonation")) ?? null,
    };
  }

  override async execute(context: CommandContextSlash): Promise<void> {
    const accessor = this.getConfigAccessor(context);
    const oldValue = await this.getCurrentConfigValue(accessor);

    const voices = await context.configManager.getMasterConfigAccessor().get("speakerBuildOptions");

    if (!voices || Object.values(voices).length < 1) {
      await context.reply({
        content: "ボイスが登録されていません.",
      });
      return;
    }

    const voiceOptions: MessageSelectOptionData[] = Object.values(voices).map((item) => ({
      label: item.voiceName,
      description: `[${item.type}]`,
      value: item.voiceName,
    }));
    const voiceMenu = new MessageSelectMenu()
      .setCustomId("voice")
      .addOptions(voiceOptions)
      .setPlaceholder("Voice");

    const valueMap = range(0, 21).map((i) => i / 10);

    const pitchOptions: MessageSelectOptionData[] = valueMap.map((f, index) => ({
      label: f.toFixed(1),
      value: index.toString(),
    }));
    const pitchMenu = new MessageSelectMenu()
      .setCustomId("pitch")
      .addOptions(pitchOptions)
      .setPlaceholder("Pitch");

    const intonationOptions: MessageSelectOptionData[] = valueMap.map((f, index) => ({
      label: f.toFixed(1),
      value: index.toString(),
    }));
    const intonationMenu = new MessageSelectMenu()
      .setCustomId("intonation")
      .addOptions(intonationOptions)
      .setPlaceholder("Intonation");

    const testButton = new MessageButton()
      .setCustomId("test")
      .setStyle("PRIMARY")
      .setLabel("テスト")
      .setDisabled(context.session === null);

    const replyMessage = await context.reply({
      content: this.constructConfigReplyEmbed(oldValue),
      components: [
        new MessageActionRow().addComponents(voiceMenu),
        new MessageActionRow().addComponents(pitchMenu),
        new MessageActionRow().addComponents(intonationMenu),
        new MessageActionRow().addComponents(testButton),
      ],
    });

    const collector = replyMessage.createMessageComponentCollector({
      idle: 5 * 60 * 1000,
      filter: (interaction) => {
        return interaction.user.id === context.interaction.user.id;
      },
    });

    collector.on("collect", async (interaction) => {
      this.logger.debug(interaction.toJSON());
      const currentValue = await this.getCurrentConfigValue(accessor);

      if (interaction.customId === "voice" && interaction.isSelectMenu()) {
        const newName = interaction.values[0];

        await accessor.set("speakerName", newName);
        await interaction.deferUpdate();
        await replyMessage.edit({
          embeds: [
            this.constructConfigReplyEmbed(oldValue, {
              ...currentValue,
              name: newName,
            }),
          ],
        });
      }

      if (interaction.customId === "pitch" && interaction.isSelectMenu()) {
        const newPitch = valueMap[Number.parseInt(interaction.values[0])];
        await accessor.set("speakerPitch", newPitch);
        await interaction.deferUpdate();
        await replyMessage.edit({
          embeds: [
            this.constructConfigReplyEmbed(oldValue, {
              ...currentValue,
              pitch: newPitch,
            }),
          ],
        });
        // this.logger.debug(`pitch set: ${valueMap[Number.parseInt(interaction.values[0])]}`);
      }

      if (interaction.customId === "intonation" && interaction.isSelectMenu()) {
        const intonation = valueMap[Number.parseInt(interaction.values[0])];
        await accessor.set("speakerIntonation", intonation);
        await interaction.deferUpdate();
        await replyMessage.edit({
          embeds: [
            this.constructConfigReplyEmbed(oldValue, {
              ...currentValue,
              intonation: intonation,
            }),
          ],
        });
        // this.logger.debug(`intonation set: ${valueMap[Number.parseInt(interaction.values[0])]}`);
      }

      if (interaction.customId === "test" && interaction.isButton() && context.session) {
        await context.session.pushSpeech(
          {
            text: "これは音声のテストです。",
          },
          interaction.user.id
        );
        await interaction.deferUpdate();
      }
    });

    collector.on("end", async () => {
      await replyMessage.edit({
        components: [],
      });
    });
  }

  protected constructConfigReplyEmbed(
    oldValue: Partial<SpeakerParams>,
    newValue?: Partial<SpeakerParams>
  ): MessageEmbed {
    const embed = new MessageEmbed().setDescription(
      "読み上げボイスの設定\nコマンド呼び出しユーザ以外の入力には反応しません."
    );

    embed.addField(
      "変更前の値",
      [
        `Voice: ${oldValue.name ?? "デフォルト値"}`,
        `Pitch: ${oldValue.pitch ?? "デフォルト値"}`,
        `Intonation: ${oldValue.intonation ?? "デフォルト値"}`,
      ].join("\n"),
      true
    );

    if (newValue) {
      embed.addField(
        "変更後の値",
        [
          `Voice: ${newValue.name ?? "デフォルト値"}`,
          `Pitch: ${newValue.pitch ?? "デフォルト値"}`,
          `Intonation: ${newValue.intonation ?? "デフォルト値"}`,
        ].join("\n"),
        true
      );
    }
    return createYosugaEmbed({
      base: embed,
    });
  }
}
