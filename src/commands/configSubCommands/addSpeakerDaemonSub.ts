import { CommandContextSlash } from "../../commandContextSlash";
import { CommandGroup } from "../commandGroup";
import { SubCommandBase } from "../subCommandBase";

export class AddSpeakerDaemonSub extends SubCommandBase {
  constructor() {
    super({
      name: "add-speaker-daemon",
      description: "VoiceroidDaemonによるボイスの追加",
      options: [
        {
          name: "name",
          description: "ボイスの登録名",
          required: true,
          type: "STRING",
        },
        {
          name: "url",
          description: "VoiceroidDaemonのURLBase",
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
        type: "voiceroidDaemon",
        voiceName: options.getString("name", true),
        urlBase: options.getString("url", true),
      },
    }));

    await context.reply("plain", "設定しました.");
  }
}
