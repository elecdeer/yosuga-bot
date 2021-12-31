import { CommandInteraction } from "discord.js";

import { ConfigEachLevel, MasterLevel } from "../../config/typesConfig";
import { SetConfigSubCommand } from "./setConfigSubCommand";

export class AddVoicevoxSub extends SetConfigSubCommand<MasterLevel, "speakerBuildOptions"> {
  constructor(level: MasterLevel) {
    super(
      {
        name: "add-voicevox",
        description: "VOICEVOXによるボイスの追加",
        options: [
          {
            name: "styleName",
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
            name: "styleId",
            description: "追加したいspeakerのstyleのId",
            type: "STRING",
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
    return undefined;
  }
}
