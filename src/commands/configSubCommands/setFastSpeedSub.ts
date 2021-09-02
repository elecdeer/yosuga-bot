import { CommandContextSlash } from "../../commandContextSlash";
import { isInRange } from "../../util";
import { CommandGroup } from "../commandGroup";
import { SubCommandBase } from "../subCommandBase";

export class SetFastSpeedSub extends SubCommandBase {
  constructor() {
    super({
      name: "fast-speed-scale",
      description: "早口の時の読み上げ速度倍率の設定",
      options: [
        {
          name: "value",
          description: "倍率（0.1 - 10）",
          type: "NUMBER",
          required: true,
        },
      ],
    });
  }

  override async execute(context: CommandContextSlash, parent: CommandGroup): Promise<void> {
    const options = context.getOptions();
    const configManager = context.configManager;

    const configKey = "fastSpeedScale";
    const fastSpeed = options.getNumber("value", true);

    if (!isInRange(fastSpeed, 0.1, 10)) {
      await context.reply("error", "設定する値は0.1 ~ 10の範囲内である必要があります.");
      return;
    }

    //この辺あんまり良くないけどしょうがない感じもする
    switch (parent.data.name) {
      case "master-config":
        await configManager.setMasterConfig(configKey, fastSpeed);
        break;
      case "guild-config":
        await configManager.setGuildConfig(context.guild.id, configKey, fastSpeed);
        break;
    }

    await context.reply("plain", "設定しました.");
  }
}
