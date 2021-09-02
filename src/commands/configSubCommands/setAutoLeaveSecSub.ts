import { CommandContextSlash } from "../../commandContextSlash";
import { masterConfigDefault } from "../../configManager";
import { CommandGroup } from "../commandGroup";
import { ConfigCommandLevel, ConfigSubCommand, isRequiredOption } from "./configSubCommand";

export class SetAutoLeaveSecSub extends ConfigSubCommand {
  constructor(level: ConfigCommandLevel) {
    super(
      {
        name: "auto-leave-time",
        description: "自動退出までの秒数を設定",
        options: [
          {
            name: "value",
            description: "秒数",
            type: "NUMBER",
            required: isRequiredOption(level),
          },
        ],
      },
      level
    );
  }

  override async execute(context: CommandContextSlash): Promise<void> {
    const options = context.getOptions();
    const configManager = context.configManager;

    const configKey = "timeToAutoLeaveSec";
    const sec = options.getNumber("value") || undefined;

    if (sec && sec < 0) {
      await context.reply("error", "設定する値は整数である必要があります.");
      return;
    }

    //この辺あんまり良くないけどしょうがない感じもする
    switch (this.level) {
      case "MASTER":
        await configManager.setMasterConfig(configKey, sec ?? masterConfigDefault[configKey]);
        break;
      case "GUILD":
        await configManager.setGuildConfig(context.guild.id, configKey, sec);
        break;
    }

    await context.reply("plain", "設定しました.");
  }
}
