import { CommandContextSlash } from "../../commandContextSlash";
import { masterConfigDefault } from "../../configManager";
import { CommandGroup } from "../commandGroup";
import { ConfigCommandLevel, ConfigSubCommand, isRequiredOption } from "./configSubCommand";

export class SetReadStatusUpdateSub extends ConfigSubCommand {
  constructor(level: ConfigCommandLevel) {
    super(
      {
        name: "read-status-update",
        description: "GoLiveの開始時などに読み上げるかどうかの設定",
        options: [
          {
            name: "enable",
            description: "読み上げるかどうか",
            type: "BOOLEAN",
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

    const configKey = "readStatusUpdate";
    const value = options.getBoolean("enable") || undefined;

    //この辺あんまり良くないけどしょうがない感じもする
    switch (this.level) {
      case "MASTER":
        await configManager.setMasterConfig(configKey, value ?? masterConfigDefault[configKey]);
        break;
      case "GUILD":
        await configManager.setGuildConfig(context.guild.id, configKey, value);
        break;
    }

    await context.reply("plain", "設定しました.");
  }
}
