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
import { range } from "../../../util/range";
import { isInRange } from "../../../util/util";
import { YosugaClient } from "../../../yosugaClient";
import {
  SetConfigSubCommandHandler,
  ValidationResult,
} from "../../base/setConfigSubCommandHandler";
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
      content: new MessageEmbed()
        .setDescription("読み上げボイスの設定")
        .addField(
          "変更前の値",
          [
            `Voice: ${oldValue?.speakerName ?? "デフォルト値"}`,
            `Pitch: ${oldValue?.voiceParam.pitch ?? "デフォルト値"}`,
            `Intonation: ${oldValue?.voiceParam.intonation ?? "デフォルト値"}`,
          ].join("\n")
        ),
      components: [
        new MessageActionRow().addComponents(voiceMenu),
        new MessageActionRow().addComponents(pitchMenu),
        new MessageActionRow().addComponents(intonationMenu),
        new MessageActionRow().addComponents(testButton),
      ],
    });

    const collector = replyMessage.createMessageComponentCollector({
      idle: 5 * 60 * 1000,
      filter: async (interaction) => {
        await interaction.deferUpdate();
        return interaction.user.id === context.member.id;
      },
    });

    collector.on("collect", async (interaction) => {
      this.logger.debug(interaction.toJSON());

      const old = await accessor.get("speakerOption");
      if (interaction.customId === "voice" && interaction.isSelectMenu()) {
        await accessor.set("speakerOption", {
          speakerName: interaction.values[0],
          voiceParam: {
            pitch: old?.voiceParam.pitch ?? 1,
            intonation: old?.voiceParam.intonation ?? 1,
          },
        });
        // this.logger.debug(`voice set: ${interaction.values[0]}`);
      }

      if (interaction.customId === "pitch" && interaction.isSelectMenu()) {
        await accessor.set("speakerOption", {
          speakerName: old?.speakerName ?? "",
          voiceParam: {
            pitch: valueMap[Number.parseInt(interaction.values[0])],
            intonation: old?.voiceParam.intonation ?? 1,
          },
        });
        // this.logger.debug(`pitch set: ${valueMap[Number.parseInt(interaction.values[0])]}`);
      }

      if (interaction.customId === "intonation" && interaction.isSelectMenu()) {
        await accessor.set("speakerOption", {
          speakerName: old?.speakerName ?? "",
          voiceParam: {
            pitch: old?.voiceParam.pitch ?? 1,
            intonation: valueMap[Number.parseInt(interaction.values[0])],
          },
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
      }
    });

    collector.on("end", async (interactionRecord) => {
      this.logger.debug("end");
      await replyMessage.edit({
        components: [],
      });
    });

    // context.replyMulti()
    // context.interaction.reply({
    //   components:
    // });
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

  protected override async validateValue(
    value: ConfigEachLevel<MasterLevel | GuildLevel | UserLevel>["speakerOption"] | undefined,
    context: Omit<CommandContextSlash, "replyMulti">
  ): Promise<ValidationResult> {
    const buildOptions = await context.getUnifiedConfigAccessor().get("speakerBuildOptions");

    if (value) {
      if (!buildOptions[value.speakerName]) {
        return {
          status: "warn",
          message: "登録されていないボイス名を指定しています.",
        };
      }

      if (!isInRange(value.voiceParam.pitch, 0, 2)) {
        return {
          status: "error",
          message: "pitchに設定する値は0 ~ 2の範囲内である必要があります.",
        };
      }
      if (!isInRange(value.voiceParam.intonation, 0, 2)) {
        return {
          status: "error",
          message: "intonationに設定する値は0 ~ 2の範囲内である必要があります.",
        };
      }
    }

    return super.validateValue(value, context);
  }
}
