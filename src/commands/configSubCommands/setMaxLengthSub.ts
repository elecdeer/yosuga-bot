import { CommandContextSlash } from "../../commandContextSlash";
import { CommandGroup } from "../commandGroup";
import { SubCommandBase } from "../subCommandBase";

export class SetMaxLengthSub extends SubCommandBase {
  constructor() {
    super({
      name: "max-string-length",
      description: "読み上げを省略しない最大文字数を設定",
      options: [
        {
          name: "value",
          description: "文字数",
          type: "NUMBER",
          required: true,
        },
      ],
    });
  }

  override async execute(context: CommandContextSlash, parent: CommandGroup): Promise<void> {
    const options = context.getOptions();
    const configManager = context.configManager;

    const configKey = "maxStringLength";
    const length = options.getNumber("value", true);

    if (length < 0) {
      await context.reply("error", "設定する値は整数である必要があります.");
      return;
    }

    //この辺あんまり良くないけどしょうがない感じもする
    switch (parent.data.name) {
      case "master-config":
        await configManager.setMasterConfig(configKey, length);
        break;
      case "guild-config":
        await configManager.setGuildConfig(context.guild.id, configKey, length);
        break;
    }

    await context.reply("plain", "設定しました.");
  }
}
