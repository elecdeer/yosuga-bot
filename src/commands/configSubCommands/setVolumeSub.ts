import { CommandContextSlash } from "../../commandContextSlash";
import { isInRange } from "../../util";
import { CommandGroup } from "../commandGroup";
import { SubCommandBase } from "../subCommandBase";

export class SetVolumeSub extends SubCommandBase {
  constructor() {
    super({
      name: "volume",
      description: "読み上げ音量の設定",
      options: [
        {
          name: "value",
          description: "音量（0 - 2）",
          type: "NUMBER",
          required: true,
        },
      ],
    });
  }

  override async execute(context: CommandContextSlash, parent: CommandGroup): Promise<void> {
    const options = context.getOptions();
    const configManager = context.configManager;

    const configKey = "masterVolume";
    const volume = options.getNumber("value", true);

    if (!isInRange(volume, 0, 2)) {
      await context.reply("error", "設定する値は0 ~ 2の範囲内である必要があります.");
      return;
    }

    //この辺あんまり良くないけどしょうがない感じもする
    switch (parent.data.name) {
      case "master-config":
        await configManager.setMasterConfig(configKey, volume);
        break;
      case "guild-config":
        await configManager.setGuildConfig(context.guild.id, configKey, volume);
        break;
    }

    await context.reply("plain", "設定しました.");
  }
}
