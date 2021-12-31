import { CommandInteractionOptionResolver } from "discord.js";

import { GuildConfig, GuildLevel, MasterLevel } from "../../config/typesConfig";
import { SetConfigSubCommand, isRequiredOption } from "./setConfigSubCommand";

export class SetReadStatusUpdateSub extends SetConfigSubCommand<
  MasterLevel | GuildLevel,
  "readStatusUpdate"
> {
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

  override async getValueFromOptions(
    options: CommandInteractionOptionResolver,
    oldValue: Readonly<GuildConfig["readStatusUpdate"]> | undefined
  ): Promise<GuildConfig["readStatusUpdate"] | undefined> {
    return options.getBoolean("enable") || undefined;
  }
}
