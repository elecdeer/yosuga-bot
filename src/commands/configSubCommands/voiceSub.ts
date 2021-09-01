import { UserLevelSubCommand } from "../interactionSubCommand";

//voicenameのオプションChoiceにしたい...

export const voiceSub: UserLevelSubCommand<"speakerOption"> = {
  data: {
    name: "voice",
    description: "読み上げボイスの設定",
    type: "SUB_COMMAND",
    options: [
      {
        name: "voicename",
        description: "ボイスの登録名",
        type: "STRING",
        required: true,
      },
      {
        name: "pitch",
        description: "声のピッチ（0 - 2)",
        type: "NUMBER",
      },
      {
        name: "intonation",
        description: "声のイントネーション（0 - 2)",
        type: "NUMBER",
      },
    ],
  },
  configKey: "speakerOption",
  setValue: (options, oldValue) => ({
    speakerName: options.getString("voicename", true),
    voiceParam: {
      pitch: options.getNumber("pitch") ?? oldValue?.voiceParam.pitch ?? 1,
      intonation: options.getNumber("intonation") ?? oldValue?.voiceParam.intonation ?? 1,
    },
  }),
};
