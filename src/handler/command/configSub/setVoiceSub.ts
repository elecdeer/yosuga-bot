import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
  MessageSelectOptionData,
} from "discord.js";

import { CommandContextSlash } from "../../../commandContextSlash";
import { ConfigEachLevel, GuildLevel, MasterLevel, UserLevel } from "../../../config/typesConfig";
import { createYosugaEmbed } from "../../../util/createEmbed";
import { range } from "../../../util/range";
import { YosugaClient } from "../../../yosugaClient";
import { SetConfigSubCommandHandler } from "../../base/setConfigSubCommandHandler";
import { SubCommandProps } from "../../base/subCommandHandler";

export class SetVoiceSub extends SetConfigSubCommandHandler<
  MasterLevel | GuildLevel | UserLevel,
  "speakerOption"
> {
  constructor(yosuga: YosugaClient, level: MasterLevel | GuildLevel | UserLevel) {
    super(yosuga, level, "speakerOption");
  }

  protected initCommandProps(): SubCommandProps {
    return {
      name: "voice",
      description: "読み上げボイスの設定",
      permission: this.getPermissionLevel(),
    };
  }

  override async execute(context: CommandContextSlash): Promise<void> {
    const accessor = this.getConfigAccessor(context);
    const oldValue = await accessor.get(this.configKey);

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

      const old = await accessor.get("speakerOption");
      if (interaction.customId === "voice" && interaction.isSelectMenu()) {
        const newValue = {
          speakerName: interaction.values[0],
          voiceParam: {
            pitch: old?.voiceParam.pitch ?? 1,
            intonation: old?.voiceParam.intonation ?? 1,
          },
        };
        await accessor.set("speakerOption", newValue);
        await interaction.deferUpdate();
        await replyMessage.edit({
          embeds: [this.constructConfigReplyEmbed(oldValue, newValue)],
        });
      }

      if (interaction.customId === "pitch" && interaction.isSelectMenu()) {
        const newValue = {
          speakerName: old?.speakerName ?? "",
          voiceParam: {
            pitch: valueMap[Number.parseInt(interaction.values[0])],
            intonation: old?.voiceParam.intonation ?? 1,
          },
        };
        await accessor.set("speakerOption", newValue);
        await interaction.deferUpdate();
        await replyMessage.edit({
          embeds: [this.constructConfigReplyEmbed(oldValue, newValue)],
        });
        // this.logger.debug(`pitch set: ${valueMap[Number.parseInt(interaction.values[0])]}`);
      }

      if (interaction.customId === "intonation" && interaction.isSelectMenu()) {
        const newValue = {
          speakerName: old?.speakerName ?? "",
          voiceParam: {
            pitch: old?.voiceParam.pitch ?? 1,
            intonation: valueMap[Number.parseInt(interaction.values[0])],
          },
        };
        await accessor.set("speakerOption", newValue);
        await interaction.deferUpdate();
        await replyMessage.edit({
          embeds: [this.constructConfigReplyEmbed(oldValue, newValue)],
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

    collector.on("end", async (interactionRecord) => {
      await replyMessage.edit({
        components: [],
      });
    });
  }

  protected override async getValueFromOptions(
    options: CommandInteraction["options"],
    oldValue:
      | Readonly<ConfigEachLevel<MasterLevel | GuildLevel | UserLevel>["speakerOption"]>
      | undefined
  ): Promise<ConfigEachLevel<MasterLevel | GuildLevel | UserLevel>["speakerOption"] | undefined> {
    const voiceName = options.getString("voicename");
    if (!voiceName) {
      return undefined;
    }

    return {
      speakerName: voiceName,
      voiceParam: {
        pitch: options.getNumber("pitch") ?? 1,
        intonation: options.getNumber("intonation") ?? 1,
      },
    };
  }

  protected override constructConfigReplyEmbed(
    oldValue: Readonly<
      ConfigEachLevel<MasterLevel | GuildLevel | UserLevel>["speakerOption"] | undefined
    >,
    newValue?: Readonly<
      ConfigEachLevel<MasterLevel | GuildLevel | UserLevel>["speakerOption"] | undefined
    >
  ): MessageEmbed {
    const embed = new MessageEmbed().setDescription(
      "読み上げボイスの設定\nコマンド呼び出しユーザ以外の入力には反応しません."
    );

    embed.addField(
      "変更前の値",
      [
        `Voice: ${oldValue?.speakerName ?? "デフォルト値"}`,
        `Pitch: ${oldValue?.voiceParam.pitch ?? "デフォルト値"}`,
        `Intonation: ${oldValue?.voiceParam.intonation ?? "デフォルト値"}`,
      ].join("\n"),
      true
    );

    if (newValue) {
      embed.addField(
        "変更後の値",
        [
          `Voice: ${newValue.speakerName ?? "デフォルト値"}`,
          `Pitch: ${newValue.voiceParam.pitch ?? "デフォルト値"}`,
          `Intonation: ${newValue.voiceParam.intonation ?? "デフォルト値"}`,
        ].join("\n"),
        true
      );
    }
    return createYosugaEmbed({
      base: embed,
    });
  }
}
