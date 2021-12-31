import { CommandInteractionOptionResolver } from "discord.js";

import { MasterConfig, MasterLevel } from "../../config/typesConfig";
import { SetConfigSubCommand } from "./setConfigSubCommand";

export class AddSpeakerTtsSub extends SetConfigSubCommand<MasterLevel, "speakerBuildOptions"> {
  constructor(level: MasterLevel) {
    super(
      {
        name: "add-speaker-tts",
        description: "TTSControllerによるボイスの追加",
        options: [
          {
            name: "name",
            description: "ボイスの登録名",
            required: true,
            type: "STRING",
          },
          {
            name: "url",
            description: "TTSControllerのURLBase",
            required: true,
            type: "STRING",
          },
          {
            name: "wsurl",
            description: "socketio-audio-recorderのWebsocketURL",
            required: true,
            type: "STRING",
          },
          {
            name: "device",
            description: "socketio-audio-recorderのoutputDevice",
            required: true,
            type: "STRING",
          },
          {
            name: "callname",
            description: "TTSControllerでの呼び出し名",
            required: true,
            type: "STRING",
          },
        ],
      },
      level,
      "speakerBuildOptions"
    );
  }

  override async getValueFromOptions(
    options: CommandInteractionOptionResolver,
    oldValue: Readonly<MasterConfig["speakerBuildOptions"]> | undefined
  ): Promise<MasterConfig["speakerBuildOptions"] | undefined> {
    const voiceName = options.getString("name", true);
    return {
      ...oldValue,
      [voiceName]: {
        type: "ttsController",
        voiceName: options.getString("name", true),
        urlBase: options.getString("url", true),
        wsUrl: options.getString("wsurl", true),
        outputDevice: options.getString("device", true),
        callName: options.getString("callname", true),
      },
    };
  }
}
