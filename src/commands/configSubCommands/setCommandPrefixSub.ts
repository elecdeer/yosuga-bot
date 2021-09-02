import { CommandContextSlash } from "../../commandContextSlash";
import { CommandGroup } from "../commandGroup";
import { SubCommandBase } from "../subCommandBase";

export class SetCommandPrefixSub extends SubCommandBase {
  constructor() {
    super({
      name: "command-prefix",
      description: "テキストコマンドの呼び出し接頭辞の設定",
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

    const configKey = "commandPrefix";
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
