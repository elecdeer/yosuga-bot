import { MasterLevelSubCommand } from "../interactionSubCommand";

export const addSpeakerTtsSub: MasterLevelSubCommand<"speakerBuildOptions"> = {
  data: {
    name: "add-speaker-tts",
    description: "TTSControllerによるボイスの追加",
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
  configKey: "speakerBuildOptions",
  setValue: (options, oldValue) => {
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
  },
};
