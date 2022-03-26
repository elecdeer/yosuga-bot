import { CommandInteraction } from "discord.js";

import { CommandContextSlash } from "../../../commandContextSlash";
import { ConfigEachLevel, GuildLevel, MasterLevel } from "../../../config/typesConfig";
import { isInRange } from "../../../util/util";
import { YosugaClient } from "../../../yosugaClient";
import {
  SetConfigSubCommandHandler,
  ValidationResult,
} from "../../base/setConfigSubCommandHandler";
import { SubCommandProps } from "../../base/subCommandHandler";

export class SetSpeedSub extends SetConfigSubCommandHandler<
  MasterLevel | GuildLevel,
  "masterSpeed"
> {
  constructor(yosuga: YosugaClient, level: MasterLevel | GuildLevel) {
    super(yosuga, level, "masterSpeed");
  }

  protected initCommandProps(): SubCommandProps {
    return {
      name: "speed",
      description: "読み上げ速度の設定",
      options: [
        {
          name: "value",
          description: "速度（0 - 2）",
          type: "NUMBER",
          required: true,
        },
      ],
      permission: this.getPermissionLevel(),
    };
  }

  protected async getValueFromOptions(
    options: CommandInteraction["options"],
    oldValue: Readonly<ConfigEachLevel<MasterLevel | GuildLevel>["masterSpeed"]> | undefined
  ): Promise<ConfigEachLevel<MasterLevel | GuildLevel>["masterSpeed"] | undefined> {
    return options.getNumber("value") || undefined;
  }

  protected override async validateValue(
    value: ConfigEachLevel<MasterLevel | GuildLevel>["masterSpeed"] | undefined,
    context: Omit<CommandContextSlash, "replyMulti">
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
