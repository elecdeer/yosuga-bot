import { CommandContextSlash } from "../../commandContextSlash";
import { masterConfigDefault } from "../../configManager";
import { CommandGroup } from "../commandGroup";
import { ConfigCommandLevel, ConfigSubCommand, isRequiredOption } from "./configSubCommand";

export class SetMaxLengthSub extends ConfigSubCommand {
  constructor(level: ConfigCommandLevel) {
    super(
      {
        name: "max-string-length",
        description: "読み上げを省略しない最大文字数を設定",
        options: [
          {
            name: "value",
            description: "文字数",
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

    const configKey = "maxStringLength";
    const length = options.getNumber("value") || undefined;

    if (length && length < 0) {
      await context.reply("error", "設定する値は整数である必要があります.");
      return;
    }

    //この辺あんまり良くないけどしょうがない感じもする
    switch (this.level) {
      case "MASTER":
        await configManager.setMasterConfig(configKey, length ?? masterConfigDefault[configKey]);
        break;
      case "GUILD":
        await configManager.setGuildConfig(context.guild.id, configKey, length);
        break;
    }

    await context.reply("plain", "設定しました.");
  }
}
