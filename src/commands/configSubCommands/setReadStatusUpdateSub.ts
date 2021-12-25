import { CommandInteractionOptionResolver } from "discord.js";

import { GuildConfig, GuildLevel, MasterLevel } from "../../config/typesConfig";
import { SetConfigSubCommand, isRequiredOption } from "./setConfigSubCommand";

export class SetReadStatusUpdateSub extends SetConfigSubCommand<GuildConfig, "readStatusUpdate"> {
  constructor(level: MasterLevel | GuildLevel) {
    super(
      {
        name: "read-status-update",
        description: "GoLiveの開始時などに読み上げるかどうかの設定",
        options: [
          {
            name: "enable",
            description: "読み上げるかどうか",
            type: "BOOLEAN",
            required: isRequiredOption(level),
          },
        ],
      },
      level,
      "readStatusUpdate"
    );
  }

  getValueFromOptions(
    options: CommandInteractionOptionResolver,
    oldValue: Readonly<GuildConfig["readStatusUpdate"]> | undefined
  ): GuildConfig["readStatusUpdate"] | undefined {
    return options.getBoolean("enable") || undefined;
  }
}
