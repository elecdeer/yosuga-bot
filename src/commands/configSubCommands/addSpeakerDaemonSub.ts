import { CommandInteractionOptionResolver } from "discord.js";

import { MasterConfig, MasterLevel } from "../../config/typesConfig";
import { SetConfigSubCommand } from "./setConfigSubCommand";

export class AddSpeakerDaemonSub extends SetConfigSubCommand<MasterLevel, "speakerBuildOptions"> {
  constructor(level: MasterLevel) {
    super(
      {
        name: "add-speaker-daemon",
        description: "VoiceroidDaemonによるボイスの追加",
        options: [
          {
            name: "name",
            description: "ボイスの登録名",
            type: "STRING",
            required: true,
          },
          {
            name: "url",
            description: "VoiceroidDaemonのURLBase",
            type: "STRING",
            required: true,
          },
        ],
      },
      level,
      "speakerBuildOptions"
    );
  }

  override getValueFromOptions(
    options: CommandInteractionOptionResolver,
    oldValue: Readonly<MasterConfig["speakerBuildOptions"]> | undefined
  ): MasterConfig["speakerBuildOptions"] | undefined {
    const voiceName = options.getString("name", true);
    return {
      ...oldValue,
      [voiceName]: {
        type: "voiceroidDaemon",
        voiceName: options.getString("name", true),
        urlBase: options.getString("url", true),
      },
    };
  }
}
