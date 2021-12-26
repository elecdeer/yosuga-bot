import { CommandInteractionOptionResolver } from "discord.js";

import { CommandContextSlash } from "../../commandContextSlash";
import { GuildConfig, GuildLevel, MasterLevel } from "../../config/typesConfig";
import { isInRange } from "../../util/util";
import { isRequiredOption, SetConfigSubCommand, ValidationResult } from "./setConfigSubCommand";

export class SetSpeedSub extends SetConfigSubCommand<MasterLevel | GuildLevel, "masterSpeed"> {
  constructor(level: MasterLevel | GuildLevel) {
    super(
      {
        name: "speed",
        description: "読み上げ速度の設定",
        options: [
          {
            name: "value",
            description: "速度（0 - 2）",
            type: "NUMBER",
            required: isRequiredOption(level),
          },
        ],
      },
      level,
      "masterSpeed"
    );
  }

  getValueFromOptions(
    options: CommandInteractionOptionResolver,
    oldValue: Readonly<GuildConfig["masterSpeed"]> | undefined
  ): GuildConfig["masterSpeed"] | undefined {
    return options.getNumber("value") || undefined;
  }

  override async validateValue(
    value: GuildConfig["masterSpeed"] | undefined,
    context: Omit<CommandContextSlash, "reply">
  ): Promise<ValidationResult> {
    if (value && !isInRange(value, 0, 2)) {
      return {
        status: "error",
        message: "設定する値は0 ~ 2の範囲内である必要があります.",
      };
    }
    return super.validateValue(value, context);
  }
}
