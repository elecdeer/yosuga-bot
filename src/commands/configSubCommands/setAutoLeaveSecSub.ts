import { CommandContextSlash } from "../../commandContextSlash";
import { CommandGroup } from "../commandGroup";
import { SubCommandBase } from "../subCommandBase";

export class SetAutoLeaveSecSub extends SubCommandBase {
  constructor() {
    super({
      name: "auto-leave-time",
      description: "自動退出までの秒数を設定",
      options: [
        {
          name: "value",
          description: "秒数",
          type: "NUMBER",
          required: true,
        },
      ],
    });
  }

  override async execute(context: CommandContextSlash, parent: CommandGroup): Promise<void> {
    const options = context.getOptions();
    const configManager = context.configManager;

    const configKey = "timeToAutoLeaveSec";
    const sec = options.getNumber("value", true);

    if (sec < 0) {
      await context.reply("error", "設定する値は整数である必要があります.");
      return;
    }

    //この辺あんまり良くないけどしょうがない感じもする
    switch (parent.data.name) {
      case "master-config":
        await configManager.setMasterConfig(configKey, sec);
        break;
      case "guild-config":
        await configManager.setGuildConfig(context.guild.id, configKey, sec);
        break;
    }

    await context.reply("plain", "設定しました.");
  }
}
