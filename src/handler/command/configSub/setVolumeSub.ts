import { CommandInteraction } from "discord.js";

import { CommandContextSlash } from "../../../commandContextSlash";
import { ValidationResult } from "../../../commands/configSubCommands/setConfigSubCommand";
import { ConfigEachLevel, GuildLevel, MasterLevel } from "../../../config/typesConfig";
import { isInRange } from "../../../util/util";
import { YosugaClient } from "../../../yosugaClient";
import { SetConfigSubCommandHandler } from "../../base/setConfigSubCommandHandler";
import { SubCommandProps } from "../../base/subCommandHandler";

export class SetVolumeSub extends SetConfigSubCommandHandler<
  MasterLevel | GuildLevel,
  "masterVolume"
> {
  constructor(yosuga: YosugaClient, level: MasterLevel | GuildLevel) {
    super(yosuga, level, "masterVolume");
  }

  protected initCommandProps(): SubCommandProps {
    return {
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
      permission: this.getPermissionLevel(),
    };
  }

  protected async getValueFromOptions(
    options: CommandInteraction["options"],
    oldValue: Readonly<ConfigEachLevel<MasterLevel | GuildLevel>["masterVolume"]> | undefined
  ): Promise<ConfigEachLevel<MasterLevel | GuildLevel>["masterVolume"] | undefined> {
    return options.getNumber("value") || undefined;
  }

  protected override async validateValue(
    value: ConfigEachLevel<MasterLevel | GuildLevel>["masterVolume"] | undefined,
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
