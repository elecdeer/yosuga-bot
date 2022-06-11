import { Collection, MessageActionRow, MessageButton, MessageSelectMenu } from "discord.js";

import { createVoicevoxClient } from "../../../speaker/voicevoxApi";
import { ConfigSubCommandHandler } from "../../base/configSubCommandHandler";

import type { CommandContextSlash } from "../../../commandContextSlash";
import type { MasterLevel } from "../../../config/typesConfig";
import type { SpeakerBuildOption } from "../../../speaker/voiceProvider";
import type { VoicevoxSpeakerBuildOption } from "../../../speaker/voicevoxSpeaker";
import type { SubCommandProps } from "../../base/subCommandHandler";
import type { MessageSelectOptionData } from "discord.js";

export class AddSpeakerVoicevoxSub extends ConfigSubCommandHandler<MasterLevel> {
  protected override initCommandProps(): SubCommandProps {
    return {
      name: "add-voicevox",
      description: "VOICEVOXによるボイスの追加",
      options: [
        {
          name: "url",
          description: "VOICEVOXエンジンのURLBase",
          type: "STRING",
        },
      ],
      permission: this.getPermissionLevel(),
    };
  }

  override async execute(context: CommandContextSlash): Promise<void> {
    const accessor = this.getConfigAccessor(context);

    const baseUrl = await this.inquireUrl(context);
    if (baseUrl === null) {
      await context.reply({
        type: "error",
        content: "URLが指定されませんでした.",
        ephemeral: true,
      });
      return;
    }

    const selectedSpeakers = await this.inquireVoice(context, baseUrl);
    if (selectedSpeakers === null) {
      await context.reply({
        type: "error",
        content: "Speakerが指定されませんでした.",
        ephemeral: true,
      });
      return;
    }

    const oldValue = (await accessor.get("speakerBuildOptions")) ?? {};

    const setValue = selectedSpeakers.reduce((acc, cur) => {
      return {
        ...acc,
        [cur.voiceName]: cur,
      };
    }, oldValue);

    await accessor.set("speakerBuildOptions", setValue);
    await context.reply({
      content: `Speakerを追加しました!
      ${selectedSpeakers.map((speaker) => ` ${speaker.voiceName}`).join("\n")}`,
    });
  }

  protected async getVoicesCollection(
    context: CommandContextSlash
  ): Promise<Collection<string, SpeakerBuildOption>> {
    const accessor = this.getConfigAccessor(context);

    const existingVoices = (await accessor.get("speakerBuildOptions")) ?? {};
    return new Collection(Object.entries(existingVoices));
  }

  protected async inquireUrl(context: CommandContextSlash): Promise<string | null> {
    try {
      const urlOption = context.getOptions().getString("url");
      if (urlOption !== "" && urlOption !== null) {
        return urlOption;
      }

      const existingVoicesCollection = await this.getVoicesCollection(context);
      const existingUrls = Array.from(
        new Set(
          existingVoicesCollection
            .filter((value) => value.type === "voicevox")
            .map((value) => value.urlBase)
        )
      );

      if (existingUrls.length === 0) {
        return null;
      }

      const options: MessageSelectOptionData[] = existingUrls.map((item) => ({
        label: item,
        value: item,
      }));
      const baseUrlMenu = new MessageSelectMenu()
        .setCustomId("url")
        .addOptions(options)
        .setPlaceholder("BaseUrl");

      const message = await context.reply({
        content: "VOICEVOXのエンドポイントを選択",
        components: [new MessageActionRow().addComponents(baseUrlMenu)],
        ephemeral: true,
      });

      const resInteraction = await message.awaitMessageComponent({
        time: 5 * 60 * 1000,
        filter: (interaction) => {
          return interaction.user.id === context.interaction.user.id;
        },
        componentType: "SELECT_MENU",
      });

      await resInteraction.deferUpdate();
      return resInteraction.values[0];
    } catch (e) {
      this.logger.warn(e);
      return null;
    }
  }

