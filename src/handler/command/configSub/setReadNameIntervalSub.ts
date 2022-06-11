import { SetConfigSubCommandHandler } from "../../base/setConfigSubCommandHandler";

import type { CommandContextSlash } from "../../../commandContextSlash";
import type { ConfigEachLevel, GuildLevel, MasterLevel } from "../../../config/typesConfig";
import type { YosugaClient } from "../../../yosugaClient";
import type { ValidationResult } from "../../base/setConfigSubCommandHandler";
import type { SubCommandProps } from "../../base/subCommandHandler";
import type { CommandInteraction } from "discord.js";

export class SetReadNameIntervalSub extends SetConfigSubCommandHandler<
  MasterLevel | GuildLevel,
  "timeToReadMemberNameSec"
> {
  constructor(yosuga: YosugaClient, level: MasterLevel | GuildLevel) {
    super(yosuga, level, "timeToReadMemberNameSec");
  }

  protected initCommandProps(): SubCommandProps {
    return {
      name: "read-name-interval",
      description: "連続で読み上げた場合でも名前を読み上げる様になるまでの秒数を設定",
      options: [
        {
          name: "value",
          description: "秒数",
          type: "NUMBER",
          required: true,
        },
      ],
      permission: this.getPermissionLevel(),
    };
  }

  protected async getValueFromOptions(
    options: CommandInteraction["options"],
    oldValue:
      | Readonly<ConfigEachLevel<MasterLevel | GuildLevel>["timeToReadMemberNameSec"]>
      | undefined
  ): Promise<ConfigEachLevel<MasterLevel | GuildLevel>["timeToReadMemberNameSec"] | undefined> {
    const num = options.getNumber("value");
    if (num === null) return undefined;
    return num;
  }

  protected override async validateValue(
    value: ConfigEachLevel<MasterLevel | GuildLevel>["timeToReadMemberNameSec"] | undefined,
    context: Omit<CommandContextSlash, "replyMulti">
  ): Promise<ValidationResult> {
    if (value !== undefined && value < 0) {
      return {
        status: "error",
        message: "設定する値は正の整数である必要があります.",
      };
    }
    return super.validateValue(value, context);
  }
}
