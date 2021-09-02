import { CommandContextSlash } from "../../commandContextSlash";
import { masterConfigDefault } from "../../configManager";
import { isInRange } from "../../util";
import { CommandGroup } from "../commandGroup";
import { ConfigCommandLevel, ConfigSubCommand, isRequiredOption } from "./configSubCommand";

export class SetFastSpeedSub extends ConfigSubCommand {
  constructor(level: ConfigCommandLevel) {
    super(
      {
        name: "fast-speed-scale",
        description: "早口の時の読み上げ速度倍率の設定",
        options: [
          {
            name: "value",
            description: "倍率（0.1 - 10）",
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

    const configKey = "fastSpeedScale";
    const fastSpeed = options.getNumber("value") || undefined;

    if (fastSpeed && !isInRange(fastSpeed, 0.1, 10)) {
      await context.reply("error", "設定する値は0.1 ~ 10の範囲内である必要があります.");
      return;
    }

    //この辺あんまり良くないけどしょうがない感じもする
    switch (this.level) {
      case "MASTER":
        await configManager.setMasterConfig(configKey, fastSpeed ?? masterConfigDefault[configKey]);
        break;
      case "GUILD":
        await configManager.setGuildConfig(context.guild.id, configKey, fastSpeed);
        break;
    }

    await context.reply("plain", "設定しました.");
  }
}
