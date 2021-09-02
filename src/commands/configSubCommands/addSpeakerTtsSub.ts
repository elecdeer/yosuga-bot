import { CommandContextSlash } from "../../commandContextSlash";
import { CommandGroup } from "../commandGroup";
import { SubCommandBase } from "../subCommandBase";

export class AddSpeakerTtsSub extends SubCommandBase {
  constructor() {
    super({
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
    });
  }

  override async execute(context: CommandContextSlash): Promise<void> {
    const options = context.getOptions();
    const configManager = context.configManager;

    const voiceName = options.getString("name", true);
    await configManager.setMasterConfig("speakerBuildOptions", (oldValue) => ({
      ...oldValue,
      [voiceName]: {
        type: "ttsController",
        voiceName: options.getString("name", true),
        urlBase: options.getString("url", true),
        wsUrl: options.getString("wsurl", true),
        outputDevice: options.getString("device", true),
        callName: options.getString("callname", true),
      },
    }));

    await context.reply("plain", "設定しました.");
  }
}
