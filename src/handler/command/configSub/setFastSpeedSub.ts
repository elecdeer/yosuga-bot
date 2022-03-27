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

export class SetFastSpeedSub extends SetConfigSubCommandHandler<
  MasterLevel | GuildLevel,
  "fastSpeedScale"
> {
  constructor(yosuga: YosugaClient, level: MasterLevel | GuildLevel) {
    super(yosuga, level, "fastSpeedScale");
  }

  protected initCommandProps(): SubCommandProps {
    return {
      name: "fast-speed-scale",
      description: "早口の時の読み上げ速度倍率の設定",
      options: [
        {
          name: "value",
          description: "倍率（0.1 - 10）",
          type: "NUMBER",
          required: true,
        },
      ],
      permission: this.getPermissionLevel(),
    };
  }

  protected async getValueFromOptions(
    options: CommandInteraction["options"],
    oldValue: Readonly<ConfigEachLevel<MasterLevel | GuildLevel>["fastSpeedScale"]> | undefined
  ): Promise<ConfigEachLevel<MasterLevel | GuildLevel>["fastSpeedScale"] | undefined> {
    return options.getNumber("value") || undefined;
  }

  protected override async validateValue(
    value: ConfigEachLevel<MasterLevel | GuildLevel>["fastSpeedScale"] | undefined,
    context: Omit<CommandContextSlash, "replyMulti">
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
