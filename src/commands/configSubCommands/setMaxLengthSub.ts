import { CommandInteractionOptionResolver } from "discord.js";

import { CommandContextSlash } from "../../commandContextSlash";
import { GuildConfig, GuildLevel, MasterLevel } from "../../config/typesConfig";
import { SetConfigSubCommand, isRequiredOption, ValidationResult } from "./setConfigSubCommand";

export class SetMaxLengthSub extends SetConfigSubCommand<GuildConfig, "maxStringLength"> {
  constructor(level: MasterLevel | GuildLevel) {
    super(
      {
        name: "max-string-length",
        description: "読み上げを省略しない最大文字数を設定",
        options: [
          {
            name: "value",
            description: "文字数",
            type: "NUMBER",
            required: isRequiredOption(level),
          },
        ],
      },
      level,
      "maxStringLength"
    );
  }

  override getValueFromOptions(
    options: CommandInteractionOptionResolver,
    oldValue: Readonly<GuildConfig["maxStringLength"]> | undefined
  ): GuildConfig["maxStringLength"] | undefined {
    return options.getNumber("value") || undefined;
  }

  override async validateValue(
    value: GuildConfig["maxStringLength"] | undefined,
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
