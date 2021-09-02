import { CommandContextSlash } from "../../commandContextSlash";
import { masterConfigDefault } from "../../configManager";
import { isInRange } from "../../util";
import { CommandGroup } from "../commandGroup";
import { ConfigCommandLevel, ConfigSubCommand, isRequiredOption } from "./configSubCommand";

export class SetSpeedSub extends ConfigSubCommand {
  constructor(level: ConfigCommandLevel) {
    super(
      {
        name: "speed",
        description: "読み上げ速度の設定",
        options: [
          {
            name: "value",
            description: "速度（0 - 2）",
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

    const configKey = "masterSpeed";
    const speed = options.getNumber("value") || undefined;

    if (speed && !isInRange(speed, 0, 2)) {
      await context.reply("error", "設定する値は0 ~ 2の範囲内である必要があります.");
      return;
    }

    //この辺あんまり良くないけどしょうがない感じもする
    switch (this.level) {
      case "MASTER":
        await configManager.setMasterConfig(configKey, speed ?? masterConfigDefault[configKey]);
        break;
      case "GUILD":
        await configManager.setGuildConfig(context.guild.id, configKey, speed);
        break;
    }

    await context.reply("plain", "設定しました.");
  }
}
