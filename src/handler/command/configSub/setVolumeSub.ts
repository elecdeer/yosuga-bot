import { isInRange } from "../../../util/util";
import { SetConfigSubCommandHandler } from "../../base/setConfigSubCommandHandler";

import type { CommandContextSlash } from "../../../commandContextSlash";
import type { ConfigEachLevel, GuildLevel, MasterLevel } from "../../../config/typesConfig";
import type { YosugaClient } from "../../../yosugaClient";
import type { ValidationResult } from "../../base/setConfigSubCommandHandler";
import type { SubCommandProps } from "../../base/subCommandHandler";
import type { CommandInteraction } from "discord.js";

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
    const num = options.getNumber("value");
    if (num === null) return undefined;
    return num;
  }

  protected override async validateValue(
    value: ConfigEachLevel<MasterLevel | GuildLevel>["masterVolume"] | undefined,
    context: Omit<CommandContextSlash, "replyMulti">
  ): Promise<ValidationResult> {
    if (value !== undefined && !isInRange(value, 0, 2)) {
      return {
        status: "error",
        message: "設定する値は0 ~ 2の範囲内である必要があります.",
      };
    }
    return super.validateValue(value, context);
  }
}
