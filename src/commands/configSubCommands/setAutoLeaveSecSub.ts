import { CommandInteractionOptionResolver } from "discord.js";

import { CommandContextSlash } from "../../commandContextSlash";
import { GuildConfig, GuildLevel, MasterLevel } from "../../config/typesConfig";
import { SetConfigSubCommand, isRequiredOption, ValidationResult } from "./setConfigSubCommand";

export class SetAutoLeaveSecSub extends SetConfigSubCommand<GuildConfig, "timeToAutoLeaveSec"> {
  constructor(level: MasterLevel | GuildLevel) {
    super(
      {
        name: "auto-leave-time",
        description: "自動退出までの秒数を設定",
        options: [
          {
            name: "value",
            description: "秒数",
            type: "NUMBER",
            required: isRequiredOption(level),
          },
        ],
      },
      level,
      "timeToAutoLeaveSec"
    );
  }

  override getValueFromOptions(
    options: CommandInteractionOptionResolver,
    oldValue: Readonly<GuildConfig["timeToAutoLeaveSec"]> | undefined
  ): GuildConfig["timeToAutoLeaveSec"] | undefined {
    return options.getNumber("value") || undefined;
  }

  override async validateValue(
    value: GuildConfig["timeToAutoLeaveSec"] | undefined,
    context: Omit<CommandContextSlash, "reply">
  ): Promise<ValidationResult> {
    if (value && value < 0) {
      return {
        status: "error",
        message: "設定する値は整数である必要があります.",
      };
    }
    return super.validateValue(value, context);
  }
}
