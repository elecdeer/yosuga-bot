import { MasterLevelSubCommand } from "../interactionSubCommand";

export const addSpeakerDaemonSub: MasterLevelSubCommand<"speakerBuildOptions"> = {
  configKey: "speakerBuildOptions",
  data: {
    name: "add-speaker-daemon",
    description: "VoiceroidDaemonによるボイスの追加",
    type: "SUB_COMMAND",
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
  },
  setValue: (options, oldValue) => {
    const voiceName = options.getString("name", true);

    return {
      ...oldValue,
      [voiceName]: {
        type: "voiceroidDaemon",
        voiceName: options.getString("name", true),
        urlBase: options.getString("url", true),
      },
    };
  },
};