  protected async inquireVoice(
    context: CommandContextSlash,
    url: string
  ): Promise<
    | (VoicevoxSpeakerBuildOption & {
        voiceName: string;
      })[]
    | null
  > {
    try {
      const client = createVoicevoxClient(url);

      const speakers = await client.speakers.$get();

      const speakersOptions: MessageSelectOptionData[] = speakers.map((value) => ({
        label: value.name,
        value: value.speaker_uuid,
      }));
      const speakerMenu = new MessageSelectMenu()
        .setCustomId("speaker")
        .addOptions(speakersOptions)
        .setPlaceholder("Speaker");

      const speakerMessage = await context.reply({
        content: "Speakerを選択",
        components: [new MessageActionRow().addComponents(speakerMenu)],
        ephemeral: true,
      });

      const speakerResInteraction = await speakerMessage.awaitMessageComponent({
        time: 5 * 60 * 1000,
        filter: (interaction) => {
          return interaction.user.id === context.interaction.user.id;
        },
        componentType: "SELECT_MENU",
      });
      this.logger.trace(speakerResInteraction.toJSON());
      await speakerResInteraction.deferUpdate();

      const uuid = speakerResInteraction.values[0];

      this.logger.trace(`selected: ${uuid}`);

      const selectedSpeaker = speakers.find((speaker) => speaker.speaker_uuid === uuid);
      this.logger.trace(`selectedSpeaker: ${selectedSpeaker?.name}`);
      const styles = selectedSpeaker?.styles;
      this.logger.trace(`styles: ${styles}`);
      if (!selectedSpeaker || !styles) return null;

      const stylesOptions: MessageSelectOptionData[] = styles.map((value) => ({
        label: value.name,
        value: value.name,
      }));
      const stylesMenu = new MessageSelectMenu()
        .setCustomId("styles")
        .addOptions(stylesOptions)
        .setPlaceholder("Style")
        .setMinValues(1)
        .setMaxValues(stylesOptions.length);

      const confirmButton = new MessageButton()
        .setCustomId("confirm")
        .setStyle("PRIMARY")
        .setLabel("追加");

      const styleMessage = await context.reply({
        content: "スタイルを選択",
        components: [
          new MessageActionRow().addComponents(stylesMenu),
          new MessageActionRow().addComponents(confirmButton),
        ],
        ephemeral: true,
      });

      let selectedStyles: string[] = [];
      const collector = styleMessage.createMessageComponentCollector({
        time: 5 * 60 * 1000,
        filter: (interaction) => {
          return (
            interaction.user.id === context.interaction.user.id &&
            interaction.customId === stylesMenu.customId
          );
        },
        componentType: "SELECT_MENU",
      });
      collector.on("collect", async (interaction) => {
        await interaction.deferUpdate();
        selectedStyles = interaction.values;
      });

      const styleResInteraction = await styleMessage.awaitMessageComponent({
        time: 5 * 60 * 1000,
        filter: (interaction) => {
          return (
            interaction.user.id === context.interaction.user.id &&
            interaction.customId === confirmButton.customId
          );
        },
        componentType: "BUTTON",
      });
      await styleResInteraction.deferUpdate();

      return selectedStyles.map((style) => ({
        voiceName: `${selectedSpeaker.name}(${style})`,
        speakerUUID: uuid,
        type: "voicevox",
        urlBase: url,
        styleName: style,
      }));
    } catch (e) {
      this.logger.warn(e);
      return null;
    }
  }
}

const fetchVoicevoxSpeakerIds = async (baseUrl: string, styleId: number) => {
  const client = createVoicevoxClient(baseUrl);
  const speakers = await client.speakers.$get();

  for (const speaker of speakers) {
    for (const style of speaker.styles) {
      if (style.id === styleId) {
        return {
          speakerUUID: speaker.speaker_uuid,
          styleName: style.name,
        };
      }
    }
  }
  throw new Error(`指定されたstyleId ${styleId}を持つspeakerは存在しません`);
};
