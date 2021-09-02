import { CommandContextSlash } from "../../commandContextSlash";
import { CommandGroup } from "../commandGroup";
import { SubCommandBase } from "../subCommandBase";

export class SetIgnorePrefixSub extends SubCommandBase {
  constructor() {
    super({
      name: "ignore-prefix",
      description: "読み上げを無視する接頭辞",
      options: [
        {
          name: "prefix",
          description: "接頭辞",
          type: "STRING",
          required: true,
        },
      ],
    });
  }

  override async execute(context: CommandContextSlash, parent: CommandGroup): Promise<void> {
    const options = context.getOptions();
    const configManager = context.configManager;

    const configKey = "ignorePrefix";
    const prefix = options.getString("prefix", true);

    //この辺あんまり良くないけどしょうがない感じもする
    switch (parent.data.name) {
      case "master-config":
        await configManager.setMasterConfig(configKey, prefix);
        break;
      case "guild-config":
        await configManager.setGuildConfig(context.guild.id, configKey, prefix);
        break;
    }

    await context.reply("plain", "設定しました.");
  }
}
