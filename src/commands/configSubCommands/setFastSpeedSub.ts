import { CommandInteractionOptionResolver } from "discord.js";

import { CommandContextSlash } from "../../commandContextSlash";
import { GuildConfig, GuildLevel, MasterLevel } from "../../config/typesConfig";
import { isInRange } from "../../util/util";
import { isRequiredOption, SetConfigSubCommand, ValidationResult } from "./setConfigSubCommand";

export class SetFastSpeedSub extends SetConfigSubCommand<GuildConfig, "fastSpeedScale"> {
  constructor(level: MasterLevel | GuildLevel) {
    super(
      {
        name: "fast-speed-scale",
        description: "早口の時の読み上げ速度倍率の設定",
        options: [
          {
            name: "value",
            description: "倍率（0.1 - 10）",
            type: "NUMBER",
            required: isRequiredOption(level),
          },
        ],
      },
      level,
      "fastSpeedScale"
    );
  }

  override getValueFromOptions(
    options: CommandInteractionOptionResolver,
    oldValue: Readonly<GuildConfig["fastSpeedScale"]> | undefined
  ): GuildConfig["fastSpeedScale"] | undefined {
    return options.getNumber("value") || undefined;
  }

  override async validateValue(
    value: GuildConfig["fastSpeedScale"] | undefined,
    context: Omit<CommandContextSlash, "reply">
  ): Promise<ValidationResult> {
    if (value && !isInRange(value, 0.1, 10)) {
      return {
        status: "error",
        message: "設定する値は0.1 ~ 10の範囲内である必要があります.",
      };
    }
    return super.validateValue(value, context);
  }
}
