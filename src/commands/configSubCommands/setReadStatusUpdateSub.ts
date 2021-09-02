import { CommandContextSlash } from "../../commandContextSlash";
import { CommandGroup } from "../commandGroup";
import { SubCommandBase } from "../subCommandBase";

export class SetReadStatusUpdateSub extends SubCommandBase {
  constructor() {
    super({
      name: "read-status-update",
      description: "GoLiveの開始時などに読み上げるかどうかの設定",
      options: [
        {
          name: "enable",
          description: "読み上げるかどうか",
          type: "BOOLEAN",
          required: true,
        },
      ],
    });
  }

  override async execute(context: CommandContextSlash, parent: CommandGroup): Promise<void> {
    const options = context.getOptions();
    const configManager = context.configManager;

    const configKey = "readStatusUpdate";
    const enable = options.getBoolean("enable", true);

    //この辺あんまり良くないけどしょうがない感じもする
    switch (parent.data.name) {
      case "master-config":
        await configManager.setMasterConfig(configKey, enable);
        break;
      case "guild-config":
        await configManager.setGuildConfig(context.guild.id, configKey, enable);
        break;
    }

    await context.reply("plain", "設定しました.");
  }
}
