import { CommandInteractionOptionResolver } from "discord.js";

import { CommandContextSlash } from "../../commandContextSlash";
import { GuildConfig } from "../../config/configManager";
import { isInRange } from "../../util/util";
import {
  GuildLevel,
  isRequiredOption,
  MasterLevel,
  SetConfigSubCommand,
  ValidationResult,
} from "./setConfigSubCommand";

export class SetVolumeSub extends SetConfigSubCommand<GuildConfig, "masterVolume"> {
  constructor(level: MasterLevel | GuildLevel) {
    super(
      {
        name: "volume",
        description: "読み上げ音量の設定",
        options: [
          {
            name: "value",
            description: "音量（0 - 2）",
            type: "NUMBER",
            required: isRequiredOption(level),
          },
        ],
      },
      level,
      "masterVolume"
    );
  }

  getValueFromOptions(options: CommandInteractionOptionResolver): number | undefined {
    return options.getNumber("value") || undefined;
  }

  override async validateValue(
    value: GuildConfig["masterVolume"] | undefined,
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
