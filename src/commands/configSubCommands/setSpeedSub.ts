import { CommandContextSlash } from "../../commandContextSlash";
import { isInRange } from "../../util";
import { CommandGroup } from "../commandGroup";
import { SubCommandBase } from "../subCommandBase";

export class SetSpeedSub extends SubCommandBase {
  constructor() {
    super({
      name: "speed",
      description: "読み上げ速度の設定",
      options: [
        {
          name: "value",
          description: "速度（0 - 2）",
          type: "NUMBER",
          required: true,
        },
      ],
    });
  }

  override async execute(context: CommandContextSlash, parent: CommandGroup): Promise<void> {
    const options = context.getOptions();
    const configManager = context.configManager;

    const configKey = "masterSpeed";
    const speed = options.getNumber("value", true);

    if (!isInRange(speed, 0, 2)) {
      await context.reply("error", "設定する値は0 ~ 2の範囲内である必要があります.");
      return;
    }

    //この辺あんまり良くないけどしょうがない感じもする
    switch (parent.data.name) {
      case "master-config":
        await configManager.setMasterConfig(configKey, speed);
        break;
      case "guild-config":
        await configManager.setGuildConfig(context.guild.id, configKey, speed);
        break;
    }

    await context.reply("plain", "設定しました.");
  }
}
