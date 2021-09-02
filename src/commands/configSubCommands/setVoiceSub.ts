import { CommandContextSlash } from "../../commandContextSlash";
import { masterConfigDefault } from "../../configManager";
import { CommandGroup } from "../commandGroup";
import { SubCommandBase } from "../subCommandBase";
import { ConfigCommandLevel, ConfigSubCommand, isRequiredOption } from "./configSubCommand";

export class SetVoiceSub extends ConfigSubCommand {
  constructor(level: ConfigCommandLevel) {
    super(
      {
        name: "voice",
        description: "読み上げボイスの設定",
        options: [
          {
            name: "voicename",
            description: "ボイスの登録名",
            type: "STRING",
            required: isRequiredOption(level),
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
      level
    );
  }

  override async execute(context: CommandContextSlash, parent: CommandGroup): Promise<void> {
    const options = context.getOptions();
    const configManager = context.configManager;

    const configKey = "speakerOption";

    const voiceName = options.getString("voicename");

    const masterConfig = await configManager.getMasterConfig();
    if (voiceName && masterConfig.speakerBuildOptions[voiceName]) {
      await context.reply("warn", "登録されていないボイス名を指定しています.");
    }

    const speakerOption = voiceName
      ? {
          speakerName: voiceName,
          voiceParam: {
            pitch: options.getNumber("pitch") ?? 1,
            intonation: options.getNumber("intonation") ?? 1,
          },
        }
      : undefined;

    //この辺あんまり良くないけどしょうがない感じもする
    switch (this.level) {
      case "MASTER":
        await configManager.setMasterConfig(
          configKey,
          speakerOption ?? masterConfigDefault[configKey]
        );
        break;
      case "GUILD":
        await configManager.setGuildConfig(context.guild.id, configKey, speakerOption);
        break;
      case "USER":
        await configManager.setUserConfig(context.member.id, configKey, speakerOption);
        break;
    }

    await context.reply("plain", "設定しました.");
  }
}
