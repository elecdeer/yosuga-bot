import { CommandContextSlash } from "../../commandContextSlash";
import { CommandGroup } from "../commandGroup";
import { SubCommandBase } from "../subCommandBase";

export class SetVoiceSub extends SubCommandBase {
  constructor() {
    super({
      name: "voice",
      description: "読み上げボイスの設定",
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
    });
  }

  override async execute(context: CommandContextSlash, parent: CommandGroup): Promise<void> {
    const options = context.getOptions();
    const configManager = context.configManager;

    const configKey = "speakerOption";

    const voiceName = options.getString("voicename", true);

    const masterConfig = await configManager.getMasterConfig();
    if (masterConfig.speakerBuildOptions[voiceName]) {
      await context.reply("warn", "登録されていないボイス名を指定しています.");
    }

    const speakerOption = {
      speakerName: voiceName,
      voiceParam: {
        pitch: options.getNumber("pitch") ?? 1,
        intonation: options.getNumber("intonation") ?? 1,
      },
    };

    //この辺あんまり良くないけどしょうがない感じもする
    switch (parent.data.name) {
      case "master-config":
        await configManager.setMasterConfig(configKey, speakerOption);
        break;
      case "guild-config":
        await configManager.setGuildConfig(context.guild.id, configKey, speakerOption);
        break;
      case "user-config":
        await configManager.setUserConfig(context.member.id, configKey, speakerOption);
        break;
    }

    await context.reply("plain", "設定しました.");
  }
}
