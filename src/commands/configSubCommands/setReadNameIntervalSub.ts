import { CommandInteractionOptionResolver } from "discord.js";

import { CommandContextSlash } from "../../commandContextSlash";
import { GuildConfig, GuildLevel, MasterLevel } from "../../config/typesConfig";
import { SetConfigSubCommand, isRequiredOption, ValidationResult } from "./setConfigSubCommand";

export class SetReadNameIntervalSub extends SetConfigSubCommand<
  MasterLevel | GuildLevel,
  "timeToReadMemberNameSec"
> {
  constructor(level: MasterLevel | GuildLevel) {
    super(
      {
        name: "read-name-interval",
        description: "連続で読み上げた場合でも名前を読み上げる様になるまでの秒数を設定",
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
      "timeToReadMemberNameSec"
    );
  }

  getValueFromOptions(
    options: CommandInteractionOptionResolver,
    oldValue: Readonly<GuildConfig["timeToReadMemberNameSec"]> | undefined
  ): GuildConfig["timeToReadMemberNameSec"] | undefined {
    return options.getNumber("value") || undefined;
  }

  override async validateValue(
    value: GuildConfig["timeToReadMemberNameSec"] | undefined,
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
