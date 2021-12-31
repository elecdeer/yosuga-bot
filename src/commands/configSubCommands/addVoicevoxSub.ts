import { CommandInteraction } from "discord.js";

import { ConfigEachLevel, MasterLevel } from "../../config/typesConfig";
import { SpeakerBuildOption } from "../../speaker/voiceProvider";
import { createVoicevoxClient } from "../../speaker/voicevoxApi";
import { SetConfigSubCommand } from "./setConfigSubCommand";

export class AddVoicevoxSub extends SetConfigSubCommand<MasterLevel, "speakerBuildOptions"> {
  constructor(level: MasterLevel) {
    super(
      {
        name: "add-voicevox",
        description: "VOICEVOXによるボイスの追加",
        options: [
          {
            name: "stylename",
            description: "ボイスの登録名",
            type: "STRING",
            required: true,
          },
          {
            name: "url",
            description: "VOICEVOXエンジンのURLBase",
            type: "STRING",
            required: true,
          },
          {
            name: "styleid",
            description: "追加したいspeakerのstyleのId",
            type: "NUMBER",
            required: true,
          },
        ],
      },
      level,
      "speakerBuildOptions"
    );
  }

  protected async getValueFromOptions(
    options: CommandInteraction["options"],
    oldValue: Readonly<ConfigEachLevel<MasterLevel>["speakerBuildOptions"]> | undefined
  ): Promise<ConfigEachLevel<MasterLevel>["speakerBuildOptions"] | undefined> {
    const voiceName = options.getString("name", true);
    const urlBase = options.getString("url", true);
    const styleId = options.getNumber("styleId", true);

    const option: SpeakerBuildOption = {
      type: "voicevox",
      voiceName: voiceName,
      urlBase: urlBase,
      ...(await fetchVoicevoxSpeakerIds(urlBase, styleId)),
    };

    return {
      ...oldValue,
      [voiceName]: option,
    };
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
